"use client";

import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const { data: notifData } = useQuery({
    queryKey: ["unread-notifications"],
    queryFn: async () => {
      const res = await fetch("/api/v1/notifications?unreadOnly=true&perPage=1");
      if (!res.ok) return { meta: { total: 0 } };
      return res.json();
    },
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.meta?.total ?? 0;

  return (
    <header className="bg-background sticky top-0 z-20 flex h-14 items-center gap-4 border-b px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={onMobileMenuToggle}
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex-1" />

      <Button variant="ghost" size="icon-sm" asChild className="relative">
        <Link href="/notifications">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex size-4 items-center justify-center p-0 text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Link>
      </Button>

      <UserMenu />
    </header>
  );
}
