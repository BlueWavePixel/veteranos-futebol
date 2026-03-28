import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Team } from "@/lib/db/schema";

type TeamCardProps = {
  team: Pick<
    Team,
    | "slug"
    | "name"
    | "logoUrl"
    | "location"
    | "kitPrimary"
    | "kitSecondary"
    | "fieldName"
    | "dinnerThirdParty"
  >;
};

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/equipas/${team.slug}`}>
      <Card className="hover:border-primary/50 transition-colors h-full">
        <CardContent className="p-4 flex gap-4">
          {team.logoUrl ? (
            <img
              src={team.logoUrl.replace(/\/open\?id=/, "/uc?export=view&id=")}
              alt={`Logotipo ${team.name}`}
              className="w-16 h-16 rounded-md object-contain bg-muted"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-2xl">
              &#9917;
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{team.name}</h3>
            {team.location && (
              <p className="text-sm text-muted-foreground">{team.location}</p>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              {team.kitPrimary && (
                <Badge variant="secondary" className="text-xs">
                  {team.kitPrimary}
                </Badge>
              )}
              {team.dinnerThirdParty && (
                <Badge variant="outline" className="text-xs">
                  Jantar 3&ordf; Parte
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
