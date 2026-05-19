import { Request, Response } from 'express';
import { userProductService } from './service';
import { getProductsSchema } from './validation';

const ok   = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, ...data as object });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const userProductController = {

  // GET /api/v1/user/products

getProducts: async (
  req: Request,
  res: Response
): Promise<void> => {

  const parsed = getProductsSchema.safeParse(req.query);

  if (!parsed.success) {
    fail(res, parsed.error.errors[0].message, 422);
    return;
  }

  try {

    const userId = req.user?.id;

    const result =
      await userProductService.getProducts(
        parsed.data,
        userId
      );

    res.status(200).json({
      success: true,
      data: result.products,
      meta: result.meta,
    });

  } catch (e: unknown) {

    fail(
      res,
      e instanceof Error
        ? e.message
        : 'Failed to fetch products'
    );

  }
},

  // GET /api/v1/user/products/:slug
  getProductBySlug: async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    if (!slug) { fail(res, 'Slug is required', 422); return; }

    try {
      const product = await userProductService.getProductBySlug(slug);
      res.status(200).json({ success: true, data: product });
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Product not found', 404);
    }
  },


// GET /api/v1/user/products/individualitem/:id

getProductById: async (
  req: Request,
  res: Response
): Promise<void> => {

  const { id } = req.params;

  const userId = req.user?.id;

  if (!id) {
    fail(res, 'Product ID is required', 422);
    return;
  }

  if (!userId) {
    fail(res, 'Unauthorized', 401);
    return;
  }

  try {

    const product =
      await userProductService.getProductById(
        id,
        userId
      );

    res.status(200).json({
      success: true,
      data: product,
    });

  } catch (e: unknown) {

    fail(
      res,
      e instanceof Error
        ? e.message
        : 'Product not found',
      404
    );

  }
},

};