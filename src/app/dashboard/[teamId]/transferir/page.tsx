import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ teamId: string }> };

export default async function TransferPage({ params }: Props) {
  const { teamId } = await params;
  const email = await requireCoordinator();

  const [team] = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(
      and(eq(teams.id, teamId), eq(teams.coordinatorEmail, email), eq(teams.isActive, true))
    );

  if (!team) notFound();

  async function transferTeam(formData: FormData) {
    "use server";

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
          <CardTitle>Transferir Equipa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Transferir a gestão de <strong>{team.name}</strong> para outro
            responsável. Após a transferência, perderá o acesso de edição.
          </p>
          <form action={transferTeam} className="space-y-4">
            <div>
              <Label htmlFor="newName">Nome do Novo Responsável *</Label>
              <Input id="newName" name="newName" required />
            </div>
            <div>
              <Label htmlFor="newEmail">Email do Novo Responsável *</Label>
              <Input id="newEmail" name="newEmail" type="email" required />
            </div>
            <Button type="submit" className="w-full">Confirmar Transferência</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
