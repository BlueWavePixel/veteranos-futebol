import { db } from "@/lib/db";
import { teams, matches } from "@/lib/db/schema";
import { eq, and, count, gte } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/lib/i18n/get-locale";
import { t, tFn } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const email = await requireCoordinator();
  const locale = await getLocale();

  const myTeams = await db
    .select()
    .from(teams)
    .where(and(eq(teams.coordinatorEmail, email), eq(teams.isActive, true)));

  const inactiveTeams = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(and(eq(teams.coordinatorEmail, email), eq(teams.isActive, false)));

  // Contar jogos futuros por equipa
  const now = new Date();
  const matchCounts: Record<string, number> = {};
  for (const team of myTeams) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(matches)
      .where(and(eq(matches.teamId, team.id), gte(matches.matchDate, now)));
    matchCounts[team.id] = total;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">{t("dashboard", "title", locale)}</h1>
      <p className="text-muted-foreground mb-6">
        {t("dashboard", "welcome", locale)}
      </p>

      {/* Ajuda / Resumo */}
      <Card className="mb-8 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">{t("dashboard", "whatCanYouDo", locale)}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>
            <strong className="text-foreground">✏️ {t("dashboard", "helpEditTeam", locale)}</strong> —{" "}
            {t("dashboard", "helpEditTeamDesc", locale)}
          </p>
          <p>
            <strong className="text-foreground">📅 {t("dashboard", "helpMatchCalendar", locale)}</strong>{" "}
            — {t("dashboard", "helpMatchCalendarDesc", locale)}
          </p>
          <p>
            <strong className="text-foreground">🔄 {t("dashboard", "helpTransfer", locale)}</strong>{" "}
            — {t("dashboard", "helpTransferDesc", locale)}
          </p>
          <p>
            <strong className="text-foreground">💡 {t("dashboard", "helpSuggestions", locale)}</strong> — {t("dashboard", "helpSuggestionsDesc", locale)}{" "}
            <Link href="/sugestoes" className="text-primary hover:underline">
              {t("dashboard", "helpSuggestionsLink", locale)}
            </Link>{" "}
            {t("dashboard", "helpSuggestionsLinkSuffix", locale)}
          </p>
          <p>
            <strong className="text-foreground">🗑️ {t("dashboard", "helpDeleteTeam", locale)}</strong> —{" "}
            {t("dashboard", "helpDeleteTeamDesc", locale)}
          </p>
        </CardContent>
      </Card>

      {/* Aviso equipas desativadas */}
      {inactiveTeams.length > 0 && (
        <Card className="mb-6 border-orange-500/50 bg-orange-500/10">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-orange-400 mb-1">
              ⚠ {t("common", "teams", locale)} {inactiveTeams.length > 1 ? t("dashboard", "inactiveTeamWarningPlural", locale) : t("dashboard", "inactiveTeamWarning", locale)}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>{inactiveTeams.map((tm) => tm.name).join(", ")}</strong>{" "}
              {t("dashboard", "inactiveTeamDesc", locale)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Equipas */}
      {myTeams.length === 0 && inactiveTeams.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              {t("dashboard", "noTeams", locale)}
            </p>
            <Link href="/registar">
              <Button>{t("dashboard", "registerTeam", locale)}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : myTeams.length === 0 ? null : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {myTeams.length === 1 ? t("dashboard", "myTeam", locale) : t("dashboard", "myTeams", locale)}
          </h2>
          {myTeams.map((team) => (
            <Card key={team.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    {team.logoUrl ? (
                      <Image
                        src={team.logoUrl}
                        alt={team.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-contain bg-muted"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl">
                        ⚽
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {team.location}
                      </p>
                    </div>
                  </div>
                  {matchCounts[team.id] > 0 && (
                    <span className="text-xs text-primary font-medium">
                      {tFn("dashboard", "matchesScheduled", locale)(matchCounts[team.id])}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/${team.id}`}>
                    <Button size="sm">{t("dashboard", "editTeam", locale)}</Button>
                  </Link>
                  <Link href={`/dashboard/${team.id}/jogos`}>
                    <Button variant="outline" size="sm">
                      {t("dashboard", "matchCalendar", locale)}
                    </Button>
                  </Link>
                  <Link href={`/equipas/${team.slug}`}>
                    <Button variant="ghost" size="sm">
                      {t("dashboard", "viewPublicPage", locale)}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
