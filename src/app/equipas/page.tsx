import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, ilike, and, or, asc } from "drizzle-orm";
import { TeamCard } from "@/components/teams/team-card";
import { TeamFilters } from "@/components/teams/team-filters";
import { Suspense } from "react";
import { getLocale } from "@/lib/i18n/get-locale";
import { t, tFn } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function EquipasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; distrito?: string }>;
}) {
  const { q: rawQ, distrito } = await searchParams;
  const q = rawQ?.replace(/\s+/g, " ").trim() || undefined;
  const locale = await getLocale();

  const conditions = [eq(teams.isActive, true), eq(teams.isApproved, true)];

  if (q) {
    conditions.push(
      or(
        ilike(teams.name, `%${q}%`),
        ilike(teams.concelho, `%${q}%`),
        ilike(teams.location, `%${q}%`)
      )!
    );
  }

  if (distrito) {
    conditions.push(eq(teams.distrito, distrito));
  }

  const teamList = await db
    .select()
    .from(teams)
    .where(and(...conditions))
    .orderBy(asc(teams.name));

  // Get unique distritos for filter dropdown
  const allDistritos = await db
    .selectDistinct({ distrito: teams.distrito })
    .from(teams)
    .where(and(eq(teams.isActive, true), eq(teams.isApproved, true)))
    .orderBy(asc(teams.distrito));

  const distritos = allDistritos
    .map((d) => d.distrito)
    .filter((d): d is string => d !== null && d !== "");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("teamsDirectory", "title", locale)}</h1>
      <Suspense>
        <TeamFilters distritos={distritos} />
      </Suspense>
      <p className="text-sm text-muted-foreground mb-4">
        {tFn("teamsDirectory", "teamsFound", locale)(teamList.length)}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamList.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}
