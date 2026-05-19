import { PrismaClient, Order, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateOrderRow {
  userId:            string;
  productId:         string;
  quantity:          number;
  totalAmount:       number;
  fullName:          string;
  phoneNumber:       string;
  address:           string;
  city:              string;
  state:             string;
  pincode:           string;
  razorpayOrderId:   string;
}

export const paymentRepository = {
  // ── Create many order rows (one per cart item) in a transaction ─────────────
  createOrders: async (rows: CreateOrderRow[]): Promise<Order[]> => {
    return prisma.$transaction(
      rows.map((row) => prisma.order.create({ data: row }))
    );
  },

  // ── Find all orders sharing the same razorpayOrderId ──────────────────────
  findByRazorpayOrderId: async (
  razorpayOrderId: string,
  userId: string
): Promise<Order[]> => {

  return prisma.order.findMany({
    where: {
      razorpayOrderId,
      userId,
    },
  });
},

removeCartItems: async (
  userId: string,
  productIds: string[]
): Promise<void> => {

  await prisma.cart.deleteMany({
    where: {
      userId,

      productId: {
        in: productIds,
      },
    },
  });

},


  // ── Mark all orders for a razorpayOrderId as PAID ─────────────────────────
  markPaid: async (
    razorpayOrderId:   string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<void> => {
    await prisma.order.updateMany({
      where: { razorpayOrderId },
      data:  {
        paymentStatus:     OrderStatus.PAID,
        razorpayPaymentId,
        razorpaySignature,
      },
    });
  },

  // ── Mark all orders for a razorpayOrderId as FAILED ───────────────────────
  markFailed: async (razorpayOrderId: string): Promise<void> => {
    await prisma.order.updateMany({
      where: { razorpayOrderId },
      data:  { paymentStatus: OrderStatus.FAILED },
    });
  },

  // ── Cancel a single order (only if PENDING) ────────────────────────────────
  cancelOrder: async (orderId: string, userId: string): Promise<Order | null> => {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId, paymentStatus: OrderStatus.PENDING },
    });
    if (!order) return null;

    return prisma.order.update({
      where: { id: orderId },
      data:  { paymentStatus: OrderStatus.CANCELLED },
    });
  },

  // ── Get all orders for a user ──────────────────────────────────────────────
  findByUser: async (userId: string): Promise<Order[]> => {
    return prisma.order.findMany({
      where:   { userId },
      include: { product: { select: { name: true, thumbnail: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  // ── Get a single order (must belong to the user) ───────────────────────────
  findOne: async (orderId: string, userId: string): Promise<Order | null> => {
    return prisma.order.findFirst({
      where:   { id: orderId, userId },
      include: { product: { select: { name: true, thumbnail: true, slug: true } } },
    });
  },

  // ── Fetch product price + stock for cart validation ────────────────────────
  findProducts: async (productIds: string[]) => {
    return prisma.product.findMany({
      where:  { id: { in: productIds }, isActive: true, deletedAt: null },
      select: { id: true, name: true, price: true, stock: true },
    });
  },
};