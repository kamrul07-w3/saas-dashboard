import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse, withValidation } from "@/lib/api-helpers";
import { requireRole } from "@/lib/rbac";
import { resetPassword } from "@/lib/services/admin-service";
import { adminResetPasswordSchema } from "@/lib/validations";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    requireRole(session, "OWNER", "ADMIN");

    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const { id } = await params;

    const member = await prisma.teamMember.findFirst({
      where: { userId: id, teamId: authResult.teamId },
    });
    if (!member) return errorResponse("User not found in team", 404);

    const validation = await withValidation(req, adminResetPasswordSchema);
    if ("error" in validation) return validation.error;

    const result = await resetPassword(id, validation.data.password);
    return successResponse(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return errorResponse(error.message, 403);
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return errorResponse(error.message, 401);
    }
    console.error("Reset password error:", error);
    return errorResponse("Internal server error", 500);
  }
}
