import { randomBytes, timingSafeEqual as cryptoTimingSafeEqual } from "crypto";
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
  return cryptoTimingSafeEqual(a, b);
}

/**
 * Throws if the CSRF token in FormData is invalid or missing.
 * Use in admin server actions to prevent cross-site request forgery.
 * Vercel deployments share *.vercel.app — sameSite=strict is NOT sufficient.
 */
export async function requireCsrf(formData: FormData): Promise<void> {
  const token = formData.get("_csrf") as string;
  const valid = await validateCsrf(token);
  if (!valid) {
    throw new Error("CSRF inválido: a sua sessão expirou ou o pedido é inválido. Recarregue a página.");
  }
}
