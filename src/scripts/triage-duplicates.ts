import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  // Duplicados por email
  console.log("=== DUPLICADOS POR EMAIL ===\n");
  const byEmail = await db.execute(sql`
    SELECT coordinator_email,
      json_agg(json_build_object(
        'id', id, 'name', name, 'coordinator_name', coordinator_name,
        'coordinator_phone', coordinator_phone, 'location', location,
        'distrito', distrito, 'created_at', created_at,
        'field_name', field_name, 'coordinator_alt_phone', coordinator_alt_phone
      ) ORDER BY created_at ASC) as teams
    FROM teams
    WHERE is_active = true AND coordinator_email IS NOT NULL AND coordinator_email != ''
    GROUP BY coordinator_email
    HAVING COUNT(*) > 1
    ORDER BY coordinator_email
  `);

  for (const row of byEmail.rows as any[]) {
    const teams = row.teams;
    console.log(`EMAIL: ${row.coordinator_email} (${teams.length} equipas)`);
    for (const t of teams) {
      console.log(`  ${t.created_at.substring(0, 10)} | ${t.name} | coord: ${t.coordinator_name} | ${t.location || "-"} | ${t.distrito || "-"} | tel: ${t.coordinator_phone || "-"} | campo: ${t.field_name || "-"}`);
    }
    const names = [...new Set(teams.map((t: any) => t.name.toLowerCase().trim()))];
    if (names.length === 1) {
      console.log(`  >> MESMO NOME - mais antigo: ${teams[0].created_at.substring(0, 10)} - PODE APAGAR OS MAIS RECENTES`);
    } else {
      console.log(`  >> NOMES DIFERENTES - coordenador com múltiplas equipas, verificar manualmente`);
    }
    console.log();
  }

  // Duplicados por telefone (excluindo os que já são duplicados por email)
  console.log("\n=== DUPLICADOS POR TELEFONE (extra, sem sobreposição com email) ===\n");
  const byPhone = await db.execute(sql`
    SELECT coordinator_phone,
      json_agg(json_build_object(
        'id', id, 'name', name, 'coordinator_name', coordinator_name,
        'coordinator_email', coordinator_email, 'location', location,
        'distrito', distrito, 'created_at', created_at
      ) ORDER BY created_at ASC) as teams
    FROM teams
    WHERE is_active = true AND coordinator_phone IS NOT NULL AND TRIM(coordinator_phone) != '' AND LENGTH(TRIM(coordinator_phone)) > 5
    GROUP BY coordinator_phone
    HAVING COUNT(*) > 1
    ORDER BY coordinator_phone
  `);

  for (const row of byPhone.rows as any[]) {
    const teams = row.teams;
    const emails = [...new Set(teams.map((t: any) => (t.coordinator_email || "").toLowerCase()))];
    if (emails.length === 1 && emails[0]) continue; // já reportado por email

    console.log(`TEL: ${row.coordinator_phone} (${teams.length} equipas)`);
    for (const t of teams) {
      console.log(`  ${t.created_at.substring(0, 10)} | ${t.name} | coord: ${t.coordinator_name} | ${t.coordinator_email} | ${t.location || "-"} | ${t.distrito || "-"}`);
    }
    const names = [...new Set(teams.map((t: any) => t.name.toLowerCase().trim()))];
    if (names.length === 1) {
      console.log(`  >> MESMO NOME - mais antigo: ${teams[0].created_at.substring(0, 10)} - PODE APAGAR OS MAIS RECENTES`);
    } else {
      console.log(`  >> NOMES DIFERENTES - mesmo telefone, equipas diferentes, verificar manualmente`);
    }
    console.log();
  }

  // Duplicados por nome
  console.log("\n=== DUPLICADOS POR NOME (mesmo nome, contactos diferentes) ===\n");
  const byName = await db.execute(sql`
    SELECT LOWER(TRIM(name)) as norm,
      json_agg(json_build_object(
        'id', id, 'name', name, 'coordinator_name', coordinator_name,
        'coordinator_email', coordinator_email, 'coordinator_phone', coordinator_phone,
        'location', location, 'distrito', distrito, 'created_at', created_at
      ) ORDER BY created_at ASC) as teams
    FROM teams
    WHERE is_active = true
    GROUP BY LOWER(TRIM(name))
    HAVING COUNT(*) > 1
    ORDER BY LOWER(TRIM(name))
  `);

  for (const row of byName.rows as any[]) {
    const teams = row.teams;
    // Skip if already covered by email or phone duplicates
    const emails = [...new Set(teams.map((t: any) => (t.coordinator_email || "").toLowerCase()))];
    const phones = [...new Set(teams.map((t: any) => (t.coordinator_phone || "").trim()).filter((p: any) => p && p.length > 5))];
    if (emails.length === 1 && emails[0]) continue; // já no grupo email
    if (phones.length === 1 && phones[0]) continue; // já no grupo telefone

    console.log(`NOME: "${teams[0].name}" (${teams.length} equipas, contactos diferentes)`);
    for (const t of teams) {
      console.log(`  ${t.created_at.substring(0, 10)} | coord: ${t.coordinator_name} | ${t.coordinator_email} | tel: ${t.coordinator_phone || "-"} | ${t.location || "-"} | ${t.distrito || "-"}`);
    }
    console.log(`  >> MESMO NOME mas contactos diferentes - possivelmente equipas distintas ou mudança de coordenador`);
    console.log();
  }
}

main().catch(console.error);
