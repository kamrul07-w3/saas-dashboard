"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { FormSkeleton } from "@/components/shared/loading-skeleton";
import type { CustomerInfo } from "@/types";
import { CUSTOMER_STATUS } from "@/lib/constants";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "CHURNED"]),
  plan: z.string().optional(),
  mrr: z.number().min(0, "MRR must be positive"),
});

type CustomerForm = z.infer<typeof customerSchema>;

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = useQuery<{ data: CustomerInfo }>({
    queryKey: ["customer", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/customers/${params.id}`);
      if (!res.ok) throw new Error("Customer not found");
      return res.json();
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (data?.data) {
      const c = data.data;
      reset({
        name: c.name,
        email: c.email,
        company: c.company || "",
        status: c.status,
        plan: c.plan || "",
        mrr: c.mrr / 100,
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: CustomerForm) => {
    try {
      const res = await fetch(`/api/v1/customers/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mrr: Math.round(formData.mrr * 100),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update customer");
      }
      toast.success("Customer updated successfully");
      router.push(`/customers/${params.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Customer" />
        <FormSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Customer"
        description={`Editing ${data?.data?.name || "customer"}`}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>Update the customer information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-destructive text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" {...register("company")} />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(val) =>
                  setValue("status", val as CustomerForm["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CUSTOMER_STATUS).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <Input id="plan" {...register("plan")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mrr">MRR ($)</Label>
              <Input
                id="mrr"
                type="number"
                step="0.01"
                {...register("mrr", { valueAsNumber: true })}
              />
              {errors.mrr && (
                <p className="text-destructive text-sm">
                  {errors.mrr.message}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/customers/${params.id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
