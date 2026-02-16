import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse, withValidation } from "@/lib/api-helpers";
import { getUserById, updateUser } from "@/lib/services/user-service";
import { z } from "zod";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);

    const user = await getUserById(authResult.userId);
    if (!user) return errorResponse("User not found", 404);

    return successResponse({
      ...user,
      role: authResult.role,
      teamId: authResult.teamId,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return errorResponse("Internal server error", 500);
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);

    const validation = await withValidation(req, updateProfileSchema);
    if ("error" in validation) return validation.error;

    const user = await updateUser(authResult.userId, validation.data);
    return successResponse(user);
  } catch (error) {
    console.error("Update user error:", error);
    return errorResponse("Internal server error", 500);
  }
}
