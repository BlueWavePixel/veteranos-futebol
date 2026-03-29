import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  // Resumo geral
  const stats = await db.execute(sql`
    SELECT
      COUNT(*) as total,
      COUNT(maps_url) as com_maps,
      COUNT(latitude) as com_coords,
      COUNT(localidade) as com_localidade,
      COUNT(concelho) as com_concelho,
      COUNT(distrito) as com_distrito,
      COUNT(CASE WHEN localidade IS NOT NULL AND concelho IS NOT NULL AND distrito IS NOT NULL THEN 1 END) as completos
    FROM teams WHERE is_active = true
  `);
  const s = stats.rows[0] as any;
  console.log("=== RESUMO GERAL ===");
  console.log(`Total ativas: ${s.total}`);
  console.log(`Com Google Maps URL: ${s.com_maps}`);
  console.log(`Com coordenadas: ${s.com_coords}`);
  console.log(`Com localidade: ${s.com_localidade}`);
  console.log(`Com concelho: ${s.com_concelho}`);
  console.log(`Com distrito: ${s.com_distrito}`);
  console.log(`Completos (3 campos): ${s.completos}`);

  // Equipas SEM localização nenhuma
  const semLocal = await db.execute(sql`
    SELECT name, coordinator_email, maps_url, latitude, localidade, concelho, distrito, location
    FROM teams
    WHERE is_active = true
      AND concelho IS NULL
      AND distrito IS NULL
      AND localidade IS NULL
    ORDER BY name
    LIMIT 20
  `);
  console.log(`\n=== EQUIPAS SEM LOCALIZAÇÃO (${semLocal.rows.length} primeiras) ===`);
  for (const row of semLocal.rows as any[]) {
    console.log(`  ${row.name} | maps: ${row.maps_url ? "SIM" : "NÃO"} | coords: ${row.latitude ? "SIM" : "NÃO"} | location: ${row.location || "vazio"}`);
  }

  // Amostra de equipas COM geocoding aplicado
  const comGeo = await db.execute(sql`
    SELECT name, localidade, concelho, distrito, location, maps_url
    FROM teams
    WHERE is_active = true AND localidade IS NOT NULL AND concelho IS NOT NULL
    ORDER BY distrito, concelho, localidade
    LIMIT 20
  `);
  console.log(`\n=== AMOSTRA COM GEOCODING (20 primeiras) ===`);
  for (const row of comGeo.rows as any[]) {
    console.log(`  ${row.name} | ${row.localidade} | ${row.concelho} | ${row.distrito} | location: ${row.location}`);
  }

  // Equipas com coords mas SEM concelho/distrito (geocoding falhou?)
  const comCoordsSemLocal = await db.execute(sql`
    SELECT COUNT(*) as cnt FROM teams
    WHERE is_active = true AND latitude IS NOT NULL AND concelho IS NULL
  `);
  console.log(`\n=== Com coordenadas MAS sem concelho: ${(comCoordsSemLocal.rows[0] as any).cnt} ===`);

  // Distritos encontrados
  const distritos = await db.execute(sql`
    SELECT distrito, COUNT(*) as cnt
    FROM teams
    WHERE is_active = true AND distrito IS NOT NULL
    GROUP BY distrito
    ORDER BY cnt DESC
  `);
  console.log(`\n=== DISTRITOS (${distritos.rows.length}) ===`);
  for (const row of distritos.rows as any[]) {
    console.log(`  ${row.distrito}: ${row.cnt} equipas`);
  }
}

main().catch(console.error);
