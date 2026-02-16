import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";

interface UserFilters {
  search?: string;
}

interface Pagination {
  skip: number;
  perPage: number;
}

export async function listUsers(
  teamId: string,
  filters: UserFilters,
  pagination: Pagination
) {
  const memberWhere: Prisma.TeamMemberWhereInput = { teamId };

  if (filters.search) {
    memberWhere.user = {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ],
    };
  }

  const [members, total] = await Promise.all([
    prisma.teamMember.findMany({
      where: memberWhere,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      skip: pagination.skip,
      take: pagination.perPage,
      orderBy: { joinedAt: "desc" },
    }),
    prisma.teamMember.count({ where: memberWhere }),
  ]);

  const users = members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    isActive: m.user.isActive,
    role: m.role,
    memberId: m.id,
    createdAt: m.user.createdAt,
    joinedAt: m.joinedAt,
  }));

  return { users, total };
}

export async function createUser(
  teamId: string,
  data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }
) {
  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      teamMembers: {
        create: {
          teamId,
          role: data.role,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      teamMembers: {
        where: { teamId },
        select: { id: true, role: true, joinedAt: true },
      },
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    role: user.teamMembers[0]?.role ?? data.role,
    memberId: user.teamMembers[0]?.id,
    createdAt: user.createdAt,
    joinedAt: user.teamMembers[0]?.joinedAt,
  };
}

export async function updateUser(
  userId: string,
  teamId: string,
  data: {
    name?: string;
    email?: string;
    role?: string;
  }
) {
  const member = await prisma.teamMember.findFirst({
    where: { userId, teamId },
  });
  if (!member) return null;

  const { role, ...userData } = data;

  if (Object.keys(userData).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: userData,
    });
  }

  if (role) {
    await prisma.teamMember.update({
      where: { id: member.id },
      data: { role },
    });
  }

  const updated = await prisma.teamMember.findFirst({
    where: { userId, teamId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
  });

  if (!updated) return null;

  return {
    id: updated.user.id,
    name: updated.user.name,
    email: updated.user.email,
    image: updated.user.image,
    isActive: updated.user.isActive,
    role: updated.role,
    memberId: updated.id,
    createdAt: updated.user.createdAt,
    joinedAt: updated.joinedAt,
  };
}

export async function deleteUser(userId: string, teamId: string) {
  const member = await prisma.teamMember.findFirst({
    where: { userId, teamId },
  });
  if (!member) return null;

  await prisma.teamMember.delete({ where: { id: member.id } });
  return { message: "User removed from team" };
}

export async function resetPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  return { message: "Password reset successfully" };
}

export async function toggleUserActive(userId: string, teamId: string) {
  const member = await prisma.teamMember.findFirst({
    where: { userId, teamId },
  });
  if (!member) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: { id: true, isActive: true },
  });

  return updated;
}
