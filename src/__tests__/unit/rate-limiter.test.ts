// We need to mock the constants before importing rate-limiter
// because rate-limiter starts a setInterval on import
jest.mock("@/lib/constants", () => ({
  RATE_LIMIT: {
    WINDOW_MS: 60000,
    MAX_REQUESTS: 60,
  },
}));

import { rateLimit } from "@/lib/rate-limiter";

describe("rateLimit", () => {
  beforeEach(() => {
    // Reset the module between tests to clear the in-memory store
    jest.resetModules();
  });

  it("allows first request", () => {
    const result = rateLimit("192.168.1.1", 5, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("allows requests within the limit", () => {
    const ip = "10.0.0.1";
    const limit = 3;
    const window = 60000;

    const r1 = rateLimit(ip, limit, window);
    const r2 = rateLimit(ip, limit, window);
    const r3 = rateLimit(ip, limit, window);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests exceeding the limit", () => {
    const ip = "10.0.0.2";
    const limit = 2;
    const window = 60000;

    rateLimit(ip, limit, window);
    rateLimit(ip, limit, window);
    const result = rateLimit(ip, limit, window);

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different IPs separately", () => {
    const limit = 1;
    const window = 60000;

    const r1 = rateLimit("1.1.1.1", limit, window);
    const r2 = rateLimit("2.2.2.2", limit, window);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it("resets after the window expires", () => {
    const ip = "10.0.0.3";
    const limit = 1;
    const window = 100; // 100ms window

    rateLimit(ip, limit, window);
    // Second request should be blocked
    const blocked = rateLimit(ip, limit, window);
    expect(blocked.success).toBe(false);

    // Wait for the window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = rateLimit(ip, limit, window);
        expect(result.success).toBe(true);
        resolve();
      }, 150);
    });
  });

  it("decrements remaining count correctly", () => {
    const ip = "10.0.0.4";
    const limit = 5;
    const window = 60000;

    const r1 = rateLimit(ip, limit, window);
    expect(r1.remaining).toBe(4);

    const r2 = rateLimit(ip, limit, window);
    expect(r2.remaining).toBe(3);

    const r3 = rateLimit(ip, limit, window);
    expect(r3.remaining).toBe(2);
  });
});
