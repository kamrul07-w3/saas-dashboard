"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Bell,
  Settings,
  UserCog,
  UsersRound,
  KeyRound,
  Plus,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { CustomerInfo } from "@/types";

const pages = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Account Settings", href: "/settings/account", icon: UserCog },
  { name: "Team Settings", href: "/settings/team", icon: UsersRound },
  { name: "API Keys", href: "/settings/api-keys", icon: KeyRound },
  { name: "General Settings", href: "/settings/notifications", icon: Settings },
];

const quickActions = [
  { name: "Add Customer", href: "/customers/new", icon: Plus },
  { name: "View Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Manage Team", href: "/settings/team", icon: UsersRound },
  { name: "API Keys", href: "/settings/api-keys", icon: KeyRound },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: customersData } = useQuery<{ data: CustomerInfo[] }>({
    queryKey: ["customers-search"],
    queryFn: async () => {
      const res = await fetch("/api/v1/customers?perPage=10");
      if (!res.ok) return { data: [] };
      return res.json();
    },
    enabled: open,
  });

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    []
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const customers = customersData?.data ?? [];

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search for pages, customers, and quick actions"
    >
      <CommandInput placeholder="Type to search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.href}
              value={page.name}
              onSelect={() => runCommand(() => router.push(page.href))}
            >
              <page.icon className="mr-2 size-4" />
              {page.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.name}
              value={`action: ${action.name}`}
              onSelect={() => runCommand(() => router.push(action.href))}
            >
              <action.icon className="mr-2 size-4" />
              {action.name}
            </CommandItem>
          ))}
        </CommandGroup>

        {customers.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Customers">
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={`customer: ${customer.name} ${customer.email} ${customer.company || ""}`}
                  onSelect={() =>
                    runCommand(() => router.push(`/customers/${customer.id}`))
                  }
                >
                  <Search className="mr-2 size-4" />
                  <div className="flex flex-col">
                    <span>{customer.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {customer.email}
                      {customer.company ? ` - ${customer.company}` : ""}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
