import { PrismaClient, Cart } from '@prisma/client';

const prisma = new PrismaClient();

// Cart item with product details joined
const cartWithProduct = {
  include: {
    product: {
      select: {
        id:        true,
        name:      true,
        slug:      true,
        price:     true,
        thumbnail: true,
        stock:     true,
        isActive:  true,
      },
    },
  },
};

export const cartRepository = {
  // Get all active cart items for a user
  findByUser: async (userId: string) => {
    return prisma.cart.findMany({
      where:   { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      ...cartWithProduct,
    });
  },

  // Find one cart item by ID (must belong to user)
  findOne: async (cartItemId: string, userId: string): Promise<Cart | null> => {
    return prisma.cart.findFirst({
      where: { id: cartItemId, userId, deletedAt: null },
    });
  },

  // Check if product already in cart
  findExisting: async (userId: string, productId: string): Promise<Cart | null> => {
    return prisma.cart.findFirst({
      where: { userId, productId, deletedAt: null },
    });
  },

  // Add item to cart
  create: async (userId: string, productId: string, quantity: number) => {
    return prisma.cart.create({
      data: { userId, productId, quantity },
      ...cartWithProduct,
    });
  },

  // Update quantity
  update: async (cartItemId: string, quantity: number) => {
    return prisma.cart.update({
      where: { id: cartItemId },
      data:  { quantity },
      ...cartWithProduct,
    });
  },

  // Soft delete one item
  softDelete: async (cartItemId: string): Promise<void> => {
    await prisma.cart.update({
      where: { id: cartItemId },
      data:  { deletedAt: new Date() },
    });
  },

  // Clear entire cart (soft delete all)
  clearCart: async (userId: string): Promise<void> => {
    await prisma.cart.updateMany({
      where: { userId, deletedAt: null },
      data:  { deletedAt: new Date() },
    });
  },
};