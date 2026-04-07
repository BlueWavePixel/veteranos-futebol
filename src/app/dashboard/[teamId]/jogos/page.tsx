import { db } from "@/lib/db";
import { teams, matches } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { getSessionCsrf, validateCsrf } from "@/lib/security/csrf";
import { MatchForm } from "@/components/teams/match-form";
import { MatchList } from "@/components/teams/match-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ teamId: string }> };

export default async function MatchesPage({ params }: Props) {
  const { teamId } = await params;
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

  const csrf = await getSessionCsrf();

  const teamMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.teamId, teamId))
    .orderBy(asc(matches.matchDate));

  const now = new Date();
  const upcoming = teamMatches.filter((m) => new Date(m.matchDate) >= now);
  const past = teamMatches
    .filter((m) => new Date(m.matchDate) < now)
    .reverse();

  async function addMatch(formData: FormData) {
    "use server";

    const csrfToken = formData.get("_csrf") as string;
    const csrfValid = await validateCsrf(csrfToken);
    if (!csrfValid) return;

    const dateStr = formData.get("matchDate") as string;
    const timeStr = (formData.get("matchTime") as string) || "15:00";
    const matchDate = new Date(`${dateStr}T${timeStr}`);

    await db.insert(matches).values({
      teamId,
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
    });

    await logAudit({
      actorType: "coordinator",
      actorEmail: email,
      action: "match_created",
      teamId,
      details: { opponent: formData.get("opponent") },
    });

    redirect(`/dashboard/${teamId}/jogos`);
  }

  async function deleteMatch(formData: FormData) {
    "use server";

    const csrfToken = formData.get("_csrf") as string;
    const csrfValid = await validateCsrf(csrfToken);
    if (!csrfValid) return;

    const matchId = formData.get("matchId") as string;

    await db.delete(matches).where(
      and(eq(matches.id, matchId), eq(matches.teamId, teamId))
    );

    await logAudit({
      actorType: "coordinator",
      actorEmail: email,
      action: "match_deleted",
      teamId,
      details: { matchId },
    });

    redirect(`/dashboard/${teamId}/jogos`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("matches", "title", locale)} — {team.name}</h1>
        <Link href={`/dashboard/${teamId}`}>
          <Button variant="outline" size="sm">
            {t("common", "back", locale)}
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t("matches", "addMatch", locale)}</h2>
        <MatchForm action={addMatch} csrfToken={csrf || undefined} />
      </div>

      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {t("matches", "upcoming", locale)} ({upcoming.length})
          </h2>
          <MatchList matches={upcoming} teamId={teamId} deleteAction={deleteMatch} csrfToken={csrf || undefined} />
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {t("matches", "past", locale)} ({past.length})
          </h2>
          <MatchList matches={past} teamId={teamId} deleteAction={deleteMatch} csrfToken={csrf || undefined} />
        </div>
      )}

      {teamMatches.length === 0 && (
        <p className="text-muted-foreground text-sm">
          {t("matches", "noMatches", locale)}
        </p>
      )}
    </div>
  );
}
