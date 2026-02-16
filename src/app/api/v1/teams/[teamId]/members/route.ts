import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { getTeamById } from "@/lib/services/team-service";

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

    return successResponse(team.members);
  } catch (error) {
    console.error("List members error:", error);
    return errorResponse("Internal server error", 500);
  }
}
