import prisma from "@/lib/prisma";

export async function getTeamBySlug(slug: string) {
  return prisma.team.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
      invitations: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getTeamById(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
      invitations: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createTeam(
  data: { name: string; slug: string },
  ownerId: string
) {
  return prisma.team.create({
    data: {
      name: data.name,
      slug: data.slug,
      members: {
        create: {
          userId: ownerId,
          role: "OWNER",
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
    },
  });
}

export async function updateTeam(id: string, data: { name?: string }) {
  return prisma.team.update({
    where: { id },
    data,
  });
}

export async function deleteTeam(id: string) {
  return prisma.team.delete({ where: { id } });
}

export async function addMember(
  teamId: string,
  userId: string,
  role: string = "MEMBER"
) {
  return prisma.teamMember.create({
    data: { teamId, userId, role },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });
}

export async function removeMember(memberId: string, teamId: string) {
  const member = await prisma.teamMember.findFirst({
    where: { id: memberId, teamId },
  });
  if (!member) return null;
  return prisma.teamMember.delete({ where: { id: memberId } });
}

export async function updateMemberRole(
  memberId: string,
  teamId: string,
  role: string
) {
  const member = await prisma.teamMember.findFirst({
    where: { id: memberId, teamId },
  });
  if (!member) return null;
  return prisma.teamMember.update({
    where: { id: memberId },
    data: { role },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });
}

export async function createInvitation(
  teamId: string,
  email: string,
  role: string = "MEMBER"
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return prisma.invitation.create({
    data: {
      email,
      role,
      teamId,
      expiresAt,
    },
  });
}

export async function getInvitations(teamId: string) {
  return prisma.invitation.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
  });
}

export async function acceptInvitation(invitationId: string, userId: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation || invitation.status !== "PENDING") {
    return null;
  }

  if (new Date() > invitation.expiresAt) {
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "EXPIRED" },
    });
    return null;
  }

  const [updatedInvitation, member] = await prisma.$transaction([
    prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED" },
    }),
    prisma.teamMember.create({
      data: {
        teamId: invitation.teamId,
        userId,
        role: invitation.role,
      },
    }),
  ]);

  return { invitation: updatedInvitation, member };
}
