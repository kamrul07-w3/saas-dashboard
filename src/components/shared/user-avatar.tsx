"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string | null | undefined): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

interface UserAvatarProps {
  name: string | null | undefined;
  image?: string | null;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  name,
  image,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <Avatar className={cn("size-8", className)}>
      <AvatarImage src={image || undefined} alt={name || "User"} />
      <AvatarFallback
        className={cn("text-xs font-medium text-white", bgColor, fallbackClassName)}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
