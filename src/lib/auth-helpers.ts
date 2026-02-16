import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const member = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    include: { team: true },
  });

  return {
    userId: session.user.id,
    user: session.user,
    teamId: member?.teamId ?? null,
    role: member?.role ?? null,
  };
}
