import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface CustomerFilters {
  search?: string;
  status?: string;
}

interface Pagination {
  skip: number;
  perPage: number;
}

export async function getCustomers(
  teamId: string,
  filters: CustomerFilters,
  pagination: Pagination
) {
  const where: Prisma.CustomerWhereInput = { teamId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { company: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: pagination.skip,
      take: pagination.perPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count({ where }),
  ]);

  return { customers, total };
}

export async function getCustomerById(id: string, teamId: string) {
  return prisma.customer.findFirst({
    where: { id, teamId },
  });
}

export async function createCustomer(
  teamId: string,
  data: {
    name: string;
    email: string;
    company?: string;
    status?: string;
    plan?: string;
    mrr?: number;
  }
) {
  return prisma.customer.create({
    data: {
      ...data,
      teamId,
    },
  });
}

export async function updateCustomer(
  id: string,
  teamId: string,
  data: {
    name?: string;
    email?: string;
    company?: string;
    status?: string;
    plan?: string;
    mrr?: number;
  }
) {
  return prisma.customer.update({
    where: { id },
    data,
  });
}

export async function deleteCustomer(id: string, teamId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id, teamId },
  });
  if (!customer) return null;
  return prisma.customer.delete({ where: { id } });
}

export async function getCustomerStats(teamId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalCustomers,
    activeCustomers,
    churnedThisMonth,
    newThisMonth,
    currentMrrAgg,
    lastMonthMrrAgg,
  ] = await Promise.all([
    prisma.customer.count({ where: { teamId } }),
    prisma.customer.count({ where: { teamId, status: "ACTIVE" } }),
    prisma.customer.count({
      where: {
        teamId,
        status: "CHURNED",
        updatedAt: { gte: startOfMonth },
      },
    }),
    prisma.customer.count({
      where: {
        teamId,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.customer.aggregate({
      where: { teamId, status: "ACTIVE" },
      _sum: { mrr: true },
    }),
    prisma.customer.aggregate({
      where: {
        teamId,
        status: "ACTIVE",
        createdAt: { lte: endOfLastMonth },
      },
      _sum: { mrr: true },
    }),
  ]);

  const totalMrr = currentMrrAgg._sum.mrr || 0;
  const lastMonthMrr = lastMonthMrrAgg._sum.mrr || 0;
  const mrrGrowth =
    lastMonthMrr > 0
      ? ((totalMrr - lastMonthMrr) / lastMonthMrr) * 100
      : 0;
  const churnRate =
    totalCustomers > 0 ? (churnedThisMonth / totalCustomers) * 100 : 0;

  return {
    totalCustomers,
    activeCustomers,
    totalMrr,
    mrrGrowth: Math.round(mrrGrowth * 100) / 100,
    churnRate: Math.round(churnRate * 100) / 100,
    newCustomersThisMonth: newThisMonth,
  };
}
