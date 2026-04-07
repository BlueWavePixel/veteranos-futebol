import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error("AUTH_SECRET environment variable is required");
const SECRET_KEY = new TextEncoder().encode(secret);
const COOKIE_NAME = "session";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export type SessionPayload = {
  email: string;
  role: string;
  csrf?: string;
};

export async function signSessionJwt(
  email: string,
  role: string,
  csrf?: string
): Promise<string> {
  const payload: Record<string, unknown> = { email, role };
  if (csrf) payload.csrf = csrf;

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET_KEY);
}

export async function verifySessionJwt(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (!payload.email || !payload.role) return null;
    return {
      email: payload.email as string,
      role: payload.role as string,
      csrf: (payload.csrf as string) || undefined,
    };
  } catch {
    return null;
  }
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionJwt(token);
}

export async function setSessionCookie(
  email: string,
  role: string,
  csrf?: string
): Promise<string> {
  const token = await signSessionJwt(email, role, csrf);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: MAX_AGE,
    path: "/",
  });
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// --- Convenience helpers (backwards-compatible API) ---

export async function getCoordinatorEmail(): Promise<string | null> {
  const session = await getSessionPayload();
  return session?.email || null;
}

export async function requireCoordinator(): Promise<string> {
  const email = await getCoordinatorEmail();
  if (!email) redirect("/login");
  return email;
}

export async function getAdminSession() {
  const session = await getSessionPayload();
  if (!session) return null;

  // If the JWT already says coordinator, skip DB lookup
  if (session.role === "coordinator") return null;

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, session.email));

  return admin || null;
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) redirect("/login");
  return admin;
}

export async function requireSuperAdmin() {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") redirect("/admin");
  return admin;
}
