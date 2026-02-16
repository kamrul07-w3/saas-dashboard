import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse, withValidation } from "@/lib/api-helpers";
import { getTeamById, updateTeam } from "@/lib/services/team-service";
import { updateTeamSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ teamId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);

    const { teamId } = await params;
    if (authResult.teamId !== teamId) {
      return errorResponse("Forbidden", 403);
    }

    const team = await getTeamById(teamId);
    if (!team) return errorResponse("Team not found", 404);

    return successResponse(team);
  } catch (error) {
    console.error("Get team error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);

    const { teamId } = await params;
    if (authResult.teamId !== teamId) {
      return errorResponse("Forbidden", 403);
    }

    if (authResult.role !== "OWNER" && authResult.role !== "ADMIN") {
      return errorResponse("Only owners and admins can update team settings", 403);
    }

    const validation = await withValidation(req, updateTeamSchema);
    if ("error" in validation) return validation.error;

    const team = await updateTeam(teamId, validation.data);
    return successResponse(team);
  } catch (error) {
    console.error("Update team error:", error);
    return errorResponse("Internal server error", 500);
  }
}
