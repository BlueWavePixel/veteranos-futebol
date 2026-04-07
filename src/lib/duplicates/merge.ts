import { db } from "@/lib/db";
import {
  teams,
  matches,
  suggestions,
  duplicatePairs,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logAudit } from "@/lib/audit";

/**
 * Merge two teams: primary absorbs secondary's data.
 * - Fills empty fields of primary with secondary's data
 * - Transfers matches from secondary to primary
 * - Transfers suggestions from secondary to primary
 * - Deactivates secondary
 * - Updates duplicate pair status to "merged"
 * - Logs in auditLog
 */
export async function mergeTeams(
  primaryId: string,
  secondaryId: string,
  pairId: string,
  adminEmail: string
) {
  // 1. Load both teams
  const [primary] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, primaryId));
  const [secondary] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, secondaryId));

  if (!primary || !secondary) {
    throw new Error("Uma ou ambas as equipas não foram encontradas.");
  }

  // 2. Fill empty fields of primary with secondary's data
  const fillableFields = [
    "logoUrl",
    "coordinatorAltName",
    "coordinatorPhone",
    "coordinatorAltPhone",
    "kitPrimary",
    "kitPrimaryShirt",
    "kitPrimaryShorts",
    "kitPrimarySocks",
    "kitSecondary",
    "kitSecondaryShirt",
    "kitSecondaryShorts",
    "kitSecondarySocks",
    "fieldName",
    "fieldAddress",
    "fieldType",
    "location",
    "localidade",
    "concelho",
    "distrito",
    "mapsUrl",
    "latitude",
    "longitude",
    "teamPhotoUrl",
    "foundedYear",
    "playerCount",
    "ageGroup",
    "socialFacebook",
    "socialInstagram",
    "trainingSchedule",
    "notes",
  ] as const;

  // Build a partial update object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};

  for (const field of fillableFields) {
    const primaryValue = primary[field];
    const secondaryValue = secondary[field];

    // If primary field is empty/null and secondary has data, copy it
    if (
      (primaryValue === null ||
        primaryValue === undefined ||
        primaryValue === "") &&
      secondaryValue !== null &&
      secondaryValue !== undefined &&
      secondaryValue !== ""
    ) {
      updates[field] = secondaryValue;
    }
  }

  // Also fill boolean fields if primary is false and secondary is true
  const boolFields = [
    "teamTypeF11",
    "teamTypeF7",
    "teamTypeFutsal",
    "dinnerThirdParty",
  ] as const;

  for (const field of boolFields) {
    if (!primary[field] && secondary[field]) {
      updates[field] = true;
    }
  }

  if (Object.keys(updates).length > 0) {
    updates.updatedAt = new Date();
    await db
      .update(teams)
      .set(updates)
      .where(eq(teams.id, primaryId));
  }

  // 3. Transfer matches from secondary to primary
  await db
    .update(matches)
    .set({ teamId: primaryId })
    .where(eq(matches.teamId, secondaryId));

  // 4. Transfer suggestions from secondary to primary
  await db
    .update(suggestions)
    .set({ teamId: primaryId })
    .where(eq(suggestions.teamId, secondaryId));

  // 5. Deactivate secondary
  await db
    .update(teams)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(teams.id, secondaryId));

  // 6. Update duplicate pair status to "merged"
  await db
    .update(duplicatePairs)
    .set({
      status: "merged",
      resolvedAt: new Date(),
    })
    .where(eq(duplicatePairs.id, pairId));

  // 7. Log in auditLog
  await logAudit({
    actorType: "super_admin",
    actorEmail: adminEmail,
    action: "teams_merged",
    teamId: primaryId,
    details: {
      primaryId,
      secondaryId,
      pairId,
      fieldsFilled: Object.keys(updates),
    },
  });
}
