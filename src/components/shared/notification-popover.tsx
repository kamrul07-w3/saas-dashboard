"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Bell,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  [NOTIFICATION_TYPES.WARNING]: "text-yellow-500",
  [NOTIFICATION_TYPES.SUCCESS]: "text-green-500",
  [NOTIFICATION_TYPES.ERROR]: "text-red-500",
};

export function NotificationPopover() {
  const queryClient = useQueryClient();

  const { data: unreadData } = useQuery({
    queryKey: ["unread-notifications"],
    queryFn: async () => {
      const res = await fetch("/api/v1/notifications?unreadOnly=true&perPage=1");
      if (!res.ok) return { meta: { total: 0 } };
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: notificationsData } = useQuery<{ data: NotificationInfo[] }>({
    queryKey: ["notifications-preview"],
    queryFn: async () => {
      const res = await fetch("/api/v1/notifications?perPage=5");
      if (!res.ok) return { data: [] };
      return res.json();
    },
    refetchInterval: 30000,
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
      queryClient.invalidateQueries({ queryKey: ["notifications-preview"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
    },
  });

  const unreadCount = unreadData?.meta?.total ?? 0;
  const notifications = notificationsData?.data ?? [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex size-4 items-center justify-center p-0 text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-muted-foreground text-xs">
              {unreadCount} unread
            </span>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Bell className="text-muted-foreground mb-2 size-8" />
              <p className="text-muted-foreground text-sm">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type] || Info;
                const color =
                  typeColors[notification.type] || "text-blue-500";

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50",
                      !notification.read && "bg-accent/30"
                    )}
                  >
                    <Icon
                      className={cn("mt-0.5 size-4 shrink-0", color)}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm leading-tight",
                          !notification.read && "font-medium"
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {format(
                          new Date(notification.createdAt),
                          "MMM dd, HH:mm"
                        )}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          markReadMutation.mutate(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <Check className="size-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
