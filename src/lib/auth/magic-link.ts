import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";
import { authTokens, teams, admins } from "@/lib/db/schema";
import { eq, lt } from "drizzle-orm";

const TOKEN_EXPIRY_MINUTES = 30;
export const APPROVAL_TOKEN_EXPIRY_MINUTES = 7 * 24 * 60; // 7 days

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function createTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export async function createMagicLink(
  email: string,
  expiryMinutes: number = TOKEN_EXPIRY_MINUTES,
): Promise<string | null> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email belongs to a coordinator or admin
  const teamList = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.coordinatorEmail, normalizedEmail));

  const adminList = await db
    .select({ id: admins.id })
    .from(admins)
    .where(eq(admins.email, normalizedEmail));

  // Email must belong to at least a coordinator or admin
  if (teamList.length === 0 && adminList.length === 0) return null;

  const token = generateToken();
  const hash = createTokenHash(token);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await db.insert(authTokens).values({
    email: normalizedEmail,
    tokenHash: hash,
    expiresAt,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl}/api/auth/verify?token=${token}`;
}

// Grace period: allow token reuse within 60 seconds of first use
// This handles email clients (Hotmail/Outlook Safe Links) that
// pre-fetch links automatically, consuming the token before the user clicks.
// Kept short to reduce replay attack window if the link is intercepted.
const GRACE_PERIOD_MS = 60 * 1000;

/** Opportunistic cleanup — 10% chance of running per verification call */
async function maybeCleanupExpiredTokens(): Promise<void> {
  if (Math.random() > 0.1) return;
  try {
    await db.delete(authTokens).where(lt(authTokens.expiresAt, new Date()));
  } catch (error) {
    console.error("Token cleanup failed:", error);
  }
}

export async function verifyMagicLink(
  token: string
): Promise<{ email: string } | null> {
  // Opportunistic cleanup
  await maybeCleanupExpiredTokens();

  const hash = createTokenHash(token);

  const [record] = await db
    .select()
    .from(authTokens)
    .where(eq(authTokens.tokenHash, hash));

  if (!record) return null;
  if (isTokenExpired(record.expiresAt)) return null;

  // If already used, allow within grace period
  if (record.usedAt) {
    const elapsed = Date.now() - record.usedAt.getTime();
    if (elapsed > GRACE_PERIOD_MS) return null;
    return { email: record.email };
  }

  // Mark token as used
  await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(eq(authTokens.id, record.id));

  return { email: record.email };
}
