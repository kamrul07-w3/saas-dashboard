"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Bell,
  Check,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import type { NotificationInfo } from "@/types";
import { cn } from "@/lib/utils";
import { NOTIFICATION_TYPES } from "@/lib/constants";

const typeIcons: Record<string, React.ElementType> = {
  [NOTIFICATION_TYPES.INFO]: Info,
  [NOTIFICATION_TYPES.WARNING]: AlertTriangle,
  [NOTIFICATION_TYPES.SUCCESS]: CheckCircle2,
  [NOTIFICATION_TYPES.ERROR]: XCircle,
};

const typeColors: Record<string, string> = {
  [NOTIFICATION_TYPES.INFO]: "text-blue-500",
  [NOTIFICATION_TYPES.WARNING]: "text-amber-500",
  [NOTIFICATION_TYPES.SUCCESS]: "text-emerald-500",
  [NOTIFICATION_TYPES.ERROR]: "text-red-500",
};

const typeBgColors: Record<string, string> = {
  [NOTIFICATION_TYPES.INFO]: "bg-blue-500/10",
  [NOTIFICATION_TYPES.WARNING]: "bg-amber-500/10",
  [NOTIFICATION_TYPES.SUCCESS]: "bg-emerald-500/10",
  [NOTIFICATION_TYPES.ERROR]: "bg-red-500/10",
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: NotificationInfo[] }>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/v1/notifications");
      return res.json();
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/notifications/read-all", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/notifications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
      toast.success("Notification deleted");
    },
  });

  const notifications = data?.data ?? [];
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay up to date with your team's activity"
        actions={
          hasUnread ? (
            <Button
              variant="outline"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <Check className="mr-2 size-4" />
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} message="No notifications yet" />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Info;
            const color = typeColors[notification.type] || "text-blue-500";
            const bgColor = typeBgColors[notification.type] || "bg-blue-500/10";

            return (
              <Card
                key={notification.id}
                className={cn(
                  "transition-all duration-200 hover:shadow-sm",
                  !notification.read && "border-l-4 border-l-primary bg-accent/30"
                )}
              >
                <CardContent className="flex items-start gap-4 py-4">
                  <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", bgColor)}>
                    <Icon className={cn("size-4", color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm",
                        !notification.read && "font-medium"
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      {format(new Date(notification.createdAt), "MMM dd, HH:mm")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          markReadMutation.mutate(notification.id)
                        }
                        title="Mark as read"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Check className="size-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        deleteMutation.mutate(notification.id)
                      }
                      title="Delete"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
