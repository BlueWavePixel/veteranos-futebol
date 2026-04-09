import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { TeamForm } from "@/components/teams/team-form";
import { extractTeamFields } from "@/lib/form-helpers";
import { logAudit } from "@/lib/audit";
import { getSessionCsrf, validateCsrf } from "@/lib/security/csrf";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ teamId: string }> };

export default async function EditTeamPage({ params }: Props) {
  const { teamId } = await params;
  const email = await requireCoordinator();
  const locale = await getLocale();

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

  const csrf = await getSessionCsrf();

  async function updateTeam(
    formData: FormData
  ): Promise<{ error?: string; success?: boolean }> {
    "use server";

    const csrfToken = formData.get("_csrf") as string;
    const csrfValid = await validateCsrf(csrfToken);
    if (!csrfValid) {
      return { error: "Sessão inválida. Recarregue a página e tente novamente." };
    }

    const fields = await extractTeamFields(formData, {
      latitude: team.latitude,
      longitude: team.longitude,
    });

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
        <h1 className="text-3xl font-bold">{t("dashboard", "editTeam", locale)}</h1>
        <div className="flex gap-2">
          <Link href={`/dashboard/${teamId}/jogos`}>
            <Button variant="outline" size="sm">
              {t("matches", "title", locale)}
            </Button>
          </Link>
          <Link href={`/dashboard/${teamId}/transferir`}>
            <Button variant="outline" size="sm">
              {t("dashboard", "helpTransfer", locale)}
            </Button>
          </Link>
          <Link href={`/dashboard/${teamId}/eliminar`}>
            <Button variant="destructive" size="sm">
              {t("deactivate", "title", locale)}
            </Button>
          </Link>
        </div>
      </div>
      <TeamForm
        action={updateTeam}
        defaultValues={team}
        submitLabel={t("common", "save", locale)}
        showRgpd={false}
        csrfToken={csrf || undefined}
      />
    </div>
  );
}
