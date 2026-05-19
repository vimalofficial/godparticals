import { z } from 'zod';

const ProductCategoryEnum = z.enum(['CORE', 'HOME_APPLIANCE', 'ELECTRONICS', 'FASHION']);

export const createProductSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price:       z.coerce.number().positive('Price must be positive'),
  stock:       z.coerce.number().int().nonnegative('Stock cannot be negative'),
  category:    ProductCategoryEnum,
  isActive:    z.coerce.boolean().optional().default(true),
});

export const updateProductSchema = z.object({
  name:        z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  price:       z.coerce.number().positive().optional(),
  stock:       z.coerce.number().int().nonnegative().optional(),
  category:    ProductCategoryEnum.optional(),
  isActive:    z.coerce.boolean().optional(),
});

export const productIdSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;