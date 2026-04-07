"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t, type Locale } from "@/lib/i18n/translations";
import type { Match } from "@/lib/db/schema";

type Props = {
  matches: Match[];
  teamId: string;
  deleteAction: (formData: FormData) => Promise<void>;
  csrfToken?: string;
};

function getClientLocale(): Locale {
  if (typeof document === "undefined") return "pt";
  const match = document.cookie.match(/locale=(\w+)/);
  const val = match?.[1];
  if (val === "pt" || val === "br" || val === "es" || val === "en") return val;
  return "pt";
}

function getDateLocale(locale: Locale) {
  return locale === "en" ? "en-GB" : locale === "es" ? "es-ES" : locale === "br" ? "pt-BR" : "pt-PT";
}

function formatDate(date: Date, dateLocale: string) {
  const d = new Date(date);
  return d.toLocaleDateString(dateLocale, {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(date: Date, dateLocale: string) {
  const d = new Date(date);
  return d.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" });
}

export function MatchList({ matches, teamId, deleteAction, csrfToken }: Props) {
  const locale = getClientLocale();
  const dateLocale = getDateLocale(locale);

  if (matches.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        {t("matches", "noMatches", locale)}
      </p>
    );
  }

  const now = new Date();

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const isPast = new Date(match.matchDate) < now;
        const hasResult =
          match.goalsFor !== null && match.goalsAgainst !== null;

        return (
          <div
            key={match.id}
            className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 ${
              isPast ? "opacity-60" : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={match.isHome ? "default" : "outline"}
                  className="text-[10px] px-1.5"
                >
                  {match.isHome ? t("matches", "home", locale) : t("matches", "away", locale)}
                </Badge>
                <span className="font-medium truncate">
                  vs {match.opponent}
                </span>
                {hasResult && (
                  <span className="font-mono font-bold text-sm">
                    {match.goalsFor}-{match.goalsAgainst}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1 space-x-2">
                <span>
                  {formatDate(match.matchDate, dateLocale)} {formatTime(match.matchDate, dateLocale)}
                </span>
                {match.location && <span>· {match.location}</span>}
                {match.fieldName && <span>· {match.fieldName}</span>}
              </div>
              {match.notes && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  {match.notes}
                </p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <Link href={`/dashboard/${teamId}/jogos/${match.id}`}>
                <Button variant="ghost" size="sm" className="text-xs">
                  {t("common", "edit", locale)}
                </Button>
              </Link>
              <form action={deleteAction}>
                {csrfToken && <input type="hidden" name="_csrf" value={csrfToken} />}
                <input type="hidden" name="matchId" value={match.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive text-xs"
                >
                  {t("common", "delete", locale)}
                </Button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}
