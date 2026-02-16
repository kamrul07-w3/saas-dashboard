import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse, withValidation } from "@/lib/api-helpers";
import { removeMember, updateMemberRole } from "@/lib/services/team-service";
import { z } from "zod";

type RouteParams = { params: Promise<{ teamId: string; memberId: string }> };

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);

    const { teamId, memberId } = await params;
    if (authResult.teamId !== teamId) {
      return errorResponse("Forbidden", 403);
    }

    if (authResult.role !== "OWNER" && authResult.role !== "ADMIN") {
      return errorResponse("Only owners and admins can update member roles", 403);
    }

    const validation = await withValidation(req, updateRoleSchema);
    if ("error" in validation) return validation.error;

    const member = await updateMemberRole(memberId, teamId, validation.data.role);
    if (!member) return errorResponse("Member not found", 404);

    return successResponse(member);
  } catch (error) {
    console.error("Update member role error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);

    const { teamId, memberId } = await params;
    if (authResult.teamId !== teamId) {
      return errorResponse("Forbidden", 403);
    }

    if (authResult.role !== "OWNER" && authResult.role !== "ADMIN") {
      return errorResponse("Only owners and admins can remove members", 403);
    }

    const result = await removeMember(memberId, teamId);
    if (!result) return errorResponse("Member not found", 404);

    return successResponse({ message: "Member removed" });
  } catch (error) {
    console.error("Remove member error:", error);
    return errorResponse("Internal server error", 500);
  }
}
