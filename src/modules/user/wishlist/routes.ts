import { Router } from 'express';
import { wishlistController } from './controller';
import { authMiddleware } from '../../../middlewares/auth';

const router = Router();

router.use(authMiddleware);

// GET    /api/v1/user/wishlist                    — get my wishlist
router.get('/',                   wishlistController.getWishlist);

// POST   /api/v1/user/wishlist                    — add item { productId }
router.post('/',                  wishlistController.addToWishlist);

// DELETE /api/v1/user/wishlist/:wishlistItemId     — remove one item
router.delete('/:wishlistItemId', wishlistController.removeItem);

// DELETE /api/v1/user/wishlist                    — clear entire wishlist
router.delete('/',                wishlistController.clearWishlist);

export default router;