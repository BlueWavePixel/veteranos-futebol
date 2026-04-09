import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  // Limpar flags anteriores
  await db.execute(sql`UPDATE teams SET duplicate_flag = NULL`);
  console.log("Flags anteriores limpas.\n");

  // 1. Mesmo email com múltiplas equipas (só ativas)
  const byEmail = await db.execute(sql`
    SELECT coordinator_email, ARRAY_AGG(id) as ids
    FROM teams
    WHERE is_active = true AND coordinator_email IS NOT NULL AND coordinator_email != ''
    GROUP BY coordinator_email
    HAVING COUNT(*) > 1
  `);

  for (const row of byEmail.rows as any[]) {
    for (const id of row.ids) {
      await db.execute(sql`
        UPDATE teams SET duplicate_flag = COALESCE(duplicate_flag || ' | ', '') || ${"Mesmo email: " + row.coordinator_email}
        WHERE id = ${id}::uuid AND (duplicate_flag IS NULL OR duplicate_flag NOT LIKE ${"%" + row.coordinator_email + "%"})
      `);
    }
  }
  console.log(`Marcados por email: ${byEmail.rows.length} grupos`);

  // 2. Mesmo telefone com múltiplas equipas (só ativas)
  const byPhone = await db.execute(sql`
    SELECT coordinator_phone, ARRAY_AGG(id) as ids
    FROM teams
    WHERE is_active = true AND coordinator_phone IS NOT NULL AND TRIM(coordinator_phone) != '' AND LENGTH(TRIM(coordinator_phone)) > 5
    GROUP BY coordinator_phone
    HAVING COUNT(*) > 1
  `);

  for (const row of byPhone.rows as any[]) {
    for (const id of row.ids) {
      await db.execute(sql`
        UPDATE teams SET duplicate_flag = COALESCE(duplicate_flag || ' | ', '') || ${"Mesmo tel: " + row.coordinator_phone}
        WHERE id = ${id}::uuid AND (duplicate_flag IS NULL OR duplicate_flag NOT LIKE ${"%" + row.coordinator_phone + "%"})
      `);
    }
  }
  console.log(`Marcados por telefone: ${byPhone.rows.length} grupos`);

  // 3. Mesmo nome (case-insensitive, só ativas)
  const byName = await db.execute(sql`
    SELECT LOWER(TRIM(name)) as norm, ARRAY_AGG(id) as ids
    FROM teams
    WHERE is_active = true
    GROUP BY LOWER(TRIM(name))
    HAVING COUNT(*) > 1
  `);

  for (const row of byName.rows as any[]) {
    for (const id of row.ids) {
      await db.execute(sql`
        UPDATE teams SET duplicate_flag = COALESCE(duplicate_flag || ' | ', '') || 'Nome duplicado'
        WHERE id = ${id}::uuid AND (duplicate_flag IS NULL OR duplicate_flag NOT LIKE '%Nome duplicado%')
      `);
    }
  }
  console.log(`Marcados por nome: ${byName.rows.length} grupos`);

  // 4. Nome da equipa igual ao nome do coordenador (só ativas)
  const personalNames = await db.execute(sql`
    SELECT id, name, coordinator_name FROM teams
    WHERE is_active = true
      AND coordinator_name IS NOT NULL
      AND TRIM(coordinator_name) != ''
      AND LOWER(TRIM(name)) = LOWER(TRIM(coordinator_name))
  `);

  for (const row of personalNames.rows as any[]) {
    await db.execute(sql`
      UPDATE teams SET duplicate_flag = COALESCE(duplicate_flag || ' | ', '') || 'Nome equipa = nome coordenador'
      WHERE id = ${row.id}::uuid AND (duplicate_flag IS NULL OR duplicate_flag NOT LIKE '%nome coordenador%')
    `);
  }
  console.log(`Nome equipa = nome coordenador: ${personalNames.rows.length}`);
  for (const row of personalNames.rows as any[]) {
    console.log(`  - "${row.name}" (coord: ${row.coordinator_name})`);
  }

  // Contar total de flagged
  const [{ total }] = (await db.execute(sql`
    SELECT COUNT(*) as total FROM teams WHERE duplicate_flag IS NOT NULL
  `)).rows as any[];

  console.log(`\n=== Total de equipas marcadas: ${total} ===`);
}

main().catch(console.error);
