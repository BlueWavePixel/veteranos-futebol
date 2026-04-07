import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimits } from "@/lib/security/rate-limiter";

beforeEach(() => {
  resetRateLimits();
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const r1 = checkRateLimit("test-key", 3, 60_000);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit("test-key", 3, 60_000);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit("test-key", 3, 60_000);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests over the limit", () => {
    checkRateLimit("block-key", 2, 60_000);
    checkRateLimit("block-key", 2, 60_000);

    const r = checkRateLimit("block-key", 2, 60_000);
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("uses independent keys", () => {
    checkRateLimit("key-a", 1, 60_000);
    const overA = checkRateLimit("key-a", 1, 60_000);
    expect(overA.allowed).toBe(false);

    // key-b should still be fresh
    const freshB = checkRateLimit("key-b", 1, 60_000);
    expect(freshB.allowed).toBe(true);
  });

  it("resets after the window expires", () => {
    // Use a 1ms window so it expires immediately
    checkRateLimit("expire-key", 1, 1);

    // Wait a tiny bit for the window to pass
    const start = Date.now();
    while (Date.now() - start < 5) {
      /* spin */
    }

    const r = checkRateLimit("expire-key", 1, 1);
    expect(r.allowed).toBe(true);
  });

  it("resetRateLimits clears all entries", () => {
    checkRateLimit("clear-key", 1, 60_000);
    checkRateLimit("clear-key", 1, 60_000); // now blocked

    resetRateLimits();

    const r = checkRateLimit("clear-key", 1, 60_000);
    expect(r.allowed).toBe(true);
  });
});
