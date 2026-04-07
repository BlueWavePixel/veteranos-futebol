import { db } from "@/lib/db";
import { teams, duplicatePairs } from "@/lib/db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import {
  normalizeText,
  normalizePhone,
  levenshtein,
  haversineDistance,
} from "@/lib/duplicates/detect";
import type { Team, NewDuplicatePair } from "@/lib/db/schema";

/**
 * Recalcula os pares de duplicados usando a tabela duplicate_pairs.
 * Mantém pares já resolvidos (not_duplicate, confirmed_duplicate, merged).
 * Recria apenas os pending.
 */
export async function recalculateDuplicateFlags() {
  // 1. Delete all pending pairs (keep resolved ones)
  await db
    .delete(duplicatePairs)
    .where(eq(duplicatePairs.status, "pending"));

  // 2. Load resolved "not_duplicate" pairs to avoid re-flagging
  const resolvedNotDuplicate = await db
    .select({
      teamAId: duplicatePairs.teamAId,
      teamBId: duplicatePairs.teamBId,
    })
    .from(duplicatePairs)
    .where(eq(duplicatePairs.status, "not_duplicate"));

  const excludedPairs = new Set<string>();
  for (const pair of resolvedNotDuplicate) {
    // Store both directions
    excludedPairs.add(`${pair.teamAId}::${pair.teamBId}`);
    excludedPairs.add(`${pair.teamBId}::${pair.teamAId}`);
  }

  // Also load merged pairs to skip those too
  const resolvedMerged = await db
    .select({
      teamAId: duplicatePairs.teamAId,
      teamBId: duplicatePairs.teamBId,
    })
    .from(duplicatePairs)
    .where(eq(duplicatePairs.status, "merged"));

  for (const pair of resolvedMerged) {
    excludedPairs.add(`${pair.teamAId}::${pair.teamBId}`);
    excludedPairs.add(`${pair.teamBId}::${pair.teamAId}`);
  }

  // Also load confirmed_duplicate to not re-create them
  const resolvedConfirmed = await db
    .select({
      teamAId: duplicatePairs.teamAId,
      teamBId: duplicatePairs.teamBId,
    })
    .from(duplicatePairs)
    .where(eq(duplicatePairs.status, "confirmed_duplicate"));

  for (const pair of resolvedConfirmed) {
    excludedPairs.add(`${pair.teamAId}::${pair.teamBId}`);
    excludedPairs.add(`${pair.teamBId}::${pair.teamAId}`);
  }

  // 3. Fetch all active teams
  const activeTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.isActive, true));

  // 4. Compare each pair
  const newPairs: NewDuplicatePair[] = [];
  const seenPairs = new Set<string>();

  for (let i = 0; i < activeTeams.length; i++) {
    const teamA = activeTeams[i];

    // Self-check: name equals coordinator name
    if (teamA.coordinatorName && teamA.coordinatorName.trim()) {
      const normName = normalizeText(teamA.name);
      const normCoord = normalizeText(teamA.coordinatorName);
      if (normName && normCoord && normName === normCoord) {
        // This is a self-check flag, create a pair with teamA = teamB
        const pairKey = `${teamA.id}::${teamA.id}`;
        if (!excludedPairs.has(pairKey) && !seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          newPairs.push({
            teamAId: teamA.id,
            teamBId: teamA.id,
            reason: "name_equals_coordinator",
            similarityScore: 0.4,
          });
        }
      }
    }

    for (let j = i + 1; j < activeTeams.length; j++) {
      const teamB = activeTeams[j];
      const pairKey = `${teamA.id}::${teamB.id}`;

      if (excludedPairs.has(pairKey) || seenPairs.has(pairKey)) continue;

      // Find the best match reason for this pair
      let bestScore = 0;
      let bestReason = "";

      // Email match (exact, case-insensitive)
      if (teamA.coordinatorEmail && teamB.coordinatorEmail) {
        if (
          teamA.coordinatorEmail.toLowerCase().trim() ===
          teamB.coordinatorEmail.toLowerCase().trim()
        ) {
          if (1.0 > bestScore) {
            bestScore = 1.0;
            bestReason = "email";
          }
        }
      }

      // Phone match
      if (teamA.coordinatorPhone && teamB.coordinatorPhone) {
        const phoneA = teamA.coordinatorPhone.trim();
        const phoneB = teamB.coordinatorPhone.trim();

        if (phoneA.length > 5 && phoneB.length > 5) {
          // Exact match
          if (phoneA === phoneB) {
            if (0.9 > bestScore) {
              bestScore = 0.9;
              bestReason = "phone";
            }
          } else {
            // Normalized match
            const normA = normalizePhone(phoneA);
            const normB = normalizePhone(phoneB);
            if (normA && normB && normA === normB) {
              if (0.8 > bestScore) {
                bestScore = 0.8;
                bestReason = "phone_normalized";
              }
            }
          }
        }
      }

      // Name match — only exact or very close (Levenshtein ≤ 1)
      const normNameA = normalizeText(teamA.name);
      const normNameB = normalizeText(teamB.name);

      if (normNameA && normNameB) {
        if (normNameA === normNameB) {
          if (0.9 > bestScore) {
            bestScore = 0.9;
            bestReason = "name_exact";
          }
        } else {
          const dist = levenshtein(normNameA, normNameB);
          if (dist <= 1) {
            if (0.8 > bestScore) {
              bestScore = 0.8;
              bestReason = "name_fuzzy";
            }
          }
        }
      }

      if (bestScore > 0) {
        seenPairs.add(pairKey);
        newPairs.push({
          teamAId: teamA.id,
          teamBId: teamB.id,
          reason: bestReason,
          similarityScore: bestScore,
        });
      }
    }
  }

  // 5. Batch insert new pairs
  if (newPairs.length > 0) {
    // Insert in batches of 100 to avoid query size limits
    const BATCH_SIZE = 100;
    for (let i = 0; i < newPairs.length; i += BATCH_SIZE) {
      const batch = newPairs.slice(i, i + BATCH_SIZE);
      await db.insert(duplicatePairs).values(batch).onConflictDoNothing();
    }
  }
}
