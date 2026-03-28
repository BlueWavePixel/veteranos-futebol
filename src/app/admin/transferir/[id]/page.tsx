import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminTransferPage({ params }: Props) {
  const { id } = await params;
  const admin = await requireAdmin();

  const [team] = await db
    .select({ id: teams.id, name: teams.name, coordinatorEmail: teams.coordinatorEmail })
    .from(teams)
    .where(eq(teams.id, id));

  if (!team) notFound();

  async function transferTeam(formData: FormData) {
    "use server";

    const newEmail = (formData.get("newEmail") as string).toLowerCase().trim();
    const newName = (formData.get("newName") as string).trim();

    await db
      .update(teams)
      .set({ coordinatorEmail: newEmail, coordinatorName: newName, updatedAt: new Date() })
      .where(eq(teams.id, id));

    await logAudit({
      actorType: admin.role === "super_admin" ? "super_admin" : "moderator",
      actorEmail: admin.email,
      action: "coordinator_transferred_by_admin",
      teamId: id,
      details: { from: team.coordinatorEmail, to: newEmail },
    });

    redirect("/admin");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Transferir Coordenador</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Transferir <strong>{team.name}</strong> para um novo coordenador.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Coordenador atual: {team.coordinatorEmail}
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
            <Button type="submit" className="w-full">Transferir</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
