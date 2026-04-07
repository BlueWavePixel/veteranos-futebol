import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { t } from "@/lib/i18n/translations";
import { getLocale } from "@/lib/i18n/get-locale";
import type { Team } from "@/lib/db/schema";

type Props = {
  team: Pick<
    Team,
    | "coordinatorName"
    | "coordinatorAltName"
    | "coordinatorPhone"
    | "coordinatorAltPhone"
    | "coordinatorEmail"
  >;
  isAuthenticated: boolean;
};

export async function TeamContact({ team, isAuthenticated }: Props) {
  const locale = await getLocale();

  if (!isAuthenticated) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            {t("teamDetail", "registerToSeeContacts", locale)}
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/registar">
              <Button variant="outline" size="sm">
                {t("header", "registerTeam", locale)}
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">{t("teamDetail", "alreadyHaveTeam", locale)}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("teamDetail", "contacts", locale)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">{t("form", "coordinator", locale)}</p>
          <p className="font-medium">{team.coordinatorName}</p>
          {team.coordinatorPhone && (
            <a
              href={`tel:${team.coordinatorPhone}`}
              className="text-primary hover:underline text-sm"
            >
              {team.coordinatorPhone}
            </a>
          )}
        </div>
        {team.coordinatorAltName && (
          <div>
            <p className="text-sm text-muted-foreground">
              {t("teamDetail", "altCoordinator", locale)}
            </p>
            <p className="font-medium">{team.coordinatorAltName}</p>
            {team.coordinatorAltPhone && (
              <a
                href={`tel:${team.coordinatorAltPhone}`}
                className="text-primary hover:underline text-sm"
              >
                {team.coordinatorAltPhone}
              </a>
            )}
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">{t("common", "email", locale)}</p>
          <a
            href={`mailto:${team.coordinatorEmail}`}
            className="text-primary hover:underline text-sm"
          >
            {team.coordinatorEmail}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
