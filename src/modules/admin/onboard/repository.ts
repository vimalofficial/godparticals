import { PrismaClient, Admin } from '@prisma/client';

const prisma = new PrismaClient();

export const adminRepository = {
  findByEmail: async (email: string): Promise<Admin | null> => {
    return prisma.admin.findUnique({ where: { email } });
  },

  findById: async (id: string): Promise<Admin | null> => {
    return prisma.admin.findUnique({ where: { id } });
  },

  createAdmin: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<Admin> => {
    return prisma.admin.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        isActive: true,
      },
    });
  },

  // updateAdmin: async (
  //   id: string,
  //   data: Partial<{
  //     refreshToken: string | null;
  //     lastLoginAt: Date;
  //     isActive: boolean;
  //   }>
  // ): Promise<Admin> => {
  //   return prisma.admin.update({ where: { id }, data });
  // },
  
//   updateAdmin: async (
//   id: string,
//   data: Partial<{
//     lastLoginAt: Date;
//     isActive: boolean;
//   }>
// ): Promise<Admin> => {
//   return prisma.admin.update({
//     where: { id },
//     data,
//   });
// },

updateAdmin: async (
  id: string,
  data: Partial<{
    lastLoginAt: Date;
    isActive: boolean;
  }>
): Promise<Admin> => {
  return prisma.admin.update({
    where: { id },
    data: {
      ...data,
    },
  });
},




  clearRefreshToken: async (id: string): Promise<void> => {
    await prisma.admin.update({ where: { id }, data: {} });
  },
};