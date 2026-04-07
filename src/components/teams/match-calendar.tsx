"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { t, tFn, tArray, type Locale } from "@/lib/i18n/translations";
import type { Match } from "@/lib/db/schema";

type Props = {
  matches: Match[];
  teamSlug: string;
};

function getClientLocale(): Locale {
  if (typeof document === "undefined") return "pt";
  const match = document.cookie.match(/locale=(\w+)/);
  const val = match?.[1];
  if (val === "pt" || val === "br" || val === "es" || val === "en") return val;
  return "pt";
}

function formatDate(date: Date) {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(date: Date, locale: Locale) {
  const d = new Date(date);
  const dateLocale = locale === "en" ? "en-GB" : locale === "es" ? "es-ES" : locale === "br" ? "pt-BR" : "pt-PT";
  return d.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" });
}

function groupByMonth(matches: Match[], monthNames: readonly string[]) {
  const groups: Record<string, Match[]> = {};
  for (const match of matches) {
    const d = new Date(match.matchDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(match);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => {
      const [year, month] = key.split("-").map(Number);
      return {
        label: `${monthNames[month]} ${year}`,
        matches: items.sort(
          (a, b) =>
            new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
        ),
      };
    });
}

export function MatchCalendar({ matches, teamSlug }: Props) {
  const locale = getClientLocale();
  const monthNames = tArray("months", "list", locale);
  const now = new Date();
  const upcoming = matches.filter((m) => new Date(m.matchDate) >= now);
  const past = matches.filter((m) => new Date(m.matchDate) < now);

  const [showPast, setShowPast] = useState(false);

  const upcomingGroups = groupByMonth(upcoming, monthNames);
  const pastGroups = groupByMonth(past, monthNames).reverse();

  if (matches.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">{t("dashboard", "matchCalendar", locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {t("matches", "noMatchesCalendar", locale)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{t("dashboard", "matchCalendar", locale)}</CardTitle>
        <a
          href={`/api/calendar/${teamSlug}`}
          className="text-xs text-primary hover:underline"
        >
          {t("matches", "exportIcs", locale)}
        </a>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Próximos jogos */}
        {upcomingGroups.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {t("matches", "upcoming", locale)}
            </p>
            {upcomingGroups.map((group) => (
              <div key={group.label}>
                <p className="text-sm font-semibold mb-2">{group.label}</p>
                <div className="space-y-2">
                  {group.matches.map((match) => (
                    <MatchRow key={match.id} match={match} locale={locale} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Jogos passados */}
        {past.length > 0 && (
          <div>
            <button
              onClick={() => setShowPast(!showPast)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPast
                ? tFn("matches", "hidePastMatches", locale)(past.length)
                : tFn("matches", "showPastMatches", locale)(past.length)}
            </button>
            {showPast && (
              <div className="space-y-4 mt-4">
                {pastGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-sm font-semibold mb-2">{group.label}</p>
                    <div className="space-y-2">
                      {group.matches.map((match) => (
                        <MatchRow key={match.id} match={match} showResult locale={locale} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MatchRow({
  match,
  showResult = false,
  locale,
}: {
  match: Match;
  showResult?: boolean;
  locale: Locale;
}) {
  const isPast = new Date(match.matchDate) < new Date();
  const hasResult =
    match.goalsFor !== null && match.goalsAgainst !== null;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
        isPast ? "opacity-70" : ""
      }`}
    >
      <div className="flex flex-col items-center min-w-[60px]">
        <span className="font-mono text-xs">
          {formatDate(match.matchDate)}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {formatTime(match.matchDate, locale)}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Badge
            variant={match.isHome ? "default" : "outline"}
            className="text-[10px] px-1.5"
          >
            {match.isHome ? t("matches", "homeShort", locale) : t("matches", "awayShort", locale)}
          </Badge>
          <span className="font-medium">{match.opponent}</span>
        </div>
        {match.location && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {match.fieldName ? `${match.fieldName} — ` : ""}
            {match.location}
          </p>
        )}
      </div>
      {showResult && hasResult && (
        <div className="font-mono font-bold text-sm">
          {match.goalsFor}-{match.goalsAgainst}
        </div>
      )}
    </div>
  );
}
