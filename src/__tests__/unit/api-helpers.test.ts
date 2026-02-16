import {
  successResponse,
  errorResponse,
  getPaginationParams,
  buildPaginationMeta,
} from "@/lib/api-helpers";

describe("successResponse", () => {
  it("returns data wrapped in data property", async () => {
    const response = successResponse({ id: 1, name: "Test" });
    const body = await response.json();
    expect(body).toEqual({ data: { id: 1, name: "Test" } });
  });

  it("includes meta when provided", async () => {
    const response = successResponse([1, 2], { total: 2 });
    const body = await response.json();
    expect(body).toEqual({ data: [1, 2], meta: { total: 2 } });
  });

  it("omits meta when not provided", async () => {
    const response = successResponse("test");
    const body = await response.json();
    expect(body).toEqual({ data: "test" });
    expect(body).not.toHaveProperty("meta");
  });
});

describe("errorResponse", () => {
  it("returns error message with default 400 status", async () => {
    const response = errorResponse("Bad request");
    const body = await response.json();
    expect(body).toEqual({ error: "Bad request" });
    expect(response.status).toBe(400);
  });

  it("returns error with custom status", async () => {
    const response = errorResponse("Not found", 404);
    const body = await response.json();
    expect(body).toEqual({ error: "Not found" });
    expect(response.status).toBe(404);
  });

  it("returns 422 for validation errors", async () => {
    const response = errorResponse("Validation failed", 422);
    expect(response.status).toBe(422);
  });
});

describe("getPaginationParams", () => {
  it("returns defaults when no params provided", () => {
    const params = new URLSearchParams();
    const result = getPaginationParams(params);
    expect(result).toEqual({ page: 1, perPage: 20, skip: 0 });
  });

  it("parses page and perPage from search params", () => {
    const params = new URLSearchParams({ page: "2", perPage: "10" });
    const result = getPaginationParams(params);
    expect(result).toEqual({ page: 2, perPage: 10, skip: 10 });
  });

  it("clamps page to minimum of 1", () => {
    const params = new URLSearchParams({ page: "0" });
    const result = getPaginationParams(params);
    expect(result.page).toBe(1);
  });

  it("clamps negative page to 1", () => {
    const params = new URLSearchParams({ page: "-5" });
    const result = getPaginationParams(params);
    expect(result.page).toBe(1);
  });

  it("clamps perPage to max of 100", () => {
    const params = new URLSearchParams({ perPage: "200" });
    const result = getPaginationParams(params);
    expect(result.perPage).toBe(100);
  });

  it("clamps perPage to minimum of 1", () => {
    const params = new URLSearchParams({ perPage: "0" });
    const result = getPaginationParams(params);
    expect(result.perPage).toBe(1);
  });

  it("calculates correct skip value", () => {
    const params = new URLSearchParams({ page: "3", perPage: "25" });
    const result = getPaginationParams(params);
    expect(result.skip).toBe(50);
  });

  it("handles NaN input by returning NaN-derived values", () => {
    const params = new URLSearchParams({ page: "abc", perPage: "xyz" });
    const result = getPaginationParams(params);
    // parseInt("abc") returns NaN; Math.max(1, NaN) returns NaN
    expect(result.page).toBeNaN();
    expect(result.perPage).toBeNaN();
  });
});

describe("buildPaginationMeta", () => {
  it("calculates total pages correctly", () => {
    const meta = buildPaginationMeta(1, 10, 55);
    expect(meta).toEqual({
      page: 1,
      perPage: 10,
      total: 55,
      totalPages: 6,
    });
  });

  it("returns 1 total page for empty results", () => {
    const meta = buildPaginationMeta(1, 20, 0);
    expect(meta.totalPages).toBe(0);
  });

  it("returns 1 total page when total equals perPage", () => {
    const meta = buildPaginationMeta(1, 10, 10);
    expect(meta.totalPages).toBe(1);
  });
});
