import { userProductRepository } from './repository';
import { GetProductsInput } from './validation';

export const userProductService = {
  getProducts: async (
  input: GetProductsInput,
  userId?: string
) => {

  const { category, search, page, limit } = input;

  const result =
    await userProductRepository.findProducts({
      category,
      search,
      page,
      limit,
      userId,
    });

  return {
    products: result.data,

    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      total_pages: result.total_pages,
    },
  };
},

  getProductBySlug: async (slug: string) => {
    const product = await userProductRepository.findBySlug(slug);
    if (!product) throw new Error('Product not found.');
    return product;
  },

 getProductById: async (
  productId: string,
  userId: string
) => {

  const [product, cartItem, wishlistItem] =
    await Promise.all([

      userProductRepository.findById(productId),

      userProductRepository.findCartItem(
        userId,
        productId
      ),

      userProductRepository.findWishlistItem(
        userId,
        productId
      ),

    ]);

  if (!product) {
    throw new Error('Product not found.');
  }

  return {
    ...product,

    is_cart: !!cartItem,
    is_wishlist: !!wishlistItem,
  };
},


};