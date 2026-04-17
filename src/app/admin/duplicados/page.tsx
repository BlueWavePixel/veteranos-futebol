import { db } from "@/lib/db";
import { duplicatePairs, teams } from "@/lib/db/schema";
import { eq, desc, inArray, count, or } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { mergeTeams } from "@/lib/duplicates/merge";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { DuplicateCompare } from "@/components/admin/duplicate-compare";
import type { Team } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function DuplicadosPage() {
  await requireAdmin();

  // Server actions
  async function resolveNotDuplicate(formData: FormData) {
    "use server";
    const adminUser = await requireAdmin();
    const pairId = formData.get("pairId") as string;

    await db
      .update(duplicatePairs)
      .set({
        status: "not_duplicate",
        resolvedBy: adminUser.id,
        resolvedAt: new Date(),
      })
      .where(eq(duplicatePairs.id, pairId));

    redirect("/admin/duplicados");
  }

  async function resolveConfirmedDuplicate(formData: FormData) {
    "use server";
    const adminUser = await requireAdmin();
    const pairId = formData.get("pairId") as string;

    await db
      .update(duplicatePairs)
      .set({
        status: "confirmed_duplicate",
        resolvedBy: adminUser.id,
        resolvedAt: new Date(),
      })
      .where(eq(duplicatePairs.id, pairId));

    redirect("/admin/duplicados");
  }

  async function mergeDuplicate(formData: FormData) {
    "use server";
    const adminUser = await requireAdmin();
    const pairId = formData.get("pairId") as string;
    const primaryId = formData.get("primaryId") as string;
    const secondaryId = formData.get("secondaryId") as string;

    if (!primaryId || !secondaryId || !pairId) {
      throw new Error("Dados em falta para o merge.");
    }

    await mergeTeams(primaryId, secondaryId, pairId, adminUser.email, adminUser.id);
    redirect("/admin/duplicados");
  }

  // Query pending + confirmed_duplicate pairs ordered by similarity_score DESC
  const actionablePairs = await db
    .select()
    .from(duplicatePairs)
    .where(
      or(
        eq(duplicatePairs.status, "pending"),
        eq(duplicatePairs.status, "confirmed_duplicate"),
      ),
    )
    .orderBy(desc(duplicatePairs.similarityScore));

  const pendingPairs = actionablePairs.filter((p) => p.status === "pending");
  const confirmedPairs = actionablePairs.filter((p) => p.status === "confirmed_duplicate");

  // Collect all unique team IDs
  const teamIds = new Set<string>();
  for (const pair of actionablePairs) {
    teamIds.add(pair.teamAId);
    teamIds.add(pair.teamBId);
  }

  // Fetch team data for all teams in pairs
  let teamsMap: Record<string, Team> = {};
  if (teamIds.size > 0) {
    const teamsList = await db
      .select()
      .from(teams)
      .where(inArray(teams.id, Array.from(teamIds)));

    teamsMap = Object.fromEntries(teamsList.map((t) => [t.id, t]));
  }

  // Count resolved pairs for stats
  const [{ count: resolvedCount }] = await db
    .select({ count: count() })
    .from(duplicatePairs)
    .where(eq(duplicatePairs.status, "not_duplicate"));

  const [{ count: mergedCount }] = await db
    .select({ count: count() })
    .from(duplicatePairs)
    .where(eq(duplicatePairs.status, "merged"));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestão de Duplicados</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono text-orange-500">
              {pendingPairs.length}
            </p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono text-yellow-500">
              {confirmedPairs.length}
            </p>
            <p className="text-sm text-muted-foreground">Confirmados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono text-primary">
              {resolvedCount}
            </p>
            <p className="text-sm text-muted-foreground">Resolvidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono">{mergedCount}</p>
            <p className="text-sm text-muted-foreground">Merged</p>
          </CardContent>
        </Card>
      </div>

      {pendingPairs.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Pendentes</h2>
          <div className="space-y-6 mb-10">
            {pendingPairs.map((pair) => {
              const teamA = teamsMap[pair.teamAId];
              const teamB = teamsMap[pair.teamBId];
              if (!teamA || !teamB) return null;
              return (
                <DuplicateCompare
                  key={pair.id}
                  pair={pair}
                  teamA={teamA}
                  teamB={teamB}
                  resolveNotDuplicateAction={resolveNotDuplicate}
                  resolveConfirmedAction={resolveConfirmedDuplicate}
                  mergeAction={mergeDuplicate}
                />
              );
            })}
          </div>
        </>
      )}

      {confirmedPairs.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Duplicados Confirmados</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Pares já confirmados como duplicados. Faz merge ou descarta.
          </p>
          <div className="space-y-6">
            {confirmedPairs.map((pair) => {
              const teamA = teamsMap[pair.teamAId];
              const teamB = teamsMap[pair.teamBId];
              if (!teamA || !teamB) return null;
              return (
                <DuplicateCompare
                  key={pair.id}
                  pair={pair}
                  teamA={teamA}
                  teamB={teamB}
                  resolveNotDuplicateAction={resolveNotDuplicate}
                  resolveConfirmedAction={resolveConfirmedDuplicate}
                  mergeAction={mergeDuplicate}
                />
              );
            })}
          </div>
        </>
      )}

      {pendingPairs.length === 0 && confirmedPairs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum par de duplicados por tratar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
