import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLink } from "@/lib/auth/magic-link";
import { createCallbackToken } from "@/lib/auth/callback-token";
import { logSecurityEvent, getClientIp } from "@/lib/security/audit";
import { checkGlobalAuthLimit } from "@/lib/security/rate-limiter";
import { db } from "@/lib/db";
import { teams, admins } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || undefined;

  // Global auth rate limit: 100/IP/hour
  const globalLimit = checkGlobalAuthLimit(ip);
  if (!globalLimit.allowed) {
    await logSecurityEvent({ eventType: "rate_limited", ip, userAgent, details: { reason: "global_auth_limit" } });
    return NextResponse.redirect(new URL("/login?error=rate_limited", request.url));
  }

  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    await logSecurityEvent({ eventType: "token_invalid", ip, userAgent, details: { reason: "missing_token" } });
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  let result;
  try {
    result = await verifyMagicLink(token);
  } catch {
    await logSecurityEvent({ eventType: "token_expired", ip, userAgent, details: { reason: "verification_threw" } });
    return NextResponse.redirect(new URL("/login?error=expired", request.url));
  }

  if (!result) {
    await logSecurityEvent({ eventType: "token_expired", ip, userAgent, details: { reason: "token_not_found_or_expired" } });
    return NextResponse.redirect(new URL("/login?error=expired", request.url));
  }

  // login_success is logged in /auth/callback when session cookie is set

  // Determine redirect destination
  let redirectTo = "/dashboard";

  // Check if admin
  const [admin] = await db
    .select({ id: admins.id })
    .from(admins)
    .where(eq(admins.email, result.email));

  if (admin) {
    redirectTo = "/admin";
  } else {
    // Check RGPD consent for coordinators
    const pendingTeams = await db
      .select({ id: teams.id })
      .from(teams)
      .where(
        and(
          eq(teams.coordinatorEmail, result.email),
          eq(teams.rgpdConsent, false)
        )
      );

    if (pendingTeams.length > 0) {
      redirectTo = "/dashboard/consentimento";
    }
  }

  // Create a short-lived callback token to pass email securely
  const callbackToken = await createCallbackToken(result.email, redirectTo);

  const callbackUrl = new URL("/auth/callback", request.url);
  callbackUrl.searchParams.set("t", callbackToken);
  return NextResponse.redirect(callbackUrl);
}
