import { randomBytes } from "crypto";
import { getSessionPayload } from "@/lib/auth/session";

/** Generate a random CSRF token (hex string) */
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

/** Read the CSRF claim from the current session JWT */
export async function getSessionCsrf(): Promise<string | null> {
  const session = await getSessionPayload();
  return session?.csrf || null;
}

/**
 * Validate a CSRF token from a form/request against the one stored in the
 * session JWT. Returns true if they match.
 */
export async function validateCsrf(formToken: string): Promise<boolean> {
  if (!formToken) return false;
  const sessionCsrf = await getSessionCsrf();
  if (!sessionCsrf) return false;

  // Constant-time comparison
  if (formToken.length !== sessionCsrf.length) return false;
  const a = Buffer.from(formToken);
  const b = Buffer.from(sessionCsrf);
  return a.length === b.length && timingSafeEqual(a, b);
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  // Use crypto.timingSafeEqual if available, otherwise manual
  try {
    const { timingSafeEqual: tse } = require("crypto");
    return tse(a, b);
  } catch {
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  }
}
