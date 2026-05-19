import { Router } from 'express';
import multer from 'multer';
import { adminProductController } from './controller';
// import { authMiddleware } from '../../middlewares/auth';
// import { adminRoleMiddleware } from '../../middlewares/adminRole';

import { authMiddleware } from '../../../middlewares/auth';
import { adminRoleMiddleware } from '../../../middlewares/adminRole';

// ── Multer — memory storage (buffer sent straight to Supabase S3) ─────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },   // 5 MB hard cap
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only jpeg, png, webp, gif are allowed.'));
    }
  },
});

const router = Router();

// All admin product routes require authentication + admin role
router.use(authMiddleware, adminRoleMiddleware);

/**
 * @route  POST /api/v1/admin/products
 * @desc   Create a new product  (multipart/form-data — includes thumbnail image)
 * @body   name, description, price, stock, category, isActive?, thumbnail (file)
 */
router.post('/', upload.single('thumbnail'), adminProductController.createProduct);

/**
 * @route  GET /api/v1/admin/products
 * @desc   List all products (including inactive, excluding soft-deleted)
 */
router.get('/', adminProductController.getAllProducts);

/**
 * @route  GET /api/v1/admin/products/:id
 * @desc   Get a single product by ID
 */
router.get('/:id', adminProductController.getProductById);

/**
 * @route  PUT /api/v1/admin/products/:id
 * @desc   Update a product  (multipart/form-data — thumbnail is optional)
 * @body   Any subset of: name, description, price, stock, category, isActive, thumbnail (file)
 */
router.put('/:id', upload.single('thumbnail'), adminProductController.updateProduct);

/**
 * @route  DELETE /api/v1/admin/products/:id
 * @desc   Soft-delete a product (also removes image from bucket)
 */
router.delete('/:id', adminProductController.deleteProduct);

export default router;