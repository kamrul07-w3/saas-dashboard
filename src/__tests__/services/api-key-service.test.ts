jest.mock("@/lib/prisma", () => {
  const mockPrisma = {
    apiKey: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { __esModule: true, default: mockPrisma, prisma: mockPrisma };
});

import prisma from "@/lib/prisma";
import {
  createApiKey,
  revokeApiKey,
} from "@/lib/services/api-key-service";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("api-key-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createApiKey", () => {
    it("creates an API key and returns it with the raw key", async () => {
      (mockPrisma.apiKey.create as jest.Mock).mockImplementation(
        async ({ data }) => ({
          id: "key-1",
          name: data.name,
          prefix: data.prefix,
          createdAt: new Date(),
        })
      );

      const result = await createApiKey("team-1", "user-1", "My API Key");

      expect(result).toHaveProperty("key");
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("prefix");
      expect(result.key).toMatch(/^sk_/);
      expect(result.prefix).toMatch(/^sk_/);
      expect(result.prefix.length).toBe(11);
    });

    it("passes hashed key and correct data to prisma", async () => {
      (mockPrisma.apiKey.create as jest.Mock).mockImplementation(
        async ({ data }) => ({
          id: "key-1",
          name: data.name,
          prefix: data.prefix,
          createdAt: new Date(),
        })
      );

      await createApiKey("team-1", "user-1", "Test Key");

      expect(mockPrisma.apiKey.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Test Key",
          userId: "user-1",
          teamId: "team-1",
          hashedKey: expect.any(String),
          prefix: expect.stringMatching(/^sk_/),
        }),
        select: {
          id: true,
          name: true,
          prefix: true,
          createdAt: true,
        },
      });
    });

    it("generates unique keys on each call", async () => {
      (mockPrisma.apiKey.create as jest.Mock).mockImplementation(
        async ({ data }) => ({
          id: "key-1",
          name: data.name,
          prefix: data.prefix,
          createdAt: new Date(),
        })
      );

      const result1 = await createApiKey("team-1", "user-1", "Key 1");
      const result2 = await createApiKey("team-1", "user-1", "Key 2");

      expect(result1.key).not.toBe(result2.key);
    });
  });

  describe("revokeApiKey", () => {
    it("revokes an API key belonging to the team", async () => {
      const apiKey = { id: "key-1", teamId: "team-1", revoked: false };
      (mockPrisma.apiKey.findFirst as jest.Mock).mockResolvedValue(apiKey);
      (mockPrisma.apiKey.update as jest.Mock).mockResolvedValue({
        id: "key-1",
        name: "Test Key",
        prefix: "sk_abc12345",
        revoked: true,
        createdAt: new Date(),
      });

      const result = await revokeApiKey("key-1", "team-1");

      expect(result).toHaveProperty("revoked", true);
      expect(mockPrisma.apiKey.update).toHaveBeenCalledWith({
        where: { id: "key-1" },
        data: { revoked: true },
        select: {
          id: true,
          name: true,
          prefix: true,
          revoked: true,
          createdAt: true,
        },
      });
    });

    it("returns null if API key not found for team", async () => {
      (mockPrisma.apiKey.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await revokeApiKey("nonexistent", "team-1");

      expect(result).toBeNull();
      expect(mockPrisma.apiKey.update).not.toHaveBeenCalled();
    });
  });
});
