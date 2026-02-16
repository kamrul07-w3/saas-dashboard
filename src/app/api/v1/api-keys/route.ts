import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse, withValidation } from "@/lib/api-helpers";
import { getApiKeys, createApiKey } from "@/lib/services/api-key-service";
import { createApiKeySchema } from "@/lib/validations";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const apiKeys = await getApiKeys(authResult.teamId);
    return successResponse(apiKeys);
  } catch (error) {
    console.error("List API keys error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const validation = await withValidation(req, createApiKeySchema);
    if ("error" in validation) return validation.error;

    const result = await createApiKey(
      authResult.teamId,
      authResult.userId,
      validation.data.name
    );

    return successResponse(result);
  } catch (error) {
    console.error("Create API key error:", error);
    return errorResponse("Internal server error", 500);
  }
}
