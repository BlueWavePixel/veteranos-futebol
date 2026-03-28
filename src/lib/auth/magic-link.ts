import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";
import { authTokens, teams } from "@/lib/db/schema";
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
  // Find teams with this email
  const teamList = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.coordinatorEmail, email.toLowerCase().trim()));

  if (teamList.length === 0) return null;

  const token = generateToken();
  const hash = createTokenHash(token);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Store token (email-based, not team-specific — covers multi-team coordinators)
  await db.insert(authTokens).values({
    email: email.toLowerCase().trim(),
    tokenHash: hash,
    expiresAt,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl}/auth/verify?token=${token}`;
}

export async function verifyMagicLink(
  token: string
): Promise<{ email: string } | null> {
  const hash = createTokenHash(token);

  const [record] = await db
    .select()
    .from(authTokens)
    .where(and(eq(authTokens.tokenHash, hash), isNull(authTokens.usedAt)));

  if (!record) return null;
  if (isTokenExpired(record.expiresAt)) return null;

  // Mark token as used
  await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(eq(authTokens.id, record.id));

  return { email: record.email };
}
