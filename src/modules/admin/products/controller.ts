import { Request, Response } from 'express';
import { adminProductService } from './service';
import { createProductSchema, updateProductSchema, productIdSchema } from './validation';

const ok   = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const adminProductController = {
  // POST /api/v1/admin/products
  createProduct: async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      fail(res, 'Product thumbnail image is required.', 422);
      return;
    }

    // multer puts text fields in req.body even with multipart
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, parsed.error.errors[0].message, 422);
      return;
    }

    try {
      const product = await adminProductService.createProduct(parsed.data, req.file);
      ok(res, product, 201);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to create product');
    }
  },

  // GET /api/v1/admin/products
  getAllProducts: async (_req: Request, res: Response): Promise<void> => {
    try {
      const products = await adminProductService.getAllProducts();
      ok(res, products);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to fetch products');
    }
  },

  // GET /api/v1/admin/products/:id
  getProductById: async (req: Request, res: Response): Promise<void> => {
    const parsed = productIdSchema.safeParse(req.params);
    if (!parsed.success) { fail(res, 'Invalid product ID', 422); return; }

    try {
      const product = await adminProductService.getProductById(parsed.data.id);
      ok(res, product);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to fetch product', 404);
    }
  },

  // PUT /api/v1/admin/products/:id
  // updateProduct: async (req: Request, res: Response): Promise<void> => {
  //   const idParsed = productIdSchema.safeParse(req.params);
  //   if (!idParsed.success) { fail(res, 'Invalid product ID', 422); return; }

  //   const parsed = updateProductSchema.safeParse(req.body);
  //   if (!parsed.success) {
  //     fail(res, parsed.error.errors[0].message, 422);
  //     return;
  //   }

  //   try {
  //     const product = await adminProductService.updateProduct(
  //       idParsed.data.id,
  //       parsed.data,
  //       req.file   // optional new image
  //     );
  //     ok(res, product);
  //   } catch (e: unknown) {
  //     fail(res, e instanceof Error ? e.message : 'Failed to update product');
  //   }
  // },

  // PUT /api/v1/admin/products/:id
updateProduct: async (
  req: Request,
  res: Response
): Promise<void> => {

  // Convert string to boolean
  if (req.body.isActive !== undefined) {

    req.body.isActive =
      req.body.isActive === "true";
  }

  const idParsed =
    productIdSchema.safeParse(req.params);

  if (!idParsed.success) {
    fail(res, "Invalid product ID", 422);
    return;
  }

  const parsed =
    updateProductSchema.safeParse(req.body);

  if (!parsed.success) {
    fail(
      res,
      parsed.error.errors[0].message,
      422
    );
    return;
  }

  try {

    const product =
      await adminProductService.updateProduct(
        idParsed.data.id,
        parsed.data,
        req.file
      );

    ok(res, product);

  } catch (e: unknown) {

    fail(
      res,
      e instanceof Error
        ? e.message
        : "Failed to update product"
    );
  }
},

  // DELETE /api/v1/admin/products/:id
  deleteProduct: async (req: Request, res: Response): Promise<void> => {
    const parsed = productIdSchema.safeParse(req.params);
    if (!parsed.success) { fail(res, 'Invalid product ID', 422); return; }

    try {
      const result = await adminProductService.deleteProduct(parsed.data.id);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to delete product', 404);
    }
  },
};