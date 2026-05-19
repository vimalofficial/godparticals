import { Router } from 'express';
import { cartController } from './controller';
import { authMiddleware } from '../../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

// GET    /api/v1/user/cart               — get my cart with summary
router.get('/',                 cartController.getCart);

// POST   /api/v1/user/cart               — add item { productId, quantity }
router.post('/',                cartController.addToCart);

// PUT    /api/v1/user/cart/:cartItemId   — update quantity { quantity }
router.put('/:cartItemId',      cartController.updateQuantity);

// DELETE /api/v1/user/cart/:cartItemId   — remove one item
router.delete('/:cartItemId',   cartController.removeItem);

// DELETE /api/v1/user/cart               — clear entire cart
router.delete('/',              cartController.clearCart);

export default router;