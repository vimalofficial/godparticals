import { z } from 'zod';

export const getProductsSchema = z.object({
  // category filter — matches the enum exactly
  category: z
    .enum(['CORE', 'HOME_APPLIANCE', 'ELECTRONICS', 'FASHION'])
    .optional(),

  // free-text search on name / description
  search: z.string().optional(),

  // pagination
  page:  z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type GetProductsInput = z.infer<typeof getProductsSchema>;