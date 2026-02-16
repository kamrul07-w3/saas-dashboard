// Global mocks for Jest

// Mock next/server's NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status ?? 200,
      body,
    }),
  },
}));
