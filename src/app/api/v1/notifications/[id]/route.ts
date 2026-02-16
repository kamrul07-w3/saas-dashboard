import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import {
  markAsRead,
  deleteNotification,
} from "@/lib/services/notification-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    const notification = await markAsRead(id, authResult.userId);
    if (!notification) return errorResponse("Notification not found", 404);

    return successResponse(notification);
  } catch (error) {
    console.error("Mark notification read error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    const result = await deleteNotification(id, authResult.userId);
    if (!result) return errorResponse("Notification not found", 404);

    return successResponse({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return errorResponse("Internal server error", 500);
  }
}
