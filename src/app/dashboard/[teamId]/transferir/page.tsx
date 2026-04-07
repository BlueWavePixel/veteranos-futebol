import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { getSessionCsrf, validateCsrf } from "@/lib/security/csrf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ teamId: string }> };

export default async function TransferPage({ params }: Props) {
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

  async function transferTeam(formData: FormData) {
    "use server";

    const csrfToken = formData.get("_csrf") as string;
    const csrfValid = await validateCsrf(csrfToken);
    if (!csrfValid) return;

    const newEmail = (formData.get("newEmail") as string).toLowerCase().trim();
    const newName = (formData.get("newName") as string).trim();
    if (!newEmail || !newName) return;

    await db
      .update(teams)
      .set({ coordinatorEmail: newEmail, coordinatorName: newName, updatedAt: new Date() })
      .where(eq(teams.id, teamId));

    await logAudit({
      actorType: "coordinator",
      actorEmail: email,
      action: "coordinator_transferred",
      teamId,
      details: { from: email, to: newEmail, newName },
    });

    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>{t("transfer", "title", locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            <strong>{team.name}</strong> — {t("transfer", "desc", locale)}
          </p>
          <form action={transferTeam} className="space-y-4">
            <input type="hidden" name="_csrf" value={csrf || ""} />
            <div>
              <Label htmlFor="newName">{t("transfer", "newCoordinatorName", locale)}</Label>
              <Input id="newName" name="newName" required />
            </div>
            <div>
              <Label htmlFor="newEmail">{t("transfer", "newCoordinatorEmail", locale)}</Label>
              <Input id="newEmail" name="newEmail" type="email" required />
            </div>
            <Button type="submit" className="w-full">{t("transfer", "confirm", locale)}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
