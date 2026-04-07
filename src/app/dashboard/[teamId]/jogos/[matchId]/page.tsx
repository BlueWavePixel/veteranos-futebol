import { db } from "@/lib/db";
import { teams, matches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { getSessionCsrf, validateCsrf } from "@/lib/security/csrf";
import { MatchForm } from "@/components/teams/match-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ teamId: string; matchId: string }> };

export default async function EditMatchPage({ params }: Props) {
  const { teamId, matchId } = await params;
  const email = await requireCoordinator();
  const locale = await getLocale();

  const [team] = await db
    .select()
    .from(teams)
    .where(
      and(
        eq(teams.id, teamId),
        eq(teams.coordinatorEmail, email),
        eq(teams.isActive, true)
      )
    );

  if (!team) notFound();

  const [match] = await db
    .select()
    .from(matches)
    .where(and(eq(matches.id, matchId), eq(matches.teamId, teamId)));

  if (!match) notFound();

  const csrf = await getSessionCsrf();

  async function updateMatch(formData: FormData) {
    "use server";

    const csrfToken = formData.get("_csrf") as string;
    const csrfValid = await validateCsrf(csrfToken);
    if (!csrfValid) return;

    const dateStr = formData.get("matchDate") as string;
    const timeStr = (formData.get("matchTime") as string) || "15:00";
    const matchDate = new Date(`${dateStr}T${timeStr}`);

    await db
      .update(matches)
      .set({
        opponent: (formData.get("opponent") as string).trim(),
        matchDate,
        location: (formData.get("location") as string) || null,
        fieldName: (formData.get("fieldName") as string) || null,
        isHome: formData.get("isHome") === "on",
        goalsFor: formData.get("goalsFor")
          ? parseInt(formData.get("goalsFor") as string)
          : null,
        goalsAgainst: formData.get("goalsAgainst")
          ? parseInt(formData.get("goalsAgainst") as string)
          : null,
        notes: (formData.get("notes") as string) || null,
        updatedAt: new Date(),
      })
      .where(and(eq(matches.id, matchId), eq(matches.teamId, teamId)));

    await logAudit({
      actorType: "coordinator",
      actorEmail: email,
      action: "match_updated",
      teamId,
      details: { matchId, opponent: formData.get("opponent") },
    });

    redirect(`/dashboard/${teamId}/jogos`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("matches", "editMatch", locale)}</h1>
        <Link href={`/dashboard/${teamId}/jogos`}>
          <Button variant="outline" size="sm">
            {t("common", "back", locale)}
          </Button>
        </Link>
      </div>
      <p className="text-muted-foreground mb-6">
        vs {match.opponent}
      </p>
      <MatchForm action={updateMatch} defaultValues={match} csrfToken={csrf || undefined} />
    </div>
  );
}
