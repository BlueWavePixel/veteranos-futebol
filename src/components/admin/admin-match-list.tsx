"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Match } from "@/lib/db/schema";

type Props = {
  matches: Match[];
  deleteAction: (formData: FormData) => Promise<void>;
  csrfToken?: string | null;
};

function formatDate(date: Date) {
  const d = new Date(date);
  return d.toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  const d = new Date(date);
  return d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

export function AdminMatchList({ matches, deleteAction, csrfToken }: Props) {
  if (matches.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Esta equipa não tem jogos no calendário.
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
                  {match.isHome ? "Casa" : "Fora"}
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
                  {formatDate(match.matchDate)} {formatTime(match.matchDate)}
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
            <form action={deleteAction}>
              {csrfToken && <input type="hidden" name="_csrf" value={csrfToken} />}
              <input type="hidden" name="matchId" value={match.id} />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive text-xs shrink-0"
              >
                Apagar
              </Button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
