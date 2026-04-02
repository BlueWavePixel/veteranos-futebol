import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLink } from "@/lib/auth/magic-link";
import { createCallbackToken } from "@/lib/auth/callback-token";
import { db } from "@/lib/db";
import { teams, admins } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  let result;
  try {
    result = await verifyMagicLink(token);
  } catch {
    return NextResponse.redirect(new URL("/login?error=expired", request.url));
  }

  if (!result) {
    return NextResponse.redirect(new URL("/login?error=expired", request.url));
  }

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
