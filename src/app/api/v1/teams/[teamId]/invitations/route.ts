import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import {
  successResponse,
  errorResponse,
  withValidation,
} from "@/lib/api-helpers";
import { createInvitation, getInvitations } from "@/lib/services/team-service";
import { inviteMemberSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ teamId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);

    const { teamId } = await params;
    if (authResult.teamId !== teamId) {
      return errorResponse("Forbidden", 403);
    }

    const invitations = await getInvitations(teamId);
    return successResponse(invitations);
  } catch (error) {
    console.error("List invitations error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);

    const { teamId } = await params;
    if (authResult.teamId !== teamId) {
      return errorResponse("Forbidden", 403);
    }

    if (authResult.role !== "OWNER" && authResult.role !== "ADMIN") {
      return errorResponse("Only owners and admins can send invitations", 403);
    }

    const validation = await withValidation(req, inviteMemberSchema);
    if ("error" in validation) return validation.error;

    const invitation = await createInvitation(
      teamId,
      validation.data.email,
      validation.data.role
    );
    return successResponse(invitation);
  } catch (error) {
    console.error("Create invitation error:", error);
    return errorResponse("Internal server error", 500);
  }
}
