import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLink } from "@/lib/auth/magic-link";
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

  // Set cookie via response headers and redirect
  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set("coordinator_email", result.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return response;
}
