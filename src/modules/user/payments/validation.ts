import { z } from 'zod';

// ── Single cart item ──────────────────────────────────────────────────────────
const cartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity:  z.number().int().positive('Quantity must be at least 1'),
});

// ── Create Order (initiate Razorpay) ─────────────────────────────────────────
export const createOrderSchema = z.object({
  items: z
    .array(cartItemSchema)
    .min(1, 'Cart must have at least one item'),

  // Delivery address
  fullName:    z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  address:     z.string().min(5, 'Address is required'),
  city:        z.string().min(2, 'City is required'),
  state:       z.string().min(2, 'State is required'),
  pincode:     z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),

  from_cart: z.boolean().optional(),
});

// ── Cancel an order ───────────────────────────────────────────────────────────
export const orderIdSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
});

export type CreateOrderInput  = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;