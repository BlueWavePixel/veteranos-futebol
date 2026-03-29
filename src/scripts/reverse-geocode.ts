import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { teams } from "../lib/db/schema";
import { eq, and, isNotNull, sql } from "drizzle-orm";

const db = drizzle(neon(process.env.DATABASE_URL!));

// Nominatim reverse geocode (free, 1 req/sec)
async function reverseGeocode(lat: number, lng: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=pt`;

  const res = await fetch(url, {
    headers: { "User-Agent": "VeteranosFutebol/1.0" },
  });

  if (!res.ok) {
    console.error(`  ✗ HTTP ${res.status} para ${lat},${lng}`);
    return null;
  }

  const data = await res.json();
  if (!data.address) return null;

  const addr = data.address;

  // Extrair localidade (freguesia/village/suburb)
  const localidade =
    addr.village ||
    addr.suburb ||
    addr.neighbourhood ||
    addr.hamlet ||
    addr.town ||
    null;

  // Extrair concelho (municipality/city/town)
  const concelho =
    addr.municipality ||
    addr.city ||
    addr.town ||
    null;

  // Extrair distrito (state_district/state)
  const distrito =
    addr.state_district ||
    addr.district ||
    addr.state ||
    null;

  return { localidade, concelho, distrito };
}

async function main() {
  // Buscar equipas com coordenadas
  const allTeams = await db
    .select({
      id: teams.id,
      name: teams.name,
      latitude: teams.latitude,
      longitude: teams.longitude,
      localidade: teams.localidade,
      concelho: teams.concelho,
      distrito: teams.distrito,
    })
    .from(teams)
    .where(
      and(
        eq(teams.isActive, true),
        isNotNull(teams.latitude),
        isNotNull(teams.longitude)
      )
    );

  console.log(`Encontradas ${allTeams.length} equipas com coordenadas\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const team of allTeams) {
    const lat = parseFloat(team.latitude!);
    const lng = parseFloat(team.longitude!);

    if (isNaN(lat) || isNaN(lng)) {
      console.log(`⊘ ${team.name} — coordenadas inválidas`);
      skipped++;
      continue;
    }

    console.log(`→ ${team.name} (${lat}, ${lng})`);

    const geo = await reverseGeocode(lat, lng);

    if (!geo) {
      console.log(`  ✗ Sem resultado de geocoding`);
      errors++;
      // Respeitar rate limit do Nominatim
      await new Promise((r) => setTimeout(r, 1100));
      continue;
    }

    const updates: Record<string, string | null> = {};

    if (geo.localidade) updates.localidade = geo.localidade;
    if (geo.concelho) updates.concelho = geo.concelho;
    if (geo.distrito) updates.distrito = geo.distrito;

    if (Object.keys(updates).length === 0) {
      console.log(`  ⊘ Sem dados relevantes no resultado`);
      skipped++;
    } else {
      // Atualizar location combinado
      const newConcelho = updates.concelho || team.concelho;
      const newDistrito = updates.distrito || team.distrito;
      const location = [newConcelho, newDistrito].filter(Boolean).join(" / ");

      await db
        .update(teams)
        .set({
          ...updates,
          location: location || undefined,
          updatedAt: new Date(),
        })
        .where(eq(teams.id, team.id));

      const changes = Object.entries(updates)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      console.log(`  ✓ ${changes}`);
      updated++;
    }

    // Respeitar rate limit do Nominatim (1 req/sec)
    await new Promise((r) => setTimeout(r, 1100));
  }

  console.log(`\n--- Resumo ---`);
  console.log(`Atualizadas: ${updated}`);
  console.log(`Sem alteração: ${skipped}`);
  console.log(`Erros: ${errors}`);
  console.log(`Total: ${allTeams.length}`);
}

main().catch(console.error);
