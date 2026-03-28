import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { MapWrapper } from "@/components/map/map-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allTeams = await db
    .select({
      id: teams.id,
      slug: teams.slug,
      name: teams.name,
      location: teams.location,
      latitude: teams.latitude,
      longitude: teams.longitude,
    })
    .from(teams)
    .where(eq(teams.isActive, true))
    .orderBy(teams.name);

  const [{ total }] = await db
    .select({ total: count() })
    .from(teams)
    .where(eq(teams.isActive, true));

  const teamsOnMap = allTeams.filter((t) => t.latitude && t.longitude).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Veteranos Futebol</h1>
        <p className="text-muted-foreground text-lg mb-4">
          Contactos de equipas de veteranos de futebol
        </p>
        <p className="text-2xl font-mono font-bold text-primary">
          {total} equipas registadas
        </p>
      </section>

      <section className="mb-8">
        <MapWrapper teams={allTeams} />
        <p className="text-sm text-muted-foreground text-center mt-2">
          {teamsOnMap} de {total} equipas visíveis no mapa
        </p>
      </section>

      <section className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/equipas">
          <Button size="lg" variant="outline">
            Ver Todas as Equipas
          </Button>
        </Link>
        <Link href="/registar">
          <Button size="lg">Registar a Minha Equipa</Button>
        </Link>
      </section>
    </div>
  );
}
