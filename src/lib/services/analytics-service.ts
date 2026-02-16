import prisma from "@/lib/prisma";
import { getCustomerStats } from "./customer-service";

interface DateRange {
  from: Date;
  to: Date;
}

export async function getRevenueSnapshots(teamId: string, dateRange: DateRange) {
  return prisma.revenueSnapshot.findMany({
    where: {
      teamId,
      date: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
    orderBy: { date: "asc" },
  });
}

export async function getUserActivitySnapshots(
  teamId: string,
  dateRange: DateRange
) {
  return prisma.userActivitySnapshot.findMany({
    where: {
      teamId,
      date: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
    orderBy: { date: "asc" },
  });
}

export async function getFeatureUsageSnapshots(
  teamId: string,
  dateRange: DateRange
) {
  return prisma.featureUsageSnapshot.findMany({
    where: {
      teamId,
      date: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
    orderBy: { date: "asc" },
  });
}

export async function getDashboardStats(teamId: string) {
  return getCustomerStats(teamId);
}
