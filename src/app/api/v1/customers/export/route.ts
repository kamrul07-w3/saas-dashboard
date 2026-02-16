import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { errorResponse } from "@/lib/api-helpers";
import { getCustomers } from "@/lib/services/customer-service";
import { generateCSV } from "@/lib/csv";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (!authResult) return errorResponse("Unauthorized", 401);
    if (!authResult.teamId) return errorResponse("No team found", 404);

    const { customers } = await getCustomers(
      authResult.teamId,
      {},
      { skip: 0, perPage: 10000 }
    );

    const columns = [
      "name",
      "email",
      "company",
      "status",
      "plan",
      "mrr",
      "joinedAt",
    ];

    const csv = generateCSV(
      customers.map((c) => ({
        name: c.name,
        email: c.email,
        company: c.company,
        status: c.status,
        plan: c.plan,
        mrr: c.mrr,
        joinedAt: c.joinedAt.toISOString(),
      })),
      columns
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="customers-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export customers error:", error);
    return errorResponse("Internal server error", 500);
  }
}
