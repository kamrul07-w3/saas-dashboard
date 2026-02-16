import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { getFeatureUsageSnapshots } from "@/lib/services/analytics-service";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const searchParams = req.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const now = new Date();
    const dateRange = {
      from: from ? new Date(from) : new Date(now.getFullYear(), now.getMonth() - 3, 1),
      to: to ? new Date(to) : now,
    };

    const snapshots = await getFeatureUsageSnapshots(authResult.teamId, dateRange);
    return successResponse({ snapshots });
  } catch (error) {
    console.error("Feature usage analytics error:", error);
    return errorResponse("Internal server error", 500);
  }
}
