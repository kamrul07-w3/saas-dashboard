"use client";

import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Plus, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import type { CustomerInfo, ApiResponse, PaginationMeta } from "@/types";
import { CUSTOMER_STATUS, DATE_FORMAT } from "@/lib/constants";
import { toast } from "sonner";

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  CHURNED: "destructive",
};

function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") || "ALL"
  );
  const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const queryStr = new URLSearchParams();
  queryStr.set("page", String(page));
  queryStr.set("perPage", "20");
  if (search) queryStr.set("search", search);
  if (statusFilter && statusFilter !== "ALL")
    queryStr.set("status", statusFilter);

  const { data, isLoading } = useQuery<
    ApiResponse<CustomerInfo[]> & { meta: PaginationMeta }
  >({
    queryKey: ["customers", queryStr.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/v1/customers?${queryStr.toString()}`);
      return res.json();
    },
  });

  const columns: Column<Record<string, unknown>>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "company", header: "Company", sortable: true },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant={statusColors[(item.status as string)] || "secondary"}>
          {item.status as string}
        </Badge>
      ),
    },
    { key: "plan", header: "Plan", sortable: true },
    {
      key: "mrr",
      header: "MRR",
      sortable: true,
      render: (item) =>
        `$${((item.mrr as number) / 100).toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      key: "joinedAt",
      header: "Joined",
      sortable: true,
      render: (item) =>
        format(new Date(item.joinedAt as string), DATE_FORMAT),
    },
  ];

  const handleExport = async () => {
    try {
      const res = await fetch("/api/v1/customers/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customers.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your customer base"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 size-4" />
              Export CSV
            </Button>
            <Button onClick={() => router.push("/customers/new")}>
              <Plus className="mr-2 size-4" />
              Add Customer
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {Object.values(CUSTOMER_STATUS).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={(data?.data as unknown as Record<string, unknown>[]) ?? []}
          page={page}
          totalPages={data?.meta?.totalPages ?? 1}
          onPageChange={setPage}
          onRowClick={(item) => router.push(`/customers/${item.id}`)}
          showColumnToggle
        />
      )}
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <CustomersContent />
    </Suspense>
  );
}
