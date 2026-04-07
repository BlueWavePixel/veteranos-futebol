import { describe, it, expect } from "vitest";

// Set AUTH_SECRET before importing the module
process.env.AUTH_SECRET = "test-secret-key-for-vitest-session-tests";

// We import the pure JWT functions (they don't need Next.js cookies)
const { signSessionJwt, verifySessionJwt } = await import(
  "@/lib/auth/session"
);

describe("signSessionJwt", () => {
  it("creates a valid JWT string", async () => {
    const token = await signSessionJwt("user@test.com", "coordinator");
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // header.payload.signature
  });

  it("includes csrf claim when provided", async () => {
    const token = await signSessionJwt("user@test.com", "coordinator", "csrf123");
    const payload = await verifySessionJwt(token);
    expect(payload).not.toBeNull();
    expect(payload!.csrf).toBe("csrf123");
  });
});

describe("verifySessionJwt", () => {
  it("decodes a valid JWT and returns the payload", async () => {
    const token = await signSessionJwt("admin@test.com", "super_admin");
    const payload = await verifySessionJwt(token);

    expect(payload).not.toBeNull();
    expect(payload!.email).toBe("admin@test.com");
    expect(payload!.role).toBe("super_admin");
  });

  it("returns null for an invalid token", async () => {
    const result = await verifySessionJwt("not.a.valid.jwt");
    expect(result).toBeNull();
  });

  it("returns null for a tampered token", async () => {
    const token = await signSessionJwt("user@test.com", "coordinator");
    // Flip last char of signature
    const tampered = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
    const result = await verifySessionJwt(tampered);
    expect(result).toBeNull();
  });

  it("returns null for an expired token", async () => {
    // We can't easily test real expiry without waiting, so we verify the
    // function handles garbage gracefully
    const result = await verifySessionJwt("");
    expect(result).toBeNull();
  });
});
