import { Router } from 'express';
import { paymentController } from './controller';
import { authMiddleware } from '../../../middlewares/auth';

const router = Router();

// All payment routes require authentication
router.use(authMiddleware);

/**
 * @route  POST /api/v1/user/payment/create-order
 * @desc   Validate cart, create Razorpay order, insert DB rows
 * @body   { items: [{productId, quantity}], fullName, phoneNumber, address, city, state, pincode }
 * @returns razorpayOrderId, amount (paise), currency, keyId — pass these to Razorpay checkout
 */
router.post('/create-order', paymentController.createOrder);

/**
 * @route  POST /api/v1/user/payment/verify
 * @desc   Verify Razorpay signature after payment, mark orders PAID
 * @body   { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
router.post('/verify', paymentController.verifyPayment);

/**
 * @route  GET /api/v1/user/payment/orders
 * @desc   List all orders placed by the authenticated user
 */
router.get('/orders', paymentController.getMyOrders);

/**
 * @route  GET /api/v1/user/payment/orders/:orderId
 * @desc   Get a single order detail
 */
router.get('/orders/:orderId', paymentController.getOrderById);

/**
 * @route  PATCH /api/v1/user/payment/orders/:orderId/cancel
 * @desc   Cancel a PENDING order
 */
router.patch('/orders/:orderId/cancel', paymentController.cancelOrder);

export default router;