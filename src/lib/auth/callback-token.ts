import { createHmac, randomBytes } from "crypto";

// Signs email + redirect into a short-lived token passed via URL.
// The callback page verifies the signature and sets the cookie.
// This avoids setting cookies on a 302 redirect (which some browsers drop).

const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-dev-secret";
const TTL_MS = 60 * 1000; // 60 seconds

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export async function createCallbackToken(
  email: string,
  redirectTo: string
): Promise<string> {
  const expiresAt = Date.now() + TTL_MS;
  const nonce = randomBytes(8).toString("hex");
  const payload = `${email}|${redirectTo}|${expiresAt}|${nonce}`;
  const signature = sign(payload);
  // Encode as base64url for safe URL transport
  return Buffer.from(`${payload}|${signature}`).toString("base64url");
}

export async function consumeCallbackToken(
  token: string
): Promise<{ email: string; redirectTo: string } | null> {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split("|");
    if (parts.length !== 5) return null;

    const [email, redirectTo, expiresAtStr, nonce, signature] = parts;
    const payload = `${email}|${redirectTo}|${expiresAtStr}|${nonce}`;

    // Verify signature
    if (sign(payload) !== signature) return null;

    // Check expiry
    if (Date.now() > Number(expiresAtStr)) return null;

    return { email, redirectTo };
  } catch {
    return null;
  }
}
