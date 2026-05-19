import { PrismaClient, Wishlist } from '@prisma/client';

const prisma = new PrismaClient();

const wishlistWithProduct = {
  include: {
    product: {
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        thumbnail: true,
        category: true,
        isActive: true,
      },
    },
  },
};

export const wishlistRepository = {
  // Get all active wishlist items for a user
  // findByUser: async (userId: string) => {
  //   return prisma.wishlist.findMany({
  //     where:   { userId, deletedAt: null },
  //     orderBy: { createdAt: 'desc' },
  //     ...wishlistWithProduct,
  //   });
  // },

  findByUser: async (userId: string) => {
    return prisma.wishlist.findMany({
      where: {
        userId,
        deletedAt: null,

        product: {
          deletedAt: null,
          isActive: true,
        },
      },

      orderBy: {
        createdAt: 'desc',
      },

      ...wishlistWithProduct,
    });
  },

  // Find one wishlist item by ID (must belong to user)
  findOne: async (wishlistItemId: string, userId: string): Promise<Wishlist | null> => {
    return prisma.wishlist.findFirst({
      where: { id: wishlistItemId, userId, deletedAt: null },
    });
  },

  // Check if product already in wishlist
  findExisting: async (userId: string, productId: string): Promise<Wishlist | null> => {
    return prisma.wishlist.findFirst({
      where: { userId, productId, deletedAt: null },
    });
  },

  // Add to wishlist
  create: async (userId: string, productId: string) => {
    return prisma.wishlist.create({
      data: { userId, productId },
      ...wishlistWithProduct,
    });
  },

  // Soft delete one item
  softDelete: async (wishlistItemId: string): Promise<void> => {
    await prisma.wishlist.update({
      where: { id: wishlistItemId },
      data: { deletedAt: new Date() },
    });
  },

  // Clear entire wishlist
  clearWishlist: async (userId: string): Promise<void> => {
    await prisma.wishlist.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  },
};