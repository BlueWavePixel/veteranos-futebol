import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, ilike, and, or, asc } from "drizzle-orm";
import { TeamCard } from "@/components/teams/team-card";
import { TeamFilters } from "@/components/teams/team-filters";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function EquipasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string }>;
}) {
  const { q, location } = await searchParams;

  const conditions = [eq(teams.isActive, true)];

  if (q) {
    conditions.push(
      or(ilike(teams.name, `%${q}%`), ilike(teams.location, `%${q}%`))!
    );
  }

  if (location) {
    conditions.push(ilike(teams.location, `%${location}%`));
  }

  const teamList = await db
    .select()
    .from(teams)
    .where(and(...conditions))
    .orderBy(asc(teams.name));

  // Get unique locations for filter dropdown
  const allLocations = await db
    .selectDistinct({ location: teams.location })
    .from(teams)
    .where(eq(teams.isActive, true))
    .orderBy(asc(teams.location));

  const locations = allLocations
    .map((l) => l.location)
    .filter((l): l is string => l !== null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Equipas de Veteranos</h1>
      <Suspense>
        <TeamFilters locations={locations} />
      </Suspense>
      <p className="text-sm text-muted-foreground mb-4">
        {teamList.length} equipa{teamList.length !== 1 ? "s" : ""} encontrada
        {teamList.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamList.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}
