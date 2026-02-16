import prisma from "@/lib/prisma";
import { createHash, randomBytes } from "crypto";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function getApiKeys(teamId: string) {
  return prisma.apiKey.findMany({
    where: { teamId },
    select: {
      id: true,
      name: true,
      prefix: true,
      revoked: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createApiKey(
  teamId: string,
  userId: string,
  name: string
) {
  const rawKey = `sk_${randomBytes(32).toString("hex")}`;
  const prefix = rawKey.substring(0, 11); // "sk_" + 8 chars
  const hashedKey = hashKey(rawKey);

  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      prefix,
      hashedKey,
      userId,
      teamId,
    },
    select: {
      id: true,
      name: true,
      prefix: true,
      createdAt: true,
    },
  });

  return { ...apiKey, key: rawKey };
}

export async function revokeApiKey(id: string, teamId: string) {
  const apiKey = await prisma.apiKey.findFirst({
    where: { id, teamId },
  });
  if (!apiKey) return null;

  return prisma.apiKey.update({
    where: { id },
    data: { revoked: true },
    select: {
      id: true,
      name: true,
      prefix: true,
      revoked: true,
      createdAt: true,
    },
  });
}

export async function deleteApiKey(id: string, teamId: string) {
  const apiKey = await prisma.apiKey.findFirst({
    where: { id, teamId },
  });
  if (!apiKey) return null;

  return prisma.apiKey.delete({ where: { id } });
}

export async function validateApiKey(rawKey: string) {
  const hashedKey = hashKey(rawKey);
  const apiKey = await prisma.apiKey.findUnique({
    where: { hashedKey },
  });

  if (!apiKey || apiKey.revoked) return null;

  if (apiKey.expiresAt && new Date() > apiKey.expiresAt) return null;

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return apiKey;
}
