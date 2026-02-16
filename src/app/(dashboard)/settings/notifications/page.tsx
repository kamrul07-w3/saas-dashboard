"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BellRing } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { FormSkeleton } from "@/components/shared/loading-skeleton";
import type { NotificationPreferenceInfo } from "@/types";

const preferences = [
  {
    key: "emailNotifications" as const,
    label: "Email Notifications",
    description: "Receive notifications via email",
  },
  {
    key: "pushNotifications" as const,
    label: "Push Notifications",
    description: "Receive push notifications in browser",
  },
  {
    key: "marketingEmails" as const,
    label: "Marketing Emails",
    description: "Receive product updates and marketing emails",
  },
  {
    key: "securityAlerts" as const,
    label: "Security Alerts",
    description: "Receive alerts about account security events",
  },
  {
    key: "weeklyDigest" as const,
    label: "Weekly Digest",
    description: "Receive a weekly summary of activity",
  },
];

export default function NotificationSettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{
    data: NotificationPreferenceInfo;
  }>({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/v1/users/me/notification-preferences");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (update: Partial<NotificationPreferenceInfo>) => {
      const res = await fetch("/api/v1/users/me/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Preferences updated");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Notification Preferences" />
        <FormSkeleton />
      </div>
    );
  }

  const prefs = data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Preferences"
        description="Choose how you want to be notified"
      />

      <Card className="max-w-2xl shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <BellRing className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Preferences</CardTitle>
              <CardDescription>
                Toggle your notification preferences below.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {preferences.map((pref) => (
              <div
                key={pref.key}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div className="space-y-0.5 pr-4">
                  <Label htmlFor={pref.key} className="text-sm font-medium">{pref.label}</Label>
                  <p className="text-muted-foreground text-sm">
                    {pref.description}
                  </p>
                </div>
                <Switch
                  id={pref.key}
                  checked={prefs?.[pref.key] ?? false}
                  onCheckedChange={(checked) =>
                    mutation.mutate({ [pref.key]: checked })
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
