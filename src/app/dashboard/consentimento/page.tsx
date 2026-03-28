import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ConsentPage() {
  const email = await requireCoordinator();

  const pendingTeams = await db
    .select()
    .from(teams)
    .where(
      and(eq(teams.coordinatorEmail, email), eq(teams.rgpdConsent, false))
    );

  if (pendingTeams.length === 0) {
    redirect("/dashboard");
  }

  async function acceptConsent() {
    "use server";

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
          <CardTitle>Consentimento de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Os dados da(s) sua(s) equipa(s) foram migrados do formulário
            anterior. Para continuar a utilizá-los na nova plataforma,
            precisamos do seu consentimento.
          </p>
          <div className="rounded-lg border border-border p-4 mb-6 text-sm text-muted-foreground leading-relaxed">
            Ao aceitar, consinto que os meus dados pessoais (nome, email,
            telefone) sejam armazenados e partilhados com outras equipas de
            veteranos registadas na plataforma, com a finalidade exclusiva de
            facilitar o contacto para marcação de jogos. Posso a qualquer
            momento editar ou eliminar os meus dados. Consulte a nossa{" "}
            <Link
              href="/privacidade"
              className="text-primary hover:underline"
              target="_blank"
            >
              Política de Privacidade
            </Link>
            .
          </div>
          <p className="text-sm mb-4">
            Equipa(s) afetada(s):{" "}
            <strong>{pendingTeams.map((t) => t.name).join(", ")}</strong>
          </p>
          <form action={acceptConsent}>
            <Button type="submit" className="w-full">
              Aceitar e Continuar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
