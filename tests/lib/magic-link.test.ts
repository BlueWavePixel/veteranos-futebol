import { describe, it, expect } from "vitest";
import { createTokenHash, isTokenExpired } from "@/lib/auth/magic-link";

describe("createTokenHash", () => {
  it("creates a SHA-256 hash of the token", () => {
    const hash = createTokenHash("test-token-123");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it("produces different hashes for different tokens", () => {
    const hash1 = createTokenHash("token-a");
    const hash2 = createTokenHash("token-b");
    expect(hash1).not.toBe(hash2);
  });

  it("produces same hash for same token", () => {
    const hash1 = createTokenHash("same-token");
    const hash2 = createTokenHash("same-token");
    expect(hash1).toBe(hash2);
  });
});

describe("isTokenExpired", () => {
  it("returns false for future expiry", () => {
    const future = new Date(Date.now() + 60_000);
    expect(isTokenExpired(future)).toBe(false);
  });

  it("returns true for past expiry", () => {
    const past = new Date(Date.now() - 60_000);
    expect(isTokenExpired(past)).toBe(true);
  });
});
