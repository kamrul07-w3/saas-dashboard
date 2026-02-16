import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse, withValidation } from "@/lib/api-helpers";
import { requireRole } from "@/lib/rbac";
import { updateUser, deleteUser, toggleUserActive } from "@/lib/services/admin-service";
import { adminUpdateUserSchema } from "@/lib/validations";
import { auth } from "@/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    requireRole(session, "OWNER", "ADMIN");

    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const { id } = await params;

    const url = req.nextUrl;
    const action = url.searchParams.get("action");

    if (action === "toggle-active") {
      const result = await toggleUserActive(id, authResult.teamId);
      if (!result) return errorResponse("User not found", 404);
      return successResponse(result);
    }

    const validation = await withValidation(req, adminUpdateUserSchema);
    if ("error" in validation) return validation.error;

    const user = await updateUser(id, authResult.teamId, validation.data);
    if (!user) return errorResponse("User not found", 404);

    return successResponse(user);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return errorResponse(error.message, 403);
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return errorResponse(error.message, 401);
    }
    console.error("Update user error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    requireRole(session, "OWNER", "ADMIN");

    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const { id } = await params;

    if (id === authResult.userId) {
      return errorResponse("Cannot delete your own account", 400);
    }

    const result = await deleteUser(id, authResult.teamId);
    if (!result) return errorResponse("User not found", 404);

    return successResponse(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return errorResponse(error.message, 403);
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return errorResponse(error.message, 401);
    }
    console.error("Delete user error:", error);
    return errorResponse("Internal server error", 500);
  }
}
