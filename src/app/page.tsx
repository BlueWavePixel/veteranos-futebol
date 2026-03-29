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

      <section className="mb-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          Como funciona?{" "}
          <span className="text-base font-normal text-muted-foreground">
            (para quem ainda não se registou)
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-3xl">📋</div>
            <h3 className="font-semibold">1. Registe a sua equipa</h3>
            <p className="text-sm text-muted-foreground">
              Preencha o formulário com os dados da equipa — nome,
              localização, equipamentos, campo e contactos do coordenador.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🔍</div>
            <h3 className="font-semibold">2. Encontre adversários</h3>
            <p className="text-sm text-muted-foreground">
              Pesquise equipas por nome, concelho ou distrito. Consulte o
              mapa para encontrar clubes perto de si e combine jogos.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">📅</div>
            <h3 className="font-semibold">3. Organize os seus jogos</h3>
            <p className="text-sm text-muted-foreground">
              Cada equipa tem o seu calendário de jogos. Adicione partidas,
              registe resultados e partilhe o calendário com a equipa.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border bg-muted/50 p-5 text-sm text-muted-foreground space-y-2">
          <p>
            <strong className="text-foreground">Veteranos Futebol</strong> é
            uma plataforma gratuita de contactos para equipas de veteranos em
            Portugal. O objetivo é simples: facilitar a comunicação entre
            clubes e ajudar a marcar jogos amigáveis ou torneios.
          </p>
          <p>
            Após o registo, receberá um link de acesso por email para gerir a
            ficha da sua equipa — atualizar dados, adicionar jogos ao
            calendário e exportar o calendário para o Google Calendar ou
            telemóvel.
          </p>
        </div>
      </section>

      <section className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Link href="/equipas">
          <Button size="lg" variant="outline">
            Ver Todas as Equipas
          </Button>
        </Link>
        <Link href="/registar">
          <Button size="lg">Registar a Minha Equipa</Button>
        </Link>
      </section>

      <section className="mb-8">
        <MapWrapper teams={allTeams} />
        <p className="text-sm text-muted-foreground text-center mt-2">
          {teamsOnMap} de {total} equipas visíveis no mapa
        </p>
      </section>
    </div>
  );
}
