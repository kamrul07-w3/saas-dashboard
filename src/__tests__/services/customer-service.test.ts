// Mock Prisma before importing the service
jest.mock("@/lib/prisma", () => {
  const mockPrisma = {
    customer: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
  };
  return { __esModule: true, default: mockPrisma, prisma: mockPrisma };
});

import prisma from "@/lib/prisma";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
} from "@/lib/services/customer-service";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("customer-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCustomers", () => {
    it("returns customers and total count", async () => {
      const customers = [
        { id: "1", name: "Alice", email: "alice@example.com" },
      ];
      (mockPrisma.customer.findMany as jest.Mock).mockResolvedValue(customers);
      (mockPrisma.customer.count as jest.Mock).mockResolvedValue(1);

      const result = await getCustomers(
        "team-1",
        {},
        { skip: 0, perPage: 20 }
      );

      expect(result).toEqual({ customers, total: 1 });
      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({
        where: { teamId: "team-1" },
        skip: 0,
        take: 20,
        orderBy: { createdAt: "desc" },
      });
    });

    it("applies status filter", async () => {
      (mockPrisma.customer.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.customer.count as jest.Mock).mockResolvedValue(0);

      await getCustomers(
        "team-1",
        { status: "ACTIVE" },
        { skip: 0, perPage: 20 }
      );

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { teamId: "team-1", status: "ACTIVE" },
        })
      );
    });

    it("applies search filter with OR conditions", async () => {
      (mockPrisma.customer.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.customer.count as jest.Mock).mockResolvedValue(0);

      await getCustomers(
        "team-1",
        { search: "acme" },
        { skip: 0, perPage: 20 }
      );

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            teamId: "team-1",
            OR: [
              { name: { contains: "acme", mode: "insensitive" } },
              { email: { contains: "acme", mode: "insensitive" } },
              { company: { contains: "acme", mode: "insensitive" } },
            ],
          }),
        })
      );
    });

    it("respects pagination params", async () => {
      (mockPrisma.customer.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.customer.count as jest.Mock).mockResolvedValue(0);

      await getCustomers("team-1", {}, { skip: 40, perPage: 10 });

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 40, take: 10 })
      );
    });
  });

  describe("getCustomerById", () => {
    it("finds customer by id and teamId", async () => {
      const customer = { id: "c-1", name: "Alice", teamId: "team-1" };
      (mockPrisma.customer.findFirst as jest.Mock).mockResolvedValue(customer);

      const result = await getCustomerById("c-1", "team-1");

      expect(result).toEqual(customer);
      expect(mockPrisma.customer.findFirst).toHaveBeenCalledWith({
        where: { id: "c-1", teamId: "team-1" },
      });
    });

    it("returns null when customer not found", async () => {
      (mockPrisma.customer.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getCustomerById("nonexistent", "team-1");
      expect(result).toBeNull();
    });
  });

  describe("createCustomer", () => {
    it("creates a customer with teamId", async () => {
      const input = { name: "Acme", email: "acme@example.com", mrr: 100 };
      const created = { id: "c-new", ...input, teamId: "team-1" };
      (mockPrisma.customer.create as jest.Mock).mockResolvedValue(created);

      const result = await createCustomer("team-1", input);

      expect(result).toEqual(created);
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: { ...input, teamId: "team-1" },
      });
    });
  });

  describe("updateCustomer", () => {
    it("updates customer fields", async () => {
      const updated = { id: "c-1", name: "Updated", mrr: 200 };
      (mockPrisma.customer.update as jest.Mock).mockResolvedValue(updated);

      const result = await updateCustomer("c-1", "team-1", {
        name: "Updated",
        mrr: 200,
      });

      expect(result).toEqual(updated);
      expect(mockPrisma.customer.update).toHaveBeenCalledWith({
        where: { id: "c-1" },
        data: { name: "Updated", mrr: 200 },
      });
    });
  });

  describe("deleteCustomer", () => {
    it("deletes customer if it belongs to team", async () => {
      const customer = { id: "c-1", teamId: "team-1" };
      (mockPrisma.customer.findFirst as jest.Mock).mockResolvedValue(customer);
      (mockPrisma.customer.delete as jest.Mock).mockResolvedValue(customer);

      const result = await deleteCustomer("c-1", "team-1");

      expect(result).toEqual(customer);
      expect(mockPrisma.customer.delete).toHaveBeenCalledWith({
        where: { id: "c-1" },
      });
    });

    it("returns null if customer not found for team", async () => {
      (mockPrisma.customer.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await deleteCustomer("nonexistent", "team-1");

      expect(result).toBeNull();
      expect(mockPrisma.customer.delete).not.toHaveBeenCalled();
    });
  });

  describe("getCustomerStats", () => {
    it("returns computed statistics", async () => {
      (mockPrisma.customer.count as jest.Mock)
        .mockResolvedValueOnce(100) // totalCustomers
        .mockResolvedValueOnce(80) // activeCustomers
        .mockResolvedValueOnce(5) // churnedThisMonth
        .mockResolvedValueOnce(10); // newThisMonth
      (mockPrisma.customer.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { mrr: 50000 } }) // currentMrrAgg
        .mockResolvedValueOnce({ _sum: { mrr: 45000 } }); // lastMonthMrrAgg

      const stats = await getCustomerStats("team-1");

      expect(stats.totalCustomers).toBe(100);
      expect(stats.activeCustomers).toBe(80);
      expect(stats.totalMrr).toBe(50000);
      expect(stats.newCustomersThisMonth).toBe(10);
      expect(stats.churnRate).toBe(5);
      expect(stats.mrrGrowth).toBeCloseTo(11.11, 1);
    });

    it("handles zero customers gracefully", async () => {
      (mockPrisma.customer.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.customer.aggregate as jest.Mock).mockResolvedValue({
        _sum: { mrr: null },
      });

      const stats = await getCustomerStats("team-1");

      expect(stats.totalCustomers).toBe(0);
      expect(stats.totalMrr).toBe(0);
      expect(stats.churnRate).toBe(0);
      expect(stats.mrrGrowth).toBe(0);
    });
  });
});
