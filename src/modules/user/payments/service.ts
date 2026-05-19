import Razorpay from 'razorpay';
import crypto from 'crypto';
import { paymentRepository } from './repository';
import { CreateOrderInput, VerifyPaymentInput } from './validation';

// ── Razorpay client ───────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const paymentService = {
  /**
   * STEP 1 — Create Order
   *
   * Flow:
   *  1. Validate all products exist and have enough stock
   *  2. Calculate per-item totals and grand total
   *  3. Create a single Razorpay order for the grand total
   *  4. Insert one Order DB row per cart item (all share the same razorpayOrderId)
   *  5. Return the Razorpay order details so the frontend can open the checkout
   */
  createOrder: async (userId: string, input: CreateOrderInput) => {
    const { items, fullName, phoneNumber, address, city, state, pincode } = input;

    // 1. Fetch all products in one query
    const productIds = items.map((i) => i.productId);
    const products   = await paymentRepository.findProducts(productIds);

    // 2. Validate every item
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found or is inactive.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}.`
        );
      }
    }

    // 3. Calculate totals
    const lineItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        productId:   item.productId,
        quantity:    item.quantity,
        totalAmount: parseFloat((product.price * item.quantity).toFixed(2)),
      };
    });

    const grandTotal = lineItems.reduce((sum, l) => sum + l.totalAmount, 0);

    // 4. Create a single Razorpay order (amount is in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount:   Math.round(grandTotal * 100),   // paise
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
      notes:    { userId },
    });

    // 5. Insert DB rows (one per cart item)
    const orderRows = lineItems.map((line) => ({
      userId,
      productId:       line.productId,
      quantity:        line.quantity,
      totalAmount:     line.totalAmount,
      fullName,
      phoneNumber,
      address,
      city,
      state,
      pincode,
      razorpayOrderId: razorpayOrder.id,
    }));

    const createdOrders = await paymentRepository.createOrders(orderRows);

    return {
      // Return to frontend to open Razorpay checkout
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,          // paise
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
      orders:          createdOrders.map((o) => ({ id: o.id, productId: o.productId })),
    };
  },

  /**
   * STEP 2 — Verify Payment
   *
   * Razorpay sends razorpayOrderId + razorpayPaymentId + razorpaySignature
   * after the user completes payment on the checkout modal.
   *
   * We verify the HMAC-SHA256 signature, then mark all matching DB rows as PAID.
   */
  verifyPayment: async (
  input: VerifyPaymentInput,
  userId: string
) => {

  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    from_cart,
  } = input;

  // Verify Signature

  const body =
    `${razorpayOrderId}|${razorpayPaymentId}`;

  const expected = crypto
    .createHmac(
      'sha256',
      process.env.RAZORPAY_KEY_SECRET!
    )
    .update(body)
    .digest('hex');

  if (expected !== razorpaySignature) {

    await paymentRepository.markFailed(
      razorpayOrderId
    );

    throw new Error(
      'Payment verification failed. Invalid signature.'
    );
  }

  // Mark PAID

  await paymentRepository.markPaid(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  // Get Orders using order id + user id

  const orders =
    await paymentRepository.findByRazorpayOrderId(
      razorpayOrderId,
      userId
    );

  // Remove cart items

  if (from_cart) {

    const productIds = orders.map(
      (o) => o.productId
    );

    await paymentRepository.removeCartItems(
      userId,
      productIds
    );
  }

  return {

    message:
      'Payment verified successfully.',

    orders: orders.map((o) => ({
      id: o.id,
      productId: o.productId,
      paymentStatus: o.paymentStatus,
    })),
  };
},
  /**
   * Cancel a pending order.
   */
  cancelOrder: async (userId: string, orderId: string) => {
    const order = await paymentRepository.cancelOrder(orderId, userId);
    if (!order) throw new Error('Order not found or cannot be cancelled (only PENDING orders can be cancelled).');
    return { message: 'Order cancelled.', orderId: order.id };
  },

  /**
   * Get all orders for the authenticated user.
   */
  getMyOrders: async (userId: string) => {
    return paymentRepository.findByUser(userId);
  },

  /**
   * Get a single order detail.
   */
  getOrderById: async (userId: string, orderId: string) => {
    const order = await paymentRepository.findOne(orderId, userId);
    if (!order) throw new Error('Order not found.');
    return order;
  },
};