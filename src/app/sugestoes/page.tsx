import { db } from "@/lib/db";
import { suggestions, teams } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getCoordinatorEmail } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { notifyAdminsSuggestion } from "@/lib/email/send-notification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function SugestoesPage() {
  const email = await getCoordinatorEmail();
  const locale = await getLocale();

  const statusLabels: Record<string, { label: string; className: string }> = {
    pending: { label: t("suggestions", "statusPending", locale), className: "bg-yellow-500/20 text-yellow-400" },
    read: { label: t("suggestions", "statusRead", locale), className: "bg-blue-500/20 text-blue-400" },
    resolved: { label: t("suggestions", "statusResolved", locale), className: "bg-primary/20 text-primary" },
  };

  // Buscar sugestões do coordenador (se autenticado)
  const mySuggestions = email
    ? await db
        .select()
        .from(suggestions)
        .where(eq(suggestions.authorEmail, email))
        .orderBy(desc(suggestions.createdAt))
    : [];

  async function submitSuggestion(formData: FormData) {
    "use server";

    const authorEmail = await getCoordinatorEmail();
    if (!authorEmail) redirect("/login");

    const authorName = (formData.get("authorName") as string).trim();
    const subject = (formData.get("subject") as string).trim();
    const message = (formData.get("message") as string).trim();

    if (!authorName || !subject || !message) {
      return;
    }

    // Encontrar equipa do coordenador
    const [team] = await db
      .select({ id: teams.id })
      .from(teams)
      .where(
        and(eq(teams.coordinatorEmail, authorEmail), eq(teams.isActive, true))
      )
      .limit(1);

    await db.insert(suggestions).values({
      teamId: team?.id || null,
      authorName,
      authorEmail,
      subject,
      message,
    });

    // Notificar moderadores por email
    const [teamData] = team
      ? await db
          .select({ name: teams.name })
          .from(teams)
          .where(eq(teams.id, team.id))
      : [null];

    await notifyAdminsSuggestion({
      authorName,
      authorEmail,
      subject,
      message,
      teamName: teamData?.name,
    });

    redirect("/sugestoes?enviado=1");
  }

  const dateLocale = locale === "en" ? "en-GB" : locale === "es" ? "es-ES" : locale === "br" ? "pt-BR" : "pt-PT";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">{t("suggestions", "title", locale)}</h1>
      <p className="text-muted-foreground mb-8">
        {t("suggestions", "subtitle", locale)}
      </p>

      {!email ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              {t("suggestions", "mustBeAuthenticated", locale)}
            </p>
            <Link href="/login">
              <Button>{t("common", "signIn", locale)}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">{t("suggestions", "newSuggestion", locale)}</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={submitSuggestion} className="space-y-4">
                <div>
                  <Label htmlFor="authorName">{t("suggestions", "yourName", locale)}</Label>
                  <Input
                    id="authorName"
                    name="authorName"
                    required
                    placeholder={t("suggestions", "namePlaceholder", locale)}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">{t("suggestions", "subject", locale)}</Label>
                  <Input
                    id="subject"
                    name="subject"
                    required
                    placeholder={t("suggestions", "subjectPlaceholder", locale)}
                  />
                </div>
                <div>
                  <Label htmlFor="message">{t("suggestions", "message", locale)}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder={t("suggestions", "messagePlaceholder", locale)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t("suggestions", "sendButton", locale)}
                </Button>
              </form>
            </CardContent>
          </Card>

          {mySuggestions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {t("suggestions", "mySuggestions", locale)} ({mySuggestions.length})
              </h2>
              <div className="space-y-3">
                {mySuggestions.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{s.subject}</span>
                            <Badge
                              variant="secondary"
                              className={
                                statusLabels[s.status]?.className || ""
                              }
                            >
                              {statusLabels[s.status]?.label || s.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {s.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(s.createdAt).toLocaleDateString(dateLocale, {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      {s.adminReply && (
                        <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
                          <p className="text-xs font-medium text-primary mb-1">
                            {t("suggestions", "adminReply", locale)}
                          </p>
                          <p>{s.adminReply}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
