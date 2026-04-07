import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { getSessionCsrf, validateCsrf } from "@/lib/security/csrf";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function ConsentPage() {
  const email = await requireCoordinator();
  const locale = await getLocale();

  const pendingTeams = await db
    .select()
    .from(teams)
    .where(
      and(eq(teams.coordinatorEmail, email), eq(teams.rgpdConsent, false))
    );

  if (pendingTeams.length === 0) {
    redirect("/dashboard");
  }

  const csrf = await getSessionCsrf();

  async function acceptConsent(formData: FormData) {
    "use server";

    const csrfToken = formData.get("_csrf") as string;
    const csrfValid = await validateCsrf(csrfToken);
    if (!csrfValid) return;

    await db
      .update(teams)
      .set({ rgpdConsent: true, rgpdConsentAt: new Date() })
      .where(
        and(eq(teams.coordinatorEmail, email), eq(teams.rgpdConsent, false))
      );

    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>{t("consent", "title", locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t("consent", "migrationNotice", locale)}
          </p>
          <div className="rounded-lg border border-border p-4 mb-6 text-sm text-muted-foreground leading-relaxed">
            {t("consent", "consentText", locale)}{" "}
            <Link
              href="/privacidade"
              className="text-primary hover:underline"
              target="_blank"
            >
              {t("common", "privacyPolicy", locale)}
            </Link>
            .
          </div>
          <p className="text-sm mb-4">
            {t("consent", "affectedTeams", locale)}{" "}
            <strong>{pendingTeams.map((tm) => tm.name).join(", ")}</strong>
          </p>
          <form action={acceptConsent}>
            <input type="hidden" name="_csrf" value={csrf || ""} />
            <Button type="submit" className="w-full">
              {t("consent", "acceptButton", locale)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
