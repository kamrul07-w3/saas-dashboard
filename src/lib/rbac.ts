import type { Session } from "next-auth";
import type { Role } from "@/lib/constants";

export function requireRole(session: Session | null, ...roles: Role[]): void {
  if (!session?.user?.role) {
    throw new Error("Unauthorized: No session found");
  }
  if (!roles.includes(session.user.role)) {
    throw new Error(
      `Forbidden: Role '${session.user.role}' is not allowed. Required: ${roles.join(", ")}`
    );
  }
}

export function isOwner(session: Session | null): boolean {
  return session?.user?.role === "OWNER";
}

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "ADMIN";
}

export function isMember(session: Session | null): boolean {
  return session?.user?.role === "MEMBER";
}

export function canManageTeam(session: Session | null): boolean {
  return isOwner(session) || isAdmin(session);
}

export function canManageMembers(session: Session | null): boolean {
  return isOwner(session) || isAdmin(session);
}
