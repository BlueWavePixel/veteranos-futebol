import { db } from "@/lib/db";
import { teams, matches } from "@/lib/db/schema";
import { eq, and, count, gte } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const email = await requireCoordinator();

  const myTeams = await db
    .select()
    .from(teams)
    .where(and(eq(teams.coordinatorEmail, email), eq(teams.isActive, true)));

  const inactiveTeams = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(and(eq(teams.coordinatorEmail, email), eq(teams.isActive, false)));

  // Contar jogos futuros por equipa
  const now = new Date();
  const matchCounts: Record<string, number> = {};
  for (const team of myTeams) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(matches)
      .where(and(eq(matches.teamId, team.id), gte(matches.matchDate, now)));
    matchCounts[team.id] = total;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Painel do Coordenador</h1>
      <p className="text-muted-foreground mb-6">
        Bem-vindo! Aqui pode gerir tudo sobre a sua equipa.
      </p>

      {/* Ajuda / Resumo */}
      <Card className="mb-8 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">O que pode fazer aqui?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>
            <strong className="text-foreground">✏️ Editar Equipa</strong> —
            Atualize o nome, localização, equipamentos, campo, contactos,
            logotipo e foto de equipa.
          </p>
          <p>
            <strong className="text-foreground">📅 Calendário de Jogos</strong>{" "}
            — Adicione, edite ou apague jogos. Registe resultados e partilhe
            o calendário com a equipa exportando o ficheiro .ics para o
            Google Calendar ou telemóvel.
          </p>
          <p>
            <strong className="text-foreground">🔄 Transferir Coordenação</strong>{" "}
            — Passe a gestão da equipa para outro coordenador, indicando o
            novo email.
          </p>
          <p>
            <strong className="text-foreground">💡 Sugestões</strong> — Tem
            uma ideia ou dúvida?{" "}
            <Link href="/sugestoes" className="text-primary hover:underline">
              Envie uma sugestão
            </Link>{" "}
            à equipa de moderação.
          </p>
          <p>
            <strong className="text-foreground">🗑️ Eliminar Equipa</strong> —
            Remove a equipa da plataforma (pode ser revertido pela moderação).
          </p>
        </CardContent>
      </Card>

      {/* Aviso equipas desativadas */}
      {inactiveTeams.length > 0 && (
        <Card className="mb-6 border-orange-500/50 bg-orange-500/10">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-orange-400 mb-1">
              ⚠ Equipa{inactiveTeams.length > 1 ? "s" : ""} desativada{inactiveTeams.length > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              A sua equipa <strong>{inactiveTeams.map((t) => t.name).join(", ")}</strong> foi
              desativada, provavelmente por ter mais que um contacto registado.
              Contacte o administrador para resolver a situação.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Equipas */}
      {myTeams.length === 0 && inactiveTeams.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Nenhuma equipa associada a este email.
            </p>
            <Link href="/registar">
              <Button>Registar Equipa</Button>
            </Link>
          </CardContent>
        </Card>
      ) : myTeams.length === 0 ? null : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {myTeams.length === 1 ? "A minha equipa" : "As minhas equipas"}
          </h2>
          {myTeams.map((team) => (
            <Card key={team.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="w-12 h-12 rounded-lg object-contain bg-muted"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl">
                        ⚽
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {team.location}
                      </p>
                    </div>
                  </div>
                  {matchCounts[team.id] > 0 && (
                    <span className="text-xs text-primary font-medium">
                      {matchCounts[team.id]} jogo
                      {matchCounts[team.id] !== 1 ? "s" : ""} agendado
                      {matchCounts[team.id] !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/${team.id}`}>
                    <Button size="sm">Editar Equipa</Button>
                  </Link>
                  <Link href={`/dashboard/${team.id}/jogos`}>
                    <Button variant="outline" size="sm">
                      Calendário de Jogos
                    </Button>
                  </Link>
                  <Link href={`/equipas/${team.slug}`}>
                    <Button variant="ghost" size="sm">
                      Ver Página Pública
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
