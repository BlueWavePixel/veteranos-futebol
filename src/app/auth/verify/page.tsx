import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyMagicLink } from "@/lib/auth/magic-link";
import { db } from "@/lib/db";
import { teams, admins } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/login?error=invalid");
  }

  const result = await verifyMagicLink(token);

  if (!result) {
    redirect("/login?error=expired");
  }

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set("coordinator_email", result.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  // Check if user is an admin → redirect to admin panel
  const [admin] = await db
    .select({ id: admins.id })
    .from(admins)
    .where(eq(admins.email, result.email));

  if (admin) {
    redirect("/admin");
  }

  // Check if any teams need RGPD consent
  const pendingTeams = await db
    .select({ id: teams.id })
    .from(teams)
    .where(
      and(eq(teams.coordinatorEmail, result.email), eq(teams.rgpdConsent, false))
    );

  if (pendingTeams.length > 0) {
    redirect("/dashboard/consentimento");
  }

  redirect("/dashboard");
}
