import { describe, it, expect, vi } from "vitest";
import { generateCsrfToken } from "@/lib/security/csrf";

// Mock the session module so we don't need Next.js cookies
vi.mock("@/lib/auth/session", () => ({
  getSessionPayload: vi.fn(),
}));

import { getSessionPayload } from "@/lib/auth/session";
import { validateCsrf, getSessionCsrf } from "@/lib/security/csrf";

const mockedGetSessionPayload = vi.mocked(getSessionPayload);

describe("generateCsrfToken", () => {
  it("returns a hex string of 64 chars (32 bytes)", () => {
    const token = generateCsrfToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("produces unique tokens", () => {
    const t1 = generateCsrfToken();
    const t2 = generateCsrfToken();
    expect(t1).not.toBe(t2);
  });
});

describe("getSessionCsrf", () => {
  it("returns csrf from session", async () => {
    mockedGetSessionPayload.mockResolvedValue({
      email: "a@b.com",
      role: "coordinator",
      csrf: "abc123",
    });

    const csrf = await getSessionCsrf();
    expect(csrf).toBe("abc123");
  });

  it("returns null when no session", async () => {
    mockedGetSessionPayload.mockResolvedValue(null);
    const csrf = await getSessionCsrf();
    expect(csrf).toBeNull();
  });
});

describe("validateCsrf", () => {
  it("returns true when tokens match", async () => {
    const token = generateCsrfToken();
    mockedGetSessionPayload.mockResolvedValue({
      email: "a@b.com",
      role: "coordinator",
      csrf: token,
    });

    const result = await validateCsrf(token);
    expect(result).toBe(true);
  });

  it("returns false when tokens differ", async () => {
    mockedGetSessionPayload.mockResolvedValue({
      email: "a@b.com",
      role: "coordinator",
      csrf: "real-csrf-token-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });

    const result = await validateCsrf(
      "fake-csrf-token-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    );
    expect(result).toBe(false);
  });

  it("returns false when no session", async () => {
    mockedGetSessionPayload.mockResolvedValue(null);
    const result = await validateCsrf("any-token");
    expect(result).toBe(false);
  });

  it("returns false for empty token", async () => {
    mockedGetSessionPayload.mockResolvedValue({
      email: "a@b.com",
      role: "coordinator",
      csrf: "some-csrf",
    });

    const result = await validateCsrf("");
    expect(result).toBe(false);
  });
});
