import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { markAllAsRead } from "@/lib/services/notification-service";

export async function POST() {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);

    const result = await markAllAsRead(authResult.userId);
    return successResponse({ marked: result.count });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return errorResponse("Internal server error", 500);
  }
}
