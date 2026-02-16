"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import type { DashboardStats, ActivityInfo } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const dateParams = dateRange?.from
    ? `?from=${format(dateRange.from, "yyyy-MM-dd")}${dateRange.to ? `&to=${format(dateRange.to, "yyyy-MM-dd")}` : ""}`
    : "";

  const { data: stats, isLoading: statsLoading } = useQuery<{
    data: DashboardStats;
  }>({
    queryKey: ["dashboard-stats", dateParams],
    queryFn: async () => {
      const res = await fetch(`/api/v1/dashboard/stats${dateParams}`);
      return res.json();
    },
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["revenue", dateParams],
    queryFn: async () => {
      const res = await fetch(`/api/v1/analytics/revenue${dateParams}`);
      return res.json();
    },
  });

  const { data: activitiesData } = useQuery<{ data: ActivityInfo[] }>({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await fetch("/api/v1/activities?perPage=10");
      return res.json();
    },
  });

  if (statsLoading && revenueLoading) {
    return <PageSkeleton />;
  }

  const s = stats?.data;
  const kpis = [
    {
      title: "Total Customers",
      value: s?.totalCustomers ?? 0,
      icon: Users,
      format: (v: number) => v.toLocaleString(),
      subtitle: `${s?.activeCustomers ?? 0} active`,
    },
    {
      title: "Monthly Recurring Revenue",
      value: s?.totalMrr ?? 0,
      icon: DollarSign,
      format: (v: number) =>
        `$${(v / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      subtitle: "MRR",
    },
    {
      title: "Growth Rate",
      value: s?.mrrGrowth ?? 0,
      icon: TrendingUp,
      format: (v: number) => `${v.toFixed(1)}%`,
      subtitle: "vs last period",
      positive: (s?.mrrGrowth ?? 0) >= 0,
    },
    {
      title: "Churn Rate",
      value: s?.churnRate ?? 0,
      icon: TrendingDown,
      format: (v: number) => `${v.toFixed(1)}%`,
      subtitle: "monthly",
      positive: (s?.churnRate ?? 0) <= 5,
    },
  ];

  const revenueChartData =
    revenueData?.data?.snapshots?.map(
      (s: { date: string; mrr: number }) => ({
        date: format(new Date(s.date), "MMM dd"),
        MRR: s.mrr / 100,
      })
    ) ?? [];

  const customerChartData =
    revenueData?.data?.snapshots?.map(
      (s: { date: string; newMrr: number; churnedMrr: number }) => ({
        date: format(new Date(s.date), "MMM dd"),
        "New MRR": s.newMrr / 100,
        "Churned MRR": s.churnedMrr / 100,
      })
    ) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your business metrics"
        actions={<DateRangePicker value={dateRange} onChange={setDateRange} />}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.format(kpi.value)}</div>
              <p className="text-muted-foreground text-xs">
                {kpi.positive !== undefined && (
                  <span
                    className={
                      kpi.positive ? "text-green-600" : "text-red-600"
                    }
                  >
                    {kpi.positive ? "+" : ""}
                  </span>
                )}
                {kpi.subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={revenueChartData}
              areas={[
                { dataKey: "MRR", color: "hsl(var(--chart-1))", name: "MRR" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New vs Churned MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={customerChartData}
              bars={[
                {
                  dataKey: "New MRR",
                  color: "hsl(var(--chart-2))",
                  name: "New MRR",
                },
                {
                  dataKey: "Churned MRR",
                  color: "hsl(var(--chart-5))",
                  name: "Churned MRR",
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activitiesData?.data?.length ? (
              activitiesData.data.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={activity.user?.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {activity.user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-muted-foreground text-xs">
                      {format(new Date(activity.createdAt), "MMM dd, HH:mm")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Activity className="text-muted-foreground mx-auto mb-2 size-8" />
                  <p className="text-muted-foreground text-sm">
                    No recent activity
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
