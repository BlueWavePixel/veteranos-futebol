import { db } from "@/lib/db";
import { teams, matches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { MatchCalendar } from "@/components/teams/match-calendar";
import { notFound } from "next/navigation";
import { getCoordinatorEmail } from "@/lib/auth/session";
import { TeamContact } from "@/components/teams/team-contact";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLogoUrl } from "@/lib/logo";
import { getLocale } from "@/lib/i18n/get-locale";
import { t, tObj } from "@/lib/i18n/translations";
import type { Metadata } from "next";
import Image from "next/image";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [team] = await db
    .select({ name: teams.name })
    .from(teams)
    .where(eq(teams.slug, slug));

  return {
    title: team
      ? `${team.name} · Veteranos Futebol`
      : "Team not found",
  };
}

export default async function TeamPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();

  const [team] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.slug, slug), eq(teams.isActive, true)));

  if (!team) notFound();

  const teamMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.teamId, team.id))
    .orderBy(matches.matchDate);

  const coordinatorEmail = await getCoordinatorEmail();
  const isAuthenticated = !!coordinatorEmail;

  const hasKitPrimary =
    team.kitPrimaryShirt || team.kitPrimaryShorts || team.kitPrimarySocks || team.kitPrimary;
  const hasKitSecondary =
    team.kitSecondaryShirt || team.kitSecondaryShorts || team.kitSecondarySocks || team.kitSecondary;

  const fieldTypeLabels = tObj("teamDetail", "fieldTypes", locale);
  const dateLocale = locale === "en" ? "en-GB" : locale === "es" ? "es-ES" : locale === "br" ? "pt-BR" : "pt-PT";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        {team.logoUrl ? (
          <Image
            src={
              team.logoUrl.startsWith("http") && !team.logoUrl.includes("drive.google.com")
                ? team.logoUrl
                : getLogoUrl(team.logoUrl)!
            }
            alt={team.name}
            width={96}
            height={96}
            className="w-24 h-24 rounded-lg object-contain bg-muted"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center text-4xl">
            &#9917;
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          {(team.concelho || team.location) && (
            <p className="text-muted-foreground mt-1">
              {team.concelho}
              {team.distrito && `, ${team.distrito}`}
              {!team.concelho && team.location}
            </p>
          )}
          <div className="flex gap-2 mt-3 flex-wrap">
            {team.teamTypeF11 && (
              <Badge variant="secondary">Futebol 11</Badge>
            )}
            {team.teamTypeF7 && (
              <Badge variant="secondary">Futebol 7</Badge>
            )}
            {team.teamTypeFutsal && (
              <Badge variant="secondary">Futsal</Badge>
            )}
            {team.ageGroup &&
              team.ageGroup.split(", ").map((age) => (
                <Badge key={age} variant="outline">
                  {age}
                </Badge>
              ))}
            {team.foundedYear && (
              <Badge variant="outline">{t("teamDetail", "founded", locale)} {team.foundedYear}</Badge>
            )}
            {team.playerCount && (
              <Badge variant="outline">{team.playerCount} {t("teamDetail", "players", locale)}</Badge>
            )}
            {team.createdAt && (
              <Badge variant="outline">
                {t("teamDetail", "registeredOn", locale)}{" "}
                {new Date(team.createdAt).toLocaleDateString(dateLocale, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Badge>
            )}
            {team.updatedAt &&
              team.updatedAt.getTime() !== team.createdAt.getTime() && (
                <Badge variant="outline">
                  {t("teamDetail", "updatedOn", locale)}{" "}
                  {new Date(team.updatedAt).toLocaleDateString(dateLocale, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Badge>
              )}
            {team.dinnerThirdParty && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {t("teamsDirectory", "dinnerBadge", locale)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Team Photo */}
      {team.teamPhotoUrl && (
        <div className="mb-8 relative w-full h-[400px]">
          <Image
            src={team.teamPhotoUrl}
            alt={team.name}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover rounded-lg"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipamentos */}
        {(hasKitPrimary || hasKitSecondary) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("teamDetail", "kits", locale)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasKitPrimary && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("teamDetail", "primaryKit", locale)}
                  </p>
                  {(team.kitPrimaryShirt || team.kitPrimaryShorts || team.kitPrimarySocks) ? (
                    <div className="text-sm space-y-0.5">
                      {team.kitPrimaryShirt && <p>{t("form", "shirt", locale)}: {team.kitPrimaryShirt}</p>}
                      {team.kitPrimaryShorts && <p>{t("form", "shorts", locale)}: {team.kitPrimaryShorts}</p>}
                      {team.kitPrimarySocks && <p>{t("form", "socks", locale)}: {team.kitPrimarySocks}</p>}
                    </div>
                  ) : (
                    <p className="text-sm">{team.kitPrimary}</p>
                  )}
                </div>
              )}
              {hasKitSecondary && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("teamDetail", "secondaryKit", locale)}
                  </p>
                  {(team.kitSecondaryShirt || team.kitSecondaryShorts || team.kitSecondarySocks) ? (
                    <div className="text-sm space-y-0.5">
                      {team.kitSecondaryShirt && <p>{t("form", "shirt", locale)}: {team.kitSecondaryShirt}</p>}
                      {team.kitSecondaryShorts && <p>{t("form", "shorts", locale)}: {team.kitSecondaryShorts}</p>}
                      {team.kitSecondarySocks && <p>{t("form", "socks", locale)}: {team.kitSecondarySocks}</p>}
                    </div>
                  ) : (
                    <p className="text-sm">{team.kitSecondary}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Campo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("teamDetail", "ground", locale)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {team.fieldName && <p className="font-medium">{team.fieldName}</p>}
            {team.fieldType && (
              <Badge variant="secondary" className="text-xs">
                {fieldTypeLabels[team.fieldType] || team.fieldType}
              </Badge>
            )}
            {team.fieldAddress && (
              <p className="text-sm text-muted-foreground">
                {team.fieldAddress}
              </p>
            )}
            {team.trainingSchedule && (
              <p className="text-sm">
                <span className="text-muted-foreground">{t("teamDetail", "schedule", locale)}</span>{" "}
                {team.trainingSchedule}
              </p>
            )}
            {team.mapsUrl && (
              <a
                href={team.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm inline-block mt-2"
              >
                {t("teamDetail", "viewOnMaps", locale)} &rarr;
              </a>
            )}
          </CardContent>
        </Card>

        {/* Contactos — condicional */}
        <TeamContact team={team} isAuthenticated={isAuthenticated} />

        {/* Redes Sociais */}
        {(team.socialFacebook || team.socialInstagram) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("teamDetail", "socialMedia", locale)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {team.socialFacebook && (
                <a
                  href={team.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm block"
                >
                  Facebook &rarr;
                </a>
              )}
              {team.socialInstagram && (
                <a
                  href={team.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm block"
                >
                  Instagram &rarr;
                </a>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Calendário de Jogos */}
      <MatchCalendar matches={teamMatches} teamSlug={team.slug} />

      {/* Observações */}
      {team.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">{t("form", "notes", locale)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{team.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
