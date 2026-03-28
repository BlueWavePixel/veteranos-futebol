import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const email = await requireCoordinator();

  const myTeams = await db
    .select()
    .from(teams)
    .where(and(eq(teams.coordinatorEmail, email), eq(teams.isActive, true)));

  // If only one team, redirect directly to edit
  if (myTeams.length === 1) {
    redirect(`/dashboard/${myTeams[0].id}`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">As Minhas Equipas</h1>
      <div className="space-y-4">
        {myTeams.map((team) => (
          <Link key={team.id} href={`/dashboard/${team.id}`}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{team.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {team.location}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
        {myTeams.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma equipa associada a este email.
          </p>
        )}
      </div>
    </div>
  );
}
