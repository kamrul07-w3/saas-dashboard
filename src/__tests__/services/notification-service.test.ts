jest.mock("@/lib/prisma", () => {
  const mockPrisma = {
    notification: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { __esModule: true, default: mockPrisma, prisma: mockPrisma };
});

import prisma from "@/lib/prisma";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/lib/services/notification-service";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("notification-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getNotifications", () => {
    it("returns notifications and total count", async () => {
      const notifications = [
        { id: "n-1", title: "Welcome", read: false },
      ];
      (mockPrisma.notification.findMany as jest.Mock).mockResolvedValue(
        notifications
      );
      (mockPrisma.notification.count as jest.Mock).mockResolvedValue(1);

      const result = await getNotifications("user-1", {
        skip: 0,
        perPage: 20,
      });

      expect(result).toEqual({ notifications, total: 1 });
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        skip: 0,
        take: 20,
        orderBy: { createdAt: "desc" },
      });
    });

    it("respects pagination", async () => {
      (mockPrisma.notification.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.notification.count as jest.Mock).mockResolvedValue(0);

      await getNotifications("user-1", { skip: 10, perPage: 5 });

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 })
      );
    });
  });

  describe("getUnreadCount", () => {
    it("returns count of unread notifications", async () => {
      (mockPrisma.notification.count as jest.Mock).mockResolvedValue(3);

      const result = await getUnreadCount("user-1");

      expect(result).toBe(3);
      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: { userId: "user-1", read: false },
      });
    });
  });

  describe("markAsRead", () => {
    it("marks a notification as read", async () => {
      const notification = { id: "n-1", userId: "user-1", read: false };
      (mockPrisma.notification.findFirst as jest.Mock).mockResolvedValue(
        notification
      );
      (mockPrisma.notification.update as jest.Mock).mockResolvedValue({
        ...notification,
        read: true,
      });

      const result = await markAsRead("n-1", "user-1");

      expect(result).toEqual({ ...notification, read: true });
      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: "n-1" },
        data: { read: true },
      });
    });

    it("returns null if notification not found", async () => {
      (mockPrisma.notification.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await markAsRead("nonexistent", "user-1");

      expect(result).toBeNull();
      expect(mockPrisma.notification.update).not.toHaveBeenCalled();
    });
  });

  describe("markAllAsRead", () => {
    it("marks all unread notifications as read", async () => {
      (mockPrisma.notification.updateMany as jest.Mock).mockResolvedValue({
        count: 5,
      });

      const result = await markAllAsRead("user-1");

      expect(result).toEqual({ count: 5 });
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-1", read: false },
        data: { read: true },
      });
    });
  });
});
