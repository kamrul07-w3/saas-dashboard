"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { NotificationPopover } from "@/components/shared/notification-popover";

interface TopbarProps {
  onMobileMenuToggle: () => void;
  onOpenCommandPalette?: () => void;
}

export function Topbar({ onMobileMenuToggle, onOpenCommandPalette }: TopbarProps) {
  return (
    <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-20 flex h-14 items-center gap-4 border-b px-4 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.02)] md:px-6 supports-[backdrop-filter]:bg-background/60">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={onMobileMenuToggle}
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex-1">
        <button
          onClick={onOpenCommandPalette}
          className="text-muted-foreground hover:text-foreground hover:border-foreground/20 hidden items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-all duration-200 md:flex"
        >
          <span>Search...</span>
          <kbd className="bg-muted pointer-events-none ml-auto inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1">
        <NotificationPopover />

        <div className="mx-1 h-6 w-px bg-border" />

        <UserMenu />
      </div>
    </header>
  );
}
