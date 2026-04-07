import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need to control env before importing
const originalEnv = { ...process.env };

describe("verifyTurnstile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Reset module cache so env changes take effect
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns true for a valid token", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    process.env.NODE_ENV = "production";

    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { verifyTurnstile } = await import("@/lib/security/turnstile");
    const result = await verifyTurnstile("valid-token", "1.2.3.4");
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("returns false for an invalid token", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    process.env.NODE_ENV = "production";

    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { verifyTurnstile } = await import("@/lib/security/turnstile");
    const result = await verifyTurnstile("invalid-token", "1.2.3.4");
    expect(result).toBe(false);
  });

  it("returns false on fetch error", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    process.env.NODE_ENV = "production";

    const mockFetch = vi.fn().mockRejectedValue(new Error("network error"));
    vi.stubGlobal("fetch", mockFetch);

    const { verifyTurnstile } = await import("@/lib/security/turnstile");
    const result = await verifyTurnstile("some-token", "1.2.3.4");
    expect(result).toBe(false);
  });

  it("skips verification in dev when no secret is set", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    process.env.NODE_ENV = "development";

    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const { verifyTurnstile } = await import("@/lib/security/turnstile");
    const result = await verifyTurnstile("any-token");
    expect(result).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
