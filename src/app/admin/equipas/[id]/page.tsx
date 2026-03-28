import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { TeamForm } from "@/components/teams/team-form";
import { extractTeamFields } from "@/lib/form-helpers";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditTeamPage({ params }: Props) {
  const { id } = await params;
  const admin = await requireAdmin();

  const [team] = await db.select().from(teams).where(eq(teams.id, id));
  if (!team) notFound();

  async function updateTeam(
    formData: FormData
  ): Promise<{ error?: string; success?: boolean }> {
    "use server";

    const fields = extractTeamFields(formData);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Editar: {team.name}</h1>
      <TeamForm
        action={updateTeam}
        defaultValues={team}
        submitLabel="Guardar Alterações"
        showRgpd={false}
      />
    </div>
  );
}
