import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; image?: string }
) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updatePassword(id: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}
