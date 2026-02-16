import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { getDashboardStats } from "@/lib/services/analytics-service";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const stats = await getDashboardStats(authResult.teamId);
    return successResponse(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return errorResponse("Internal server error", 500);
  }
}
