"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  BarChart3,
  UsersRound,
  KeyRound,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { DashboardStats, ActivityInfo, CustomerInfo } from "@/types";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    title: "Add Customer",
    description: "Create a new customer record",
    href: "/customers/new",
    icon: Plus,
  },
  {
    title: "View Analytics",
    description: "Revenue and growth metrics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Manage Team",
    description: "Invite and manage members",
    href: "/settings/team",
    icon: UsersRound,
  },
  {
    title: "API Keys",
    description: "Manage your API access",
    href: "/settings/api-keys",
    icon: KeyRound,
  },
];

const kpiAccents = [
  "border-l-blue-500",
  "border-l-emerald-500",
  "border-l-violet-500",
  "border-l-amber-500",
];

const kpiIconBg = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
];

export default function DashboardPage() {
  const { data: session } = useSession();
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

  const { data: topCustomersData } = useQuery<{ data: CustomerInfo[] }>({
    queryKey: ["top-customers"],
    queryFn: async () => {
      const res = await fetch("/api/v1/customers?perPage=5&sortBy=mrr&sortOrder=desc");
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
      title: "Monthly Revenue",
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

  const topCustomers = topCustomersData?.data ?? [];
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground text-sm">
            {format(new Date(), "EEEE, MMMM d, yyyy")} &mdash; Here&apos;s what&apos;s happening with your business
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="group transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-primary/15">
                  <action.icon className="text-primary size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{action.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <Card key={kpi.title} className={cn("border-l-4 transition-shadow hover:shadow-md", kpiAccents[i])}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={cn("flex size-8 items-center justify-center rounded-lg", kpiIconBg[i])}>
                <kpi.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{kpi.format(kpi.value)}</div>
              <div className="mt-1 flex items-center gap-1 text-xs">
                {kpi.positive !== undefined && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-medium",
                      kpi.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {kpi.positive ? (
                      <ArrowUpRight className="size-3" />
                    ) : (
                      <ArrowDownRight className="size-3" />
                    )}
                  </span>
                )}
                <span className="text-muted-foreground">{kpi.subtitle}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Revenue Over Time</CardTitle>
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

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">New vs Churned MRR</CardTitle>
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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Customers by MRR */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Top Customers by MRR</CardTitle>
              <Link href="/customers" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {topCustomers.length > 0 ? (
              <div className="space-y-1">
                {topCustomers.map((customer) => (
                  <Link
                    key={customer.id}
                    href={`/customers/${customer.id}`}
                    className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent/50"
                  >
                    <UserAvatar name={customer.name} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {customer.name}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {customer.company || customer.email}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      $
                      {(customer.mrr / 100).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Users className="text-muted-foreground mx-auto mb-2 size-8" />
                  <p className="text-muted-foreground text-sm">
                    No customers yet
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {activitiesData?.data?.length ? (
                activitiesData.data.map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent/30">
                    <div className="relative">
                      <UserAvatar
                        name={activity.user?.name}
                        image={activity.user?.image}
                        className="size-8"
                      />
                      {index < (activitiesData.data?.length ?? 0) - 1 && (
                        <div className="absolute left-1/2 top-9 h-4 w-px -translate-x-1/2 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{activity.description}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">
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
    </div>
  );
}
