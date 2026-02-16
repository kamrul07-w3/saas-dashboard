"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Bell,
  Settings,
  UserCog,
  UsersRound,
  BellRing,
  KeyRound,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

const settingsNav = [
  { href: "/settings/account", label: "Account", icon: UserCog },
  { href: "/settings/team", label: "Team", icon: UsersRound },
  { href: "/settings/users", label: "Users", icon: ShieldCheck, adminOnly: true },
  { href: "/settings/notifications", label: "Notifications", icon: BellRing },
  { href: "/settings/api-keys", label: "API Keys", icon: KeyRound },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const isAdminOrOwner = userRole === "OWNER" || userRole === "ADMIN";

  const filteredSettingsNav = settingsNav.filter(
    (item) => !item.adminOnly || isAdminOrOwner
  );

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-30 hidden flex-col border-r transition-all duration-300 md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Branded header */}
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight">{APP_NAME}</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </Link>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        )}
      </div>

      {/* Collapse button when collapsed */}
      {collapsed && (
        <div className="flex justify-center border-b py-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground"
          >
            <PanelLeftOpen className="size-4" />
          </Button>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto p-2 pt-3">
        {!collapsed && (
          <div className="mb-2 px-3 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Main
            </span>
          </div>
        )}

        {mainNav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
              )}
              <item.icon className={cn(
                "size-[18px] shrink-0 transition-colors duration-200",
                isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
              )} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        <div className="my-3 px-3">
          <div className="border-t border-sidebar-border" />
        </div>

        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 px-3 py-1">
            <Settings className="size-3 text-muted-foreground" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Settings
            </span>
          </div>
        )}

        {filteredSettingsNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
              )}
              <item.icon className={cn(
                "size-[18px] shrink-0 transition-colors duration-200",
                isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
              )} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
