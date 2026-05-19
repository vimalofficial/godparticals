import { Request, Response } from 'express';
import { cartService } from './service';
import { addToCartSchema, updateCartSchema, cartItemIdSchema } from './validation';

const ok   = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const cartController = {
  // GET /api/v1/user/cart
  getCart: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }
    try {
      const result = await cartService.getCart(userId);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to fetch cart');
    }
  },

  // POST /api/v1/user/cart
  addToCart: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }

    const parsed = addToCartSchema.safeParse(req.body);
    if (!parsed.success) { fail(res, parsed.error.errors[0].message, 422); return; }

    try {
      const result = await cartService.addToCart(userId, parsed.data);
      ok(res, result, 201);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to add to cart');
    }
  },

  // PUT /api/v1/user/cart/:cartItemId
  updateQuantity: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }

    const idParsed = cartItemIdSchema.safeParse(req.params);
    if (!idParsed.success) { fail(res, 'Invalid cart item ID', 422); return; }

    const parsed = updateCartSchema.safeParse(req.body);
    if (!parsed.success) { fail(res, parsed.error.errors[0].message, 422); return; }

    try {
      const result = await cartService.updateQuantity(userId, idParsed.data.cartItemId, parsed.data);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to update cart');
    }
  },

  // DELETE /api/v1/user/cart/:cartItemId
  removeItem: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }

    const idParsed = cartItemIdSchema.safeParse(req.params);
    if (!idParsed.success) { fail(res, 'Invalid cart item ID', 422); return; }

    try {
      const result = await cartService.removeItem(userId, idParsed.data.cartItemId);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to remove item');
    }
  },

  // DELETE /api/v1/user/cart
  clearCart: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }
    try {
      const result = await cartService.clearCart(userId);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to clear cart');
    }
  },
};