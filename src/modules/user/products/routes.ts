import { Router } from 'express';
import { userProductController } from './controller';
// import { authMiddleware } from '@/middlewares/auth';

import { authMiddleware } from '../../../middlewares/auth';
// import { optionalAuthMiddleware } from '@/middlewares/optionalAuthMiddleware';
import { optionalAuthMiddleware } from '../../../middlewares/optionalAuthMiddleware';

const router = Router();

/**
 * @route  GET /api/v1/user/products
 * @desc   Browse products with optional filters + pagination
 * @access Public
 *
 * Query params:
 *   category  — CORE | HOME_APPLIANCE | ELECTRONICS | FASHION  (optional)
 *   search    — free text search on name & description          (optional)
 *   page      — page number, default 1                          (optional)
 *   limit     — items per page, default 10, max 100             (optional)
 *
 * Response:
 *   { success, data: Product[], meta: { total, page, limit, total_pages } }
 */
// router.get('/', userProductController.getProducts);

router.get(
  '/',
  optionalAuthMiddleware,
  userProductController.getProducts
);

/**
 * @route  GET /api/v1/user/products/:slug
 * @desc   Get a single product by slug
 * @access Public
 */
router.get('/:slug', userProductController.getProductBySlug);


router.get(
  '/individualitem/:id',
  authMiddleware,
  userProductController.getProductById
);


export default router;