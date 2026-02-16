import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { revokeApiKey } from "@/lib/services/api-key-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const { id } = await params;
    const result = await revokeApiKey(id, authResult.teamId);
    if (!result) return errorResponse("API key not found", 404);

    return successResponse(result);
  } catch (error) {
    console.error("Revoke API key error:", error);
    return errorResponse("Internal server error", 500);
  }
}
