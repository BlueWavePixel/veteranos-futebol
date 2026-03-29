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
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const FIELD_TYPE_LABELS: Record<string, string> = {
  sintetico: "Sintético",
  relva: "Relva Natural",
  pelado: "Pelado",
  futsal: "Futsal (pavilhão)",
  outro: "Outro",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [team] = await db
    .select({ name: teams.name })
    .from(teams)
    .where(eq(teams.slug, slug));

  return {
    title: team
      ? `${team.name} — Veteranos Futebol`
      : "Equipa não encontrada",
  };
}

export default async function TeamPage({ params }: Props) {
  const { slug } = await params;

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        {team.logoUrl ? (
          <img
            src={
              team.logoUrl.startsWith("http") && !team.logoUrl.includes("drive.google.com")
                ? team.logoUrl
                : getLogoUrl(team.logoUrl)!
            }
            alt={`Logotipo ${team.name}`}
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
              {team.distrito && ` — ${team.distrito}`}
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
              <Badge variant="outline">Fundado {team.foundedYear}</Badge>
            )}
            {team.playerCount && (
              <Badge variant="outline">{team.playerCount} jogadores</Badge>
            )}
            {team.dinnerThirdParty && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Jantar 3&ordf; Parte
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Team Photo */}
      {team.teamPhotoUrl && (
        <div className="mb-8">
          <img
            src={team.teamPhotoUrl}
            alt={`Foto de equipa ${team.name}`}
            className="w-full max-h-[400px] object-cover rounded-lg"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipamentos */}
        {(hasKitPrimary || hasKitSecondary) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasKitPrimary && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Principal
                  </p>
                  {(team.kitPrimaryShirt || team.kitPrimaryShorts || team.kitPrimarySocks) ? (
                    <div className="text-sm space-y-0.5">
                      {team.kitPrimaryShirt && <p>Camisola: {team.kitPrimaryShirt}</p>}
                      {team.kitPrimaryShorts && <p>Calções: {team.kitPrimaryShorts}</p>}
                      {team.kitPrimarySocks && <p>Meias: {team.kitPrimarySocks}</p>}
                    </div>
                  ) : (
                    <p className="text-sm">{team.kitPrimary}</p>
                  )}
                </div>
              )}
              {hasKitSecondary && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Alternativo
                  </p>
                  {(team.kitSecondaryShirt || team.kitSecondaryShorts || team.kitSecondarySocks) ? (
                    <div className="text-sm space-y-0.5">
                      {team.kitSecondaryShirt && <p>Camisola: {team.kitSecondaryShirt}</p>}
                      {team.kitSecondaryShorts && <p>Calções: {team.kitSecondaryShorts}</p>}
                      {team.kitSecondarySocks && <p>Meias: {team.kitSecondarySocks}</p>}
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
            <CardTitle className="text-lg">Campo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {team.fieldName && <p className="font-medium">{team.fieldName}</p>}
            {team.fieldType && (
              <Badge variant="secondary" className="text-xs">
                {FIELD_TYPE_LABELS[team.fieldType] || team.fieldType}
              </Badge>
            )}
            {team.fieldAddress && (
              <p className="text-sm text-muted-foreground">
                {team.fieldAddress}
              </p>
            )}
            {team.trainingSchedule && (
              <p className="text-sm">
                <span className="text-muted-foreground">Horário:</span>{" "}
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
                Ver no Google Maps &rarr;
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
              <CardTitle className="text-lg">Redes Sociais</CardTitle>
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
            <CardTitle className="text-lg">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{team.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
