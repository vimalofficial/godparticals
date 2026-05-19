import { PrismaClient, Product, ProductCategory } from '@prisma/client';

const prisma = new PrismaClient();

export const adminProductRepository = {
  // Create
  create: async (data: {
    name:        string;
    slug:        string;
    description: string;
    price:       number;
    stock:       number;
    thumbnail:   string;
    category:    ProductCategory;
    isActive:    boolean;
  }): Promise<Product> => {
    return prisma.product.create({ data });
  },

  // Read all (with soft-delete filter)
  findAll: async (): Promise<Product[]> => {
    return prisma.product.findMany({
      where:   { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Read one
  findById: async (id: string): Promise<Product | null> => {
    return prisma.product.findFirst({ where: { id, deletedAt: null } });
  },

  // Check slug uniqueness (for create / update)
  findBySlug: async (slug: string, excludeId?: string): Promise<Product | null> => {
    return prisma.product.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  },

  // Update
  update: async (
    id: string,
    data: Partial<{
      name:        string;
      slug:        string;
      description: string;
      price:       number;
      stock:       number;
      thumbnail:   string;
      category:    ProductCategory;
      isActive:    boolean;
    }>
  ): Promise<Product> => {
    return prisma.product.update({ where: { id }, data });
  },

  // Soft delete
  softDelete: async (id: string): Promise<Product> => {
    return prisma.product.update({
      where: { id },
      data:  { deletedAt: new Date(), isActive: false },
    });
  },
};