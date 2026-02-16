"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { FormSkeleton } from "@/components/shared/loading-skeleton";
import type { CustomerInfo } from "@/types";
import { DATE_FORMAT } from "@/lib/constants";
import Link from "next/link";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: CustomerInfo }>({
    queryKey: ["customer", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/customers/${params.id}`);
      if (!res.ok) throw new Error("Customer not found");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/customers/${params.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete customer");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted");
      router.push("/customers");
    },
    onError: () => {
      toast.error("Failed to delete customer");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customer Details" />
        <FormSkeleton />
      </div>
    );
  }

  const customer = data?.data;
  if (!customer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customer not found" />
        <Button variant="outline" asChild>
          <Link href="/customers">
            <ArrowLeft className="mr-2 size-4" />
            Back to customers
          </Link>
        </Button>
      </div>
    );
  }

  const statusColors: Record<string, "default" | "secondary" | "destructive"> =
    {
      ACTIVE: "default",
      INACTIVE: "secondary",
      CHURNED: "destructive",
    };

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description={customer.email}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/customers">
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/customers/${params.id}/edit`)}
            >
              <Pencil className="mr-2 size-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete customer?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {customer.name}. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Name
              </dt>
              <dd className="mt-1">{customer.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Email
              </dt>
              <dd className="mt-1">{customer.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Company
              </dt>
              <dd className="mt-1">{customer.company || "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Status
              </dt>
              <dd className="mt-1">
                <Badge variant={statusColors[customer.status] || "secondary"}>
                  {customer.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Plan
              </dt>
              <dd className="mt-1">{customer.plan || "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                MRR
              </dt>
              <dd className="mt-1">
                $
                {(customer.mrr / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Joined
              </dt>
              <dd className="mt-1">
                {format(new Date(customer.joinedAt), DATE_FORMAT)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-medium">
                Last Active
              </dt>
              <dd className="mt-1">
                {customer.lastActiveAt
                  ? format(new Date(customer.lastActiveAt), DATE_FORMAT)
                  : "-"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
