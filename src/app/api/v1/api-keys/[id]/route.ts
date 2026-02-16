import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { deleteApiKey } from "@/lib/services/api-key-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const { id } = await params;
    const result = await deleteApiKey(id, authResult.teamId);
    if (!result) return errorResponse("API key not found", 404);

    return successResponse({ message: "API key deleted" });
  } catch (error) {
    console.error("Delete API key error:", error);
    return errorResponse("Internal server error", 500);
  }
}
