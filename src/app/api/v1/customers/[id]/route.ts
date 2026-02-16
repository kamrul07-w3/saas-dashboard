import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { successResponse, errorResponse, withValidation } from "@/lib/api-helpers";
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "@/lib/services/customer-service";
import { updateCustomerSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const { id } = await params;
    const customer = await getCustomerById(id, authResult.teamId);
    if (!customer) return errorResponse("Customer not found", 404);

    return successResponse(customer);
  } catch (error) {
    console.error("Get customer error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const { id } = await params;
    const existing = await getCustomerById(id, authResult.teamId);
    if (!existing) return errorResponse("Customer not found", 404);

    const validation = await withValidation(req, updateCustomerSchema);
    if ("error" in validation) return validation.error;

    const customer = await updateCustomer(id, authResult.teamId, validation.data);
    return successResponse(customer);
  } catch (error) {
    console.error("Update customer error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const { id } = await params;
    const result = await deleteCustomer(id, authResult.teamId);
    if (!result) return errorResponse("Customer not found", 404);

    return successResponse({ message: "Customer deleted" });
  } catch (error) {
    console.error("Delete customer error:", error);
    return errorResponse("Internal server error", 500);
  }
}
