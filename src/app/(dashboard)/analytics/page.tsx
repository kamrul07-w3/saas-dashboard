"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { ChartSkeleton } from "@/components/shared/loading-skeleton";
import type { RevenueData, UserActivityData, FeatureUsageData } from "@/types";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const dateParams = dateRange?.from
    ? `?from=${format(dateRange.from, "yyyy-MM-dd")}${dateRange.to ? `&to=${format(dateRange.to, "yyyy-MM-dd")}` : ""}`
    : "";

  const { data: revenueData, isLoading: revenueLoading } = useQuery<{
    data: RevenueData;
  }>({
    queryKey: ["analytics-revenue", dateParams],
    queryFn: async () => {
      const res = await fetch(`/api/v1/analytics/revenue${dateParams}`);
      return res.json();
    },
  });

  const { data: usersData, isLoading: usersLoading } = useQuery<{
    data: UserActivityData;
  }>({
    queryKey: ["analytics-users", dateParams],
    queryFn: async () => {
      const res = await fetch(`/api/v1/analytics/users${dateParams}`);
      return res.json();
    },
  });

  const { data: featuresData, isLoading: featuresLoading } = useQuery<{
    data: FeatureUsageData;
  }>({
    queryKey: ["analytics-features", dateParams],
    queryFn: async () => {
      const res = await fetch(`/api/v1/analytics/features${dateParams}`);
      return res.json();
    },
  });

  const revenueSnapshots =
    revenueData?.data?.snapshots?.map((s) => ({
      date: format(new Date(s.date), "MMM dd"),
      MRR: s.mrr / 100,
      ARR: s.arr / 100,
    })) ?? [];

  const revenueMrrChurn =
    revenueData?.data?.snapshots?.map((s) => ({
      date: format(new Date(s.date), "MMM dd"),
      "New MRR": s.newMrr / 100,
      "Churned MRR": s.churnedMrr / 100,
    })) ?? [];

  const userSnapshots =
    usersData?.data?.snapshots?.map((s) => ({
      date: format(new Date(s.date), "MMM dd"),
      DAU: s.dau,
      WAU: s.wau,
      MAU: s.mau,
    })) ?? [];

  const userGrowth =
    usersData?.data?.snapshots?.map((s) => ({
      date: format(new Date(s.date), "MMM dd"),
      "New Signups": s.newSignups,
      "Churned Users": s.churnedUsers,
    })) ?? [];

  // Aggregate feature usage by feature name
  const featureAggregated = (() => {
    const map = new Map<string, { usageCount: number; uniqueUsers: number }>();
    featuresData?.data?.snapshots?.forEach((s) => {
      const existing = map.get(s.featureName) || {
        usageCount: 0,
        uniqueUsers: 0,
      };
      map.set(s.featureName, {
        usageCount: existing.usageCount + s.usageCount,
        uniqueUsers: existing.uniqueUsers + s.uniqueUsers,
      });
    });
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      "Usage Count": data.usageCount,
      "Unique Users": data.uniqueUsers,
    }));
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Deep dive into your business metrics"
        actions={<DateRangePicker value={dateRange} onChange={setDateRange} />}
      />

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4 space-y-4">
          {revenueLoading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>MRR / ARR</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={revenueSnapshots}
                    lines={[
                      {
                        dataKey: "MRR",
                        color: "hsl(var(--chart-1))",
                        name: "MRR",
                      },
                      {
                        dataKey: "ARR",
                        color: "hsl(var(--chart-2))",
                        name: "ARR",
                      },
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
                    data={revenueMrrChurn}
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
            </>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-4 space-y-4">
          {usersLoading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>DAU / WAU / MAU</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={userSnapshots}
                    lines={[
                      {
                        dataKey: "DAU",
                        color: "hsl(var(--chart-1))",
                        name: "DAU",
                      },
                      {
                        dataKey: "WAU",
                        color: "hsl(var(--chart-3))",
                        name: "WAU",
                      },
                      {
                        dataKey: "MAU",
                        color: "hsl(var(--chart-4))",
                        name: "MAU",
                      },
                    ]}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>New Signups vs Churned Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={userGrowth}
                    bars={[
                      {
                        dataKey: "New Signups",
                        color: "hsl(var(--chart-2))",
                        name: "New Signups",
                      },
                      {
                        dataKey: "Churned Users",
                        color: "hsl(var(--chart-5))",
                        name: "Churned Users",
                      },
                    ]}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="features" className="mt-4 space-y-4">
          {featuresLoading ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Top Features</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={featureAggregated}
                  xAxisKey="name"
                  bars={[
                    {
                      dataKey: "Usage Count",
                      color: "hsl(var(--chart-1))",
                      name: "Usage Count",
                    },
                    {
                      dataKey: "Unique Users",
                      color: "hsl(var(--chart-3))",
                      name: "Unique Users",
                    },
                  ]}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
