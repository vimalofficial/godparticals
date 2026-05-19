import {
  Prisma,
  PrismaClient,
  Product,
  ProductCategory,
} from '@prisma/client';



const prisma = new PrismaClient();


interface FindProductsOptions {
  category?: string;
  search?: string;
  page: number;
  limit: number;

  userId?: string;
}

export interface ProductWithMeta {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  thumbnail: string | null;
  category: ProductCategory;
  createdAt: Date;

  is_cart: boolean;
  is_wishlist: boolean;
}

export interface PaginatedProducts {
  data: ProductWithMeta[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const userProductRepository = {
  findProducts: async (
  opts: FindProductsOptions
): Promise<PaginatedProducts> => {

  const {
    category,
    search,
    page,
    limit,
    userId,
  } = opts;

  const skip = (page - 1) * limit;

 const where: Prisma.ProductWhereInput = {
  isActive: true,
  deletedAt: null,

  ...(category
    ? {
        category: category as ProductCategory,
      }
    : {}),

  ...(search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }
    : {}),
};

  const [products, total] = await Promise.all([

    prisma.product.findMany({
      where,
      skip,
      take: limit,

      orderBy: {
        createdAt: 'desc',
      },

      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        stock: true,
        thumbnail: true,
        category: true,
        createdAt: true,
      },
    }),

    prisma.product.count({ where }),

  ]);

  // NO TOKEN
  if (!userId) {

    return {
      data: products.map((product) => ({
        ...product,

        is_cart: false,
        is_wishlist: false,
      })),

      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  // TOKEN EXISTS

  const productIds = products.map((p) => p.id);

  const [cartItems, wishlistItems] =
    await Promise.all([

      prisma.cart.findMany({
        where: {
          userId,
          productId: {
            in: productIds,
          },
          deletedAt: null,
        },
        select: {
          productId: true,
        },
      }),

      prisma.wishlist.findMany({
        where: {
          userId,
          productId: {
            in: productIds,
          },
          deletedAt: null,
        },
        select: {
          productId: true,
        },
      }),

    ]);

  const cartSet = new Set(
    cartItems.map((item) => item.productId)
  );

  const wishlistSet = new Set(
    wishlistItems.map((item) => item.productId)
  );

  return {

    data: products.map((product) => ({
      ...product,

      is_cart: cartSet.has(product.id),

      is_wishlist: wishlistSet.has(product.id),
    })),

    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  };
},

  findBySlug: async (slug: string) => {
    return prisma.product.findFirst({
      where: { slug, isActive: true, deletedAt: null },
    });
  },

  findById: async (id: string) => {
  return prisma.product.findFirst({
    where: {
      id,
      isActive: true,
      deletedAt: null,
    },
  });
},

findCartItem: async (
  userId: string,
  productId: string
) => {

  return prisma.cart.findFirst({
    where: {
      userId,
      productId,
      deletedAt: null,
    },
  });

},

findWishlistItem: async (
  userId: string,
  productId: string
) => {

  return prisma.wishlist.findFirst({
    where: {
      userId,
      productId,
      deletedAt: null,
    },
  });

},


};