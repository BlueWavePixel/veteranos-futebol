import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, ilike, and, or, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const location = searchParams.get("location");

  const conditions = [eq(teams.isActive, true)];

  if (query) {
    conditions.push(
      or(
        ilike(teams.name, `%${query}%`),
        ilike(teams.location, `%${query}%`)
      )!
    );
  }

  if (location) {
    conditions.push(ilike(teams.location, `%${location}%`));
  }

  const result = await db
    .select({
      id: teams.id,
      slug: teams.slug,
      name: teams.name,
      logoUrl: teams.logoUrl,
      location: teams.location,
      kitPrimary: teams.kitPrimary,
      kitSecondary: teams.kitSecondary,
      latitude: teams.latitude,
      longitude: teams.longitude,
      fieldName: teams.fieldName,
      dinnerThirdParty: teams.dinnerThirdParty,
    })
    .from(teams)
    .where(and(...conditions))
    .orderBy(asc(teams.name));

  return NextResponse.json(result);
}
