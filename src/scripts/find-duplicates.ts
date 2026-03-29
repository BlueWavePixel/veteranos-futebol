import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  // 1. Duplicados por nome exato (case-insensitive)
  const byName = await db.execute(sql`
    SELECT LOWER(TRIM(name)) as norm_name,
           COUNT(*) as cnt,
           ARRAY_AGG(id) as ids,
           ARRAY_AGG(name) as names,
           ARRAY_AGG(COALESCE(location,'sem')) as locations,
           ARRAY_AGG(coordinator_email) as emails,
           ARRAY_AGG(is_active::text) as active
    FROM teams
    GROUP BY LOWER(TRIM(name))
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
  `);

  console.log("========================================");
  console.log("1. DUPLICADOS POR NOME EXATO");
  console.log("========================================\n");
  printGroups(byName.rows as any[]);

  // 2. Mesmo email de coordenador com equipas diferentes
  const byEmail = await db.execute(sql`
    SELECT coordinator_email,
           COUNT(*) as cnt,
           ARRAY_AGG(id) as ids,
           ARRAY_AGG(name) as names,
           ARRAY_AGG(COALESCE(location,'sem')) as locations,
           ARRAY_AGG(is_active::text) as active
    FROM teams
    WHERE coordinator_email IS NOT NULL AND coordinator_email != ''
    GROUP BY coordinator_email
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
  `);

  console.log("\n========================================");
  console.log("2. MESMO EMAIL, EQUIPAS DIFERENTES");
  console.log("========================================\n");
  for (const row of byEmail.rows as any[]) {
    console.log(`Email: ${row.coordinator_email} (x${row.cnt})`);
    for (let i = 0; i < row.cnt; i++) {
      console.log(`  ${i + 1}. ${row.names[i]} | ${row.locations[i]} | Ativa: ${row.active[i]}`);
    }
    console.log("");
  }
  console.log(`Total: ${byEmail.rows.length} emails com múltiplas equipas\n`);

  // 3. Equipas sem nome ou com nomes genéricos/vazios
  const noName = await db.execute(sql`
    SELECT id, name, coordinator_name, coordinator_email, COALESCE(location,'sem') as location, is_active
    FROM teams
    WHERE TRIM(name) = ''
       OR name IS NULL
       OR LOWER(TRIM(name)) IN ('veteranos', 'equipa', 'teste', 'test', 'xxx', 'aaa')
       OR LENGTH(TRIM(name)) <= 2
       OR name ~ '^\d+$'
    ORDER BY name
  `);

  console.log("========================================");
  console.log("3. EQUIPAS SEM NOME / NOME GENÉRICO");
  console.log("========================================\n");
  if (noName.rows.length === 0) {
    console.log("Nenhuma encontrada.\n");
  } else {
    for (const row of noName.rows as any[]) {
      console.log(`  Nome: "${row.name}" | Coord: ${row.coordinator_name} (${row.coordinator_email}) | ${row.location} | Ativa: ${row.is_active}`);
    }
    console.log(`\nTotal: ${noName.rows.length}\n`);
  }

  // 4. Nomes muito parecidos (primeiras 15 letras iguais, ignorando case)
  const similar = await db.execute(sql`
    SELECT LOWER(LEFT(TRIM(name), 15)) as prefix,
           COUNT(*) as cnt,
           ARRAY_AGG(id) as ids,
           ARRAY_AGG(name) as names,
           ARRAY_AGG(COALESCE(location,'sem')) as locations,
           ARRAY_AGG(coordinator_email) as emails,
           ARRAY_AGG(is_active::text) as active
    FROM teams
    WHERE LENGTH(TRIM(name)) > 3
    GROUP BY LOWER(LEFT(TRIM(name), 15))
    HAVING COUNT(*) > 1
       AND COUNT(DISTINCT LOWER(TRIM(name))) > 1
    ORDER BY COUNT(*) DESC
  `);

  console.log("========================================");
  console.log("4. NOMES MUITO PARECIDOS (prefixo comum)");
  console.log("========================================\n");
  for (const row of similar.rows as any[]) {
    console.log(`Prefixo: "${row.prefix}..." (x${row.cnt})`);
    for (let i = 0; i < row.cnt; i++) {
      console.log(`  ${i + 1}. ${row.names[i]} | ${row.locations[i]} | ${row.emails[i]} | Ativa: ${row.active[i]}`);
    }
    console.log("");
  }
  console.log(`Total: ${similar.rows.length} grupos com nomes parecidos\n`);

  // 5. Mesmo telefone de coordenador
  const byPhone = await db.execute(sql`
    SELECT coordinator_phone,
           COUNT(*) as cnt,
           ARRAY_AGG(id) as ids,
           ARRAY_AGG(name) as names,
           ARRAY_AGG(coordinator_email) as emails,
           ARRAY_AGG(is_active::text) as active
    FROM teams
    WHERE coordinator_phone IS NOT NULL
      AND TRIM(coordinator_phone) != ''
      AND LENGTH(TRIM(coordinator_phone)) > 5
    GROUP BY coordinator_phone
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
  `);

  console.log("========================================");
  console.log("5. MESMO TELEFONE, EQUIPAS DIFERENTES");
  console.log("========================================\n");
  for (const row of byPhone.rows as any[]) {
    console.log(`Tel: ${row.coordinator_phone} (x${row.cnt})`);
    for (let i = 0; i < row.cnt; i++) {
      console.log(`  ${i + 1}. ${row.names[i]} | ${row.emails[i]} | Ativa: ${row.active[i]}`);
    }
    console.log("");
  }
  console.log(`Total: ${byPhone.rows.length} telefones com múltiplas equipas\n`);
}

function printGroups(rows: any[]) {
  let totalDupes = 0;
  for (const row of rows) {
    console.log(`Nome: ${row.names[0]} (x${row.cnt})`);
    totalDupes += row.cnt - 1;
    for (let i = 0; i < row.cnt; i++) {
      console.log(`  ${i + 1}. ${row.names[i]} | ${row.locations[i]} | ${row.emails[i]} | Ativa: ${row.active[i]}`);
    }
    console.log("");
  }
  console.log(`Total: ${rows.length} grupos, ${totalDupes} registos a mais\n`);
}

main().catch(console.error);
