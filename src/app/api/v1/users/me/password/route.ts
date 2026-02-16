import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse, withValidation } from "@/lib/api-helpers";
import { getUserByEmail, updatePassword } from "@/lib/services/user-service";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);

    const validation = await withValidation(req, changePasswordSchema);
    if ("error" in validation) return validation.error;

    const user = await getUserByEmail(authResult.user.email!);
    if (!user?.password) {
      return errorResponse("Password change not supported for OAuth accounts", 400);
    }

    const isValid = await bcrypt.compare(
      validation.data.currentPassword,
      user.password
    );
    if (!isValid) {
      return errorResponse("Current password is incorrect", 400);
    }

    await updatePassword(authResult.userId, validation.data.newPassword);
    return successResponse({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse("Internal server error", 500);
  }
}
