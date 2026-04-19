import { db } from "@/lib/db";
import { teams, matches } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { TeamForm } from "@/components/teams/team-form";
import { AdminMatchList } from "@/components/admin/admin-match-list";
import { extractTeamFields } from "@/lib/form-helpers";
import { logAudit } from "@/lib/audit";
import { getSessionCsrf, requireCsrf } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditTeamPage({ params }: Props) {
  const { id } = await params;
  const admin = await requireAdmin();
  const csrf = await getSessionCsrf();

  const [team] = await db.select().from(teams).where(eq(teams.id, id));
  if (!team) notFound();

  const teamMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.teamId, id))
    .orderBy(asc(matches.matchDate));

  const now = new Date();
  const upcoming = teamMatches.filter((m) => new Date(m.matchDate) >= now);
  const past = teamMatches
    .filter((m) => new Date(m.matchDate) < now)
    .reverse();

  async function updateTeam(
    formData: FormData
  ): Promise<{ error?: string; success?: boolean }> {
    "use server";
    await requireCsrf(formData);

    const fields = await extractTeamFields(formData, {
      latitude: team.latitude,
      longitude: team.longitude,
    });
    const coordinatorEmail = (
      (formData.get("coordinatorEmail") as string) || ""
    )
      .toLowerCase()
      .trim();

    await db
      .update(teams)
      .set({ ...fields, coordinatorEmail, updatedAt: new Date() })
      .where(eq(teams.id, id));

    await logAudit({
      actorType: admin.role === "super_admin" ? "super_admin" : "moderator",
      actorEmail: admin.email,
      action: "team_updated_by_admin",
      teamId: id,
    });

    redirect("/admin");
  }

  async function deleteMatch(formData: FormData) {
    "use server";
    await requireCsrf(formData);

    const matchId = formData.get("matchId") as string;

    await db
      .delete(matches)
      .where(and(eq(matches.id, matchId), eq(matches.teamId, id)));

    await logAudit({
      actorType: admin.role === "super_admin" ? "super_admin" : "moderator",
      actorEmail: admin.email,
      action: "match_deleted_by_admin",
      teamId: id,
      details: { matchId },
    });

    redirect(`/admin/equipas/${id}`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Editar: {team.name}</h1>
      <TeamForm
        action={updateTeam}
        defaultValues={team}
        submitLabel="Guardar Alterações"
        showRgpd={false}
        csrfToken={csrf || undefined}
      />

      <hr className="my-8" />

      <h2 className="text-2xl font-bold mb-4">
        Calendário de Jogos ({teamMatches.length})
      </h2>

      {upcoming.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Próximos jogos ({upcoming.length})
          </h3>
          <AdminMatchList matches={upcoming} deleteAction={deleteMatch} csrfToken={csrf} />
        </div>
      )}

      {past.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Jogos anteriores ({past.length})
          </h3>
          <AdminMatchList matches={past} deleteAction={deleteMatch} csrfToken={csrf} />
        </div>
      )}

      {teamMatches.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Esta equipa não tem jogos no calendário.
        </p>
      )}
    </div>
  );
}
