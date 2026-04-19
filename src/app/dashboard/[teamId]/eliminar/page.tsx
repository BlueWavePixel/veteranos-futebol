import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { getSessionCsrf, validateCsrf } from "@/lib/security/csrf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ teamId: string }> };

export default async function DeletePage({ params }: Props) {
  const { teamId } = await params;
  const email = await requireCoordinator();
  const locale = await getLocale();

  const [team] = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(
      and(eq(teams.id, teamId), eq(teams.coordinatorEmail, email), eq(teams.isActive, true))
    );

  if (!team) notFound();

  const csrf = await getSessionCsrf();

  async function deleteTeam(formData: FormData) {
    "use server";

    const csrfToken = formData.get("_csrf") as string;
    const csrfValid = await validateCsrf(csrfToken);
    if (!csrfValid) return;

    // Defense-in-depth: re-check ownership inside action
    await db
      .delete(teams)
      .where(and(eq(teams.id, teamId), eq(teams.coordinatorEmail, email)));

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
          <CardTitle className="text-destructive">{t("deactivate", "title", locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t("deactivate", "confirm", locale)} <strong>{team.name}</strong>?{" "}
            {t("deactivate", "warning", locale)}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {t("deactivate", "rgpdNote", locale)}
          </p>
          <form action={deleteTeam}>
            <input type="hidden" name="_csrf" value={csrf || ""} />
            <Button type="submit" variant="destructive" className="w-full">
              {t("deactivate", "deleteButton", locale)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
