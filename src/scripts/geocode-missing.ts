/**
 * Geocode teams that have a concelho but no coordinates.
 * Uses Nominatim (OSM) with 1-second delay between requests.
 *
 * Usage: npx tsx src/scripts/geocode-missing.ts [--dry-run]
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { teams } from "../lib/db/schema.js";
import { isNull, or, isNotNull, and } from "drizzle-orm";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const dryRun = process.argv.includes("--dry-run");

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=pt,es&accept-language=pt`;
  const res = await fetch(url, {
    headers: { "User-Agent": "VeteranosFutebol/1.0 (geocoding script)" },
  });
  const data = await res.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const missing = await db
    .select({ id: teams.id, name: teams.name, concelho: teams.concelho })
    .from(teams)
    .where(
      and(
        or(isNull(teams.latitude), isNull(teams.longitude)),
        isNotNull(teams.concelho)
      )
    );

  console.log(`${missing.length} equipas sem coordenadas (com concelho)`);
  if (dryRun) console.log("(DRY RUN — não vai alterar a BD)");

  let fixed = 0;
  let failed = 0;

  for (const team of missing) {
    if (!team.concelho) continue;

    // Try: "team name, concelho, Portugal" first, then just "concelho, Portugal"
    const queries = [
      `${team.name}, ${team.concelho}, Portugal`,
      `${team.concelho}, Portugal`,
    ];

    let coords: { lat: number; lng: number } | null = null;
    for (const q of queries) {
      coords = await geocode(q);
      if (coords) break;
      await sleep(1100); // Nominatim rate limit
    }

    if (coords) {
      if (!dryRun) {
        const { eq } = await import("drizzle-orm");
        await db
          .update(teams)
          .set({ latitude: String(coords.lat), longitude: String(coords.lng) })
          .where(eq(teams.id, team.id));
      }
      console.log(`  ✓ ${team.name} (${team.concelho}) → ${coords.lat}, ${coords.lng}`);
      fixed++;
    } else {
      console.log(`  ✗ ${team.name} (${team.concelho}) — não encontrado`);
      failed++;
    }

    await sleep(1100);
  }

  console.log(`\nResultado: ${fixed} corrigidas, ${failed} falharam`);
  process.exit(0);
}

main();
