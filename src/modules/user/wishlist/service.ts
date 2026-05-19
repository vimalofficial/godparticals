import { wishlistRepository } from './repository';
import { AddToWishlistInput } from './validation';

export const wishlistService = {
  // GET — list wishlist items
  getWishlist: async (userId: string) => {
    const items = await wishlistRepository.findByUser(userId);
    return { items, totalItems: items.length };
  },

  // POST — add to wishlist (ignore if already exists)
  addToWishlist: async (userId: string, input: AddToWishlistInput) => {
    const existing = await wishlistRepository.findExisting(userId, input.productId);
    if (existing) throw new Error('Product already in wishlist.');

    return wishlistRepository.create(userId, input.productId);
  },

  // DELETE — remove one item
  removeItem: async (userId: string, wishlistItemId: string) => {
    const item = await wishlistRepository.findOne(wishlistItemId, userId);
    if (!item) throw new Error('Wishlist item not found.');

    await wishlistRepository.softDelete(wishlistItemId);
    return { message: 'Item removed from wishlist.' };
  },

  // DELETE — clear entire wishlist
  clearWishlist: async (userId: string) => {
    await wishlistRepository.clearWishlist(userId);
    return { message: 'Wishlist cleared.' };
  },
};