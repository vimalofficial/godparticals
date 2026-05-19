import { Request, Response } from 'express';
import { paymentService } from './service';
import {
  createOrderSchema,
  verifyPaymentSchema,
  orderIdSchema,
} from './validation';

const ok   = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const paymentController = {
  // POST /api/v1/user/payment/create-order
  createOrder: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }

    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, parsed.error.errors[0].message, 422);
      return;
    }

    try {
      const result = await paymentService.createOrder(userId, parsed.data);
      ok(res, result, 201);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to create order');
    }
  },

  // POST /api/v1/user/payment/verify
  verifyPayment: async (
  req: Request,
  res: Response
): Promise<void> => {

  const userId = req.user?.id;

  if (!userId) {
    fail(res, 'Unauthorized', 401);
    return;
  }

  const parsed =
    verifyPaymentSchema.safeParse(req.body);

  if (!parsed.success) {
    fail(res, parsed.error.errors[0].message, 422);
    return;
  }

  try {

    const result =
      await paymentService.verifyPayment(
        parsed.data,
        userId
      );

    ok(res, result);

  } catch (e: unknown) {

    fail(
      res,
      e instanceof Error
        ? e.message
        : 'Payment verification failed',
      400
    );

  }
},

  // GET /api/v1/user/payment/orders
  getMyOrders: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }

    try {
      const orders = await paymentService.getMyOrders(userId);
      ok(res, orders);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to fetch orders');
    }
  },

  // GET /api/v1/user/payment/orders/:orderId
  getOrderById: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }

    const parsed = orderIdSchema.safeParse(req.params);
    if (!parsed.success) { fail(res, 'Invalid order ID', 422); return; }

    try {
      const order = await paymentService.getOrderById(userId, parsed.data.orderId);
      ok(res, order);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Order not found', 404);
    }
  },

  // PATCH /api/v1/user/payment/orders/:orderId/cancel
  cancelOrder: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }

    const parsed = orderIdSchema.safeParse(req.params);
    if (!parsed.success) { fail(res, 'Invalid order ID', 422); return; }

    try {
      const result = await paymentService.cancelOrder(userId, parsed.data.orderId);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to cancel order', 400);
    }
  },
};