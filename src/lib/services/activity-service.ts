import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface Pagination {
  skip: number;
  perPage: number;
}

export async function getActivities(teamId: string, pagination: Pagination) {
  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where: { teamId },
      skip: pagination.skip,
      take: pagination.perPage,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
    }),
    prisma.activity.count({ where: { teamId } }),
  ]);

  return { activities, total };
}

export async function createActivity(data: {
  type: string;
  description: string;
  metadata?: Record<string, unknown>;
  userId: string;
  teamId: string;
}) {
  return prisma.activity.create({
    data: {
      type: data.type,
      description: data.description,
      metadata: (data.metadata as Prisma.InputJsonValue) ?? undefined,
      userId: data.userId,
      teamId: data.teamId,
    },
    include: {
      user: {
        select: { name: true, email: true, image: true },
      },
    },
  });
}
