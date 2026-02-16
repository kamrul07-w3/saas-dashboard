import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import {
  successResponse,
  errorResponse,
  withValidation,
  getPaginationParams,
  buildPaginationMeta,
} from "@/lib/api-helpers";
import { getCustomers, createCustomer } from "@/lib/services/customer-service";
import { createCustomerSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const searchParams = req.nextUrl.searchParams;
    const { page, perPage, skip } = getPaginationParams(searchParams);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    const { customers, total } = await getCustomers(
      authResult.teamId,
      { search, status },
      { skip, perPage }
    );

    return successResponse(customers, buildPaginationMeta(page, perPage, total));
  } catch (error) {
    console.error("List customers error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const validation = await withValidation(req, createCustomerSchema);
    if ("error" in validation) return validation.error;

    const customer = await createCustomer(authResult.teamId, validation.data);
    return successResponse(customer);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return errorResponse("A customer with this email already exists in your team", 409);
    }
    console.error("Create customer error:", error);
    return errorResponse("Internal server error", 500);
  }
}
