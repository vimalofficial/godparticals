import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export const userRepository = {
  findByEmail: async (email: string): Promise<User | null> => {
    return prisma.user.findUnique({ where: { email } });
  },

  findById: async (id: string): Promise<User | null> => {
    return prisma.user.findUnique({ where: { id } });
  },

  createUser: async (data: { email: string; name?: string }): Promise<User> => {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name ?? '',
        password: '',
        isVerified: false,
      },
    });
  },

  updateUser: async (
    id: string,
    data: Partial<{
      name: string;
      password: string;
      isVerified: boolean;
      refreshToken: string | null;
    }>
  ): Promise<User> => {
    return prisma.user.update({ where: { id }, data });
  },

  clearRefreshToken: async (id: string): Promise<void> => {
    await prisma.user.update({ where: { id }, data: { refreshToken: null } });
  },
};