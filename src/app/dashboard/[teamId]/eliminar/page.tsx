import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ teamId: string }> };

export default async function DeletePage({ params }: Props) {
  const { teamId } = await params;
  const email = await requireCoordinator();

  const [team] = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(
      and(eq(teams.id, teamId), eq(teams.coordinatorEmail, email), eq(teams.isActive, true))
    );

  if (!team) notFound();

  async function deleteTeam() {
    "use server";

    await db.delete(teams).where(eq(teams.id, teamId));

    await logAudit({
      actorType: "coordinator",
      actorEmail: email,
      action: "team_deleted",
      teamId,
      details: { teamName: team.name },
    });

    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Eliminar Equipa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Tem a certeza que deseja eliminar <strong>{team.name}</strong>?
            Todos os dados serão permanentemente apagados. Esta ação não pode
            ser revertida.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            (Direito ao apagamento — Artigo 17.º do RGPD)
          </p>
          <form action={deleteTeam}>
            <Button type="submit" variant="destructive" className="w-full">
              Eliminar Permanentemente
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
