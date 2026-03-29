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

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-yellow-500/20 text-yellow-400" },
  read: { label: "Lida", className: "bg-blue-500/20 text-blue-400" },
  resolved: { label: "Resolvida", className: "bg-primary/20 text-primary" },
};

export default async function SugestoesPage() {
  const email = await getCoordinatorEmail();

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

  const enviado =
    typeof globalThis !== "undefined" ? false : false; // handled client-side

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Ideias e Sugestões</h1>
      <p className="text-muted-foreground mb-8">
        Tem uma ideia para melhorar a plataforma ou precisa de ajuda? Envie a
        sua sugestão e a equipa de moderação responderá assim que possível.
      </p>

      {!email ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Precisa de estar autenticado para enviar sugestões.
            </p>
            <Link href="/login">
              <Button>Iniciar Sessão</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Nova Sugestão</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={submitSuggestion} className="space-y-4">
                <div>
                  <Label htmlFor="authorName">O seu nome *</Label>
                  <Input
                    id="authorName"
                    name="authorName"
                    required
                    placeholder="Nome do coordenador"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Assunto *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    required
                    placeholder="Ex: Ideia para nova funcionalidade, Dúvida sobre..."
                  />
                </div>
                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Descreva a sua ideia, sugestão ou dúvida..."
                  />
                </div>
                <Button type="submit" className="w-full">
                  Enviar Sugestão
                </Button>
              </form>
            </CardContent>
          </Card>

          {mySuggestions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                As minhas sugestões ({mySuggestions.length})
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
                                STATUS_LABELS[s.status]?.className || ""
                              }
                            >
                              {STATUS_LABELS[s.status]?.label || s.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {s.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(s.createdAt).toLocaleDateString("pt-PT", {
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
                            Resposta da moderação:
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
