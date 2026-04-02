import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";
import { authTokens, teams, admins } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

const TOKEN_EXPIRY_HOURS = 24;

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function createTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export async function createMagicLink(email: string): Promise<string | null> {
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
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await db.insert(authTokens).values({
    email: normalizedEmail,
    tokenHash: hash,
    expiresAt,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl}/api/auth/verify?token=${token}`;
}

// Grace period: allow token reuse within 5 minutes of first use
// This handles email clients (Hotmail/Outlook Safe Links) that
// pre-fetch links automatically, consuming the token before the user clicks
const GRACE_PERIOD_MS = 15 * 60 * 1000;

export async function verifyMagicLink(
  token: string
): Promise<{ email: string } | null> {
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
