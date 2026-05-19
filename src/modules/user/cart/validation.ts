import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity:  z.number().int().positive('Quantity must be at least 1').default(1),
});

export const updateCartSchema = z.object({
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const cartItemIdSchema = z.object({
  cartItemId: z.string().uuid('Invalid cart item ID'),
});

export type AddToCartInput    = z.infer<typeof addToCartSchema>;
export type UpdateCartInput   = z.infer<typeof updateCartSchema>;