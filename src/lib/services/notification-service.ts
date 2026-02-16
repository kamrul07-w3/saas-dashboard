import prisma from "@/lib/prisma";

interface Pagination {
  skip: number;
  perPage: number;
}

export async function getNotifications(userId: string, pagination: Pagination) {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      skip: pagination.skip,
      take: pagination.perPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return { notifications, total };
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function markAsRead(id: string, userId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });
  if (!notification) return null;

  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function deleteNotification(id: string, userId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });
  if (!notification) return null;

  return prisma.notification.delete({ where: { id } });
}

export async function createNotification(data: {
  type: string;
  title: string;
  message: string;
  userId: string;
}) {
  return prisma.notification.create({ data });
}
