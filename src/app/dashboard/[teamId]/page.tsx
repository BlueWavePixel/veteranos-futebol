import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { TeamForm } from "@/components/teams/team-form";
import { extractCoordinates } from "@/lib/geo";
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

    const mapsUrl = formData.get("mapsUrl") as string;
    const coords = extractCoordinates(mapsUrl);

    await db
      .update(teams)
      .set({
        name: ((formData.get("name") as string) || "").trim(),
        logoUrl: (formData.get("logoUrl") as string) || null,
        coordinatorName: ((formData.get("coordinatorName") as string) || "").trim(),
        coordinatorAltName: (formData.get("coordinatorAltName") as string) || null,
        coordinatorPhone: (formData.get("coordinatorPhone") as string) || null,
        coordinatorAltPhone: (formData.get("coordinatorAltPhone") as string) || null,
        dinnerThirdParty: formData.get("dinnerThirdParty") === "on",
        kitPrimary: (formData.get("kitPrimary") as string) || null,
        kitSecondary: (formData.get("kitSecondary") as string) || null,
        fieldName: (formData.get("fieldName") as string) || null,
        fieldAddress: (formData.get("fieldAddress") as string) || null,
        location: ((formData.get("location") as string) || "").trim(),
        mapsUrl: mapsUrl || null,
        latitude: coords?.latitude?.toString() || null,
        longitude: coords?.longitude?.toString() || null,
        notes: (formData.get("notes") as string) || null,
        updatedAt: new Date(),
      })
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
