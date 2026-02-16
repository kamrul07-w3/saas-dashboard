import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PAGINATION } from "@/lib/constants";

export function successResponse<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) });
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function withValidation<T extends z.ZodType>(
  req: NextRequest,
  schema: T
): Promise<{ data: z.infer<T> } | { error: NextResponse }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const message = result.error.issues
        .map((i) => i.message)
        .join(", ");
      return { error: errorResponse(message, 422) };
    }
    return { data: result.data };
  } catch {
    return { error: errorResponse("Invalid JSON body", 400) };
  }
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(
    1,
    parseInt(searchParams.get("page") || String(PAGINATION.DEFAULT_PAGE), 10)
  );
  const perPage = Math.min(
    PAGINATION.MAX_PER_PAGE,
    Math.max(
      1,
      parseInt(
        searchParams.get("perPage") || String(PAGINATION.DEFAULT_PER_PAGE),
        10
      )
    )
  );
  const skip = (page - 1) * perPage;
  return { page, perPage, skip };
}

export function buildPaginationMeta(
  page: number,
  perPage: number,
  total: number
) {
  return {
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
  };
}
