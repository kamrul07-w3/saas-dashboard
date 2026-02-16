import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import {
  successResponse,
  errorResponse,
  withValidation,
  getPaginationParams,
  buildPaginationMeta,
} from "@/lib/api-helpers";
import { requireRole } from "@/lib/rbac";
import { listUsers, createUser } from "@/lib/services/admin-service";
import { adminCreateUserSchema } from "@/lib/validations";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    requireRole(session, "OWNER", "ADMIN");

    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const searchParams = req.nextUrl.searchParams;
    const { page, perPage, skip } = getPaginationParams(searchParams);
    const search = searchParams.get("search") || undefined;

    const { users, total } = await listUsers(
      authResult.teamId,
      { search },
      { skip, perPage }
    );

    return successResponse(users, buildPaginationMeta(page, perPage, total));
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return errorResponse(error.message, 403);
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return errorResponse(error.message, 401);
    }
    console.error("List users error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    requireRole(session, "OWNER", "ADMIN");

    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const validation = await withValidation(req, adminCreateUserSchema);
    if ("error" in validation) return validation.error;

    const user = await createUser(authResult.teamId, validation.data);
    return successResponse(user);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return errorResponse(error.message, 403);
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return errorResponse(error.message, 401);
    }
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return errorResponse("A user with this email already exists", 409);
    }
    console.error("Create user error:", error);
    return errorResponse("Internal server error", 500);
  }
}
