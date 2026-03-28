import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getCoordinatorEmail } from "@/lib/auth/session";
import { TeamContact } from "@/components/teams/team-contact";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLogoUrl } from "@/lib/logo";
import type { Metadata } from "next";

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

  const coordinatorEmail = await getCoordinatorEmail();
  const isAuthenticated = !!coordinatorEmail;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        {team.logoUrl ? (
          <img
            src={getLogoUrl(team.logoUrl)!}
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
          {team.location && (
            <p className="text-muted-foreground mt-1">{team.location}</p>
          )}
          <div className="flex gap-2 mt-3 flex-wrap">
            {team.kitPrimary && (
              <Badge variant="secondary">
                Eq. Principal: {team.kitPrimary}
              </Badge>
            )}
            {team.kitSecondary && (
              <Badge variant="outline">
                Eq. Alternativo: {team.kitSecondary}
              </Badge>
            )}
            {team.dinnerThirdParty && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Jantar 3&ordf; Parte
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Campo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {team.fieldName && <p className="font-medium">{team.fieldName}</p>}
            {team.fieldAddress && (
              <p className="text-sm text-muted-foreground">
                {team.fieldAddress}
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
      </div>

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
