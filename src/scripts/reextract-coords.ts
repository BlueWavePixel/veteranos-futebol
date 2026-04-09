/**
 * Re-extract coordinates for teams that have a maps_url but no latitude/longitude.
 *
 * Strategy (in order):
 * 1. Try extractCoordinates() on the maps_url (handles short URLs, DMS, text+URL, etc.)
 * 2. Fallback: geocode by concelho via Nominatim (gives approximate concelho center)
 *
 * Usage: npx tsx src/scripts/reextract-coords.ts [--dry-run]
 */

import { neon } from "@neondatabase/serverless";
import { extractCoordinates } from "../lib/geo";
import { config } from "dotenv";
config({ path: ".env.local" });

const isDryRun = process.argv.includes("--dry-run");
const sql = neon(process.env.DATABASE_URL!);

async function geocodeViaNominatim(
  concelho: string | null,
  distrito: string | null,
): Promise<{ latitude: number; longitude: number } | null> {
  if (!concelho) return null;
  const query = [concelho, distrito, "Portugal"].filter(Boolean).join(", ");
  try {
    const url =
      "https://nominatim.openstreetmap.org/search?" +
      new URLSearchParams({ q: query, format: "json", limit: "1", countrycodes: "pt,es" });
    const res = await fetch(url, {
      headers: { "User-Agent": "VeteranosFutebol/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    if (data.length > 0) {
      return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }
  } catch {
    // Nominatim error
  }
  return null;
}

async function main() {
  console.log(isDryRun ? "=== DRY RUN ===" : "=== LIVE RUN ===");

  const broken = await sql`
    SELECT id, name, maps_url, concelho, distrito
    FROM teams
    WHERE is_active = true
      AND maps_url IS NOT NULL
      AND maps_url != ''
      AND (latitude IS NULL OR longitude IS NULL)
    ORDER BY name
  `;

  console.log(`Found ${broken.length} teams with URL but no coordinates.\n`);

  let fixedUrl = 0;
  let fixedGeo = 0;
  let failed = 0;
  const failures: { name: string; url: string }[] = [];

  for (const team of broken) {
    // Step 1: Try URL extraction
    const coords = await extractCoordinates(team.maps_url);

    if (coords) {
      console.log(`✓ [URL] ${team.name}`);
      console.log(`  → ${coords.latitude}, ${coords.longitude}`);
      if (!isDryRun) {
        await sql`
          UPDATE teams
          SET latitude = ${coords.latitude.toString()},
              longitude = ${coords.longitude.toString()},
              updated_at = NOW()
          WHERE id = ${team.id}
        `;
      }
      fixedUrl++;
    } else {
      // Step 2: Fallback to Nominatim geocoding by concelho
      await new Promise((r) => setTimeout(r, 1100)); // Nominatim rate limit: 1 req/sec
      const geo = await geocodeViaNominatim(team.concelho, team.distrito);

      if (geo) {
        console.log(`~ [GEO] ${team.name} (${team.concelho || "?"})` );
        console.log(`  → ${geo.latitude}, ${geo.longitude} (approx. concelho center)`);
        if (!isDryRun) {
          await sql`
            UPDATE teams
            SET latitude = ${geo.latitude.toString()},
                longitude = ${geo.longitude.toString()},
                updated_at = NOW()
            WHERE id = ${team.id}
          `;
        }
        fixedGeo++;
      } else {
        console.log(`✗ ${team.name}`);
        console.log(`  URL: ${team.maps_url}`);
        console.log(`  Concelho: ${team.concelho || "N/A"}`);
        failures.push({ name: team.name, url: team.maps_url });
        failed++;
      }
    }
    console.log();
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log("=== SUMMARY ===");
  console.log(`Fixed via URL extraction: ${fixedUrl}`);
  console.log(`Fixed via Nominatim geocoding: ${fixedGeo}`);
  console.log(`Total fixed: ${fixedUrl + fixedGeo}`);
  console.log(`Failed: ${failed}`);

  if (failures.length > 0) {
    console.log("\n=== NEEDS MANUAL FIX ===");
    for (const f of failures) {
      console.log(`  ${f.name}: ${f.url}`);
    }
  }
}

main().catch(console.error);
