import { Request, Response } from 'express';
import { wishlistService } from './service';
import { addToWishlistSchema, wishlistItemIdSchema } from './validation';

const ok   = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const wishlistController = {
  // GET /api/v1/user/wishlist
  getWishlist: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }
    try {
      const result = await wishlistService.getWishlist(userId);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to fetch wishlist');
    }
  },

  // POST /api/v1/user/wishlist
  addToWishlist: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }

    const parsed = addToWishlistSchema.safeParse(req.body);
    if (!parsed.success) { fail(res, parsed.error.errors[0].message, 422); return; }

    try {
      const result = await wishlistService.addToWishlist(userId, parsed.data);
      ok(res, result, 201);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to add to wishlist');
    }
  },

  // DELETE /api/v1/user/wishlist/:wishlistItemId
  removeItem: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }

    const idParsed = wishlistItemIdSchema.safeParse(req.params);
    if (!idParsed.success) { fail(res, 'Invalid wishlist item ID', 422); return; }

    try {
      const result = await wishlistService.removeItem(userId, idParsed.data.wishlistItemId);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to remove item');
    }
  },

  // DELETE /api/v1/user/wishlist
  clearWishlist: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }
    try {
      const result = await wishlistService.clearWishlist(userId);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to clear wishlist');
    }
  },
};