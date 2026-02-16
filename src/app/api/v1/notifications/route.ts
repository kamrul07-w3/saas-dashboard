import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  buildPaginationMeta,
} from "@/lib/api-helpers";
import {
  getNotifications,
  getUnreadCount,
} from "@/lib/services/notification-service";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);

    const searchParams = req.nextUrl.searchParams;
    const { page, perPage, skip } = getPaginationParams(searchParams);

    const [{ notifications, total }, unreadCount] = await Promise.all([
      getNotifications(authResult.userId, { skip, perPage }),
      getUnreadCount(authResult.userId),
    ]);

    return successResponse(notifications, {
      ...buildPaginationMeta(page, perPage, total),
      unreadCount,
    });
  } catch (error) {
    console.error("List notifications error:", error);
    return errorResponse("Internal server error", 500);
  }
}
