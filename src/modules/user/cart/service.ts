import { cartRepository } from './repository';
import { AddToCartInput, UpdateCartInput } from './validation';

export const cartService = {
  // GET — list cart with totals
  getCart: async (userId: string) => {
    const items = await cartRepository.findByUser(userId);

    const cartTotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return {
      items,
      summary: {
        totalItems:    items.reduce((sum, i) => sum + i.quantity, 0),
        totalAmount:   parseFloat(cartTotal.toFixed(2)),
        itemCount:     items.length,
      },
    };
  },

  // POST — add to cart (if already exists, increment quantity)
  addToCart: async (userId: string, input: AddToCartInput) => {
    const { productId, quantity } = input;

    const existing = await cartRepository.findExisting(userId, productId);

    if (existing) {
      // Already in cart — increment quantity
      return cartRepository.update(existing.id, existing.quantity + quantity);
    }

    return cartRepository.create(userId, productId, quantity);
  },

  // PUT — update quantity
  updateQuantity: async (userId: string, cartItemId: string, input: UpdateCartInput) => {
    const item = await cartRepository.findOne(cartItemId, userId);
    if (!item) throw new Error('Cart item not found.');

    return cartRepository.update(cartItemId, input.quantity);
  },

  // DELETE — remove one item
  removeItem: async (userId: string, cartItemId: string) => {
    const item = await cartRepository.findOne(cartItemId, userId);
    if (!item) throw new Error('Cart item not found.');

    await cartRepository.softDelete(cartItemId);
    return { message: 'Item removed from cart.' };
  },

  // DELETE — clear entire cart
  clearCart: async (userId: string) => {
    await cartRepository.clearCart(userId);
    return { message: 'Cart cleared.' };
  },
};