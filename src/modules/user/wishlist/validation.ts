import { z } from 'zod';

export const addToWishlistSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
});

export const wishlistItemIdSchema = z.object({
  wishlistItemId: z.string().uuid('Invalid wishlist item ID'),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;