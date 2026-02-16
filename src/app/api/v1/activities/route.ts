import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  buildPaginationMeta,
} from "@/lib/api-helpers";
import { getActivities } from "@/lib/services/activity-service";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const searchParams = req.nextUrl.searchParams;
    const { page, perPage, skip } = getPaginationParams(searchParams);

    const { activities, total } = await getActivities(authResult.teamId, {
      skip,
      perPage,
    });

    return successResponse(activities, buildPaginationMeta(page, perPage, total));
  } catch (error) {
    console.error("List activities error:", error);
    return errorResponse("Internal server error", 500);
  }
}
