import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { TeamForm } from "@/components/teams/team-form";
import { extractTeamFields } from "@/lib/form-helpers";
import { logAudit } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ teamId: string }> };

export default async function EditTeamPage({ params }: Props) {
  const { teamId } = await params;
  const email = await requireCoordinator();

  const [team] = await db
    .select()
    .from(teams)
    .where(
      and(
        eq(teams.id, teamId),
        eq(teams.coordinatorEmail, email),
        eq(teams.isActive, true)
      )
    );

  if (!team) notFound();

  async function updateTeam(
    formData: FormData
  ): Promise<{ error?: string; success?: boolean }> {
    "use server";

    const fields = extractTeamFields(formData);

    await db
      .update(teams)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(teams.id, teamId));

    await logAudit({
      actorType: "coordinator",
      actorEmail: email,
      action: "team_updated",
      teamId,
    });

    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Editar Equipa</h1>
        <div className="flex gap-2">
          <Link href={`/dashboard/${teamId}/transferir`}>
            <Button variant="outline" size="sm">
              Transferir
            </Button>
          </Link>
          <Link href={`/dashboard/${teamId}/eliminar`}>
            <Button variant="destructive" size="sm">
              Eliminar
            </Button>
          </Link>
        </div>
      </div>
      <TeamForm
        action={updateTeam}
        defaultValues={team}
        submitLabel="Guardar Alterações"
        showRgpd={false}
      />
    </div>
  );
}
