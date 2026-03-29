import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  // Limpar flags anteriores
  await db.execute(sql`UPDATE teams SET duplicate_flag = NULL`);
  console.log("Flags anteriores limpas.\n");

  let flagged = 0;

  // 1. Mesmo email com múltiplas equipas
  const byEmail = await db.execute(sql`
    SELECT coordinator_email, ARRAY_AGG(id) as ids
    FROM teams
    WHERE coordinator_email IS NOT NULL AND coordinator_email != ''
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

  // 2. Mesmo telefone com múltiplas equipas
  const byPhone = await db.execute(sql`
    SELECT coordinator_phone, ARRAY_AGG(id) as ids
    FROM teams
    WHERE coordinator_phone IS NOT NULL AND TRIM(coordinator_phone) != '' AND LENGTH(TRIM(coordinator_phone)) > 5
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

  // 3. Mesmo nome (case-insensitive)
  const byName = await db.execute(sql`
    SELECT LOWER(TRIM(name)) as norm, ARRAY_AGG(id) as ids
    FROM teams
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

  // 4. Nome pessoal (sem palavras típicas de equipa)
  const personalNames = await db.execute(sql`
    SELECT id, name FROM teams
    WHERE is_active = true
      AND LOWER(name) NOT LIKE '%veterano%'
      AND LOWER(name) NOT LIKE '%clube%'
      AND LOWER(name) NOT LIKE '%grupo%'
      AND LOWER(name) NOT LIKE '%associação%'
      AND LOWER(name) NOT LIKE '%sporting%'
      AND LOWER(name) NOT LIKE '%sport%'
      AND LOWER(name) NOT LIKE '%união%'
      AND LOWER(name) NOT LIKE '%atlético%'
      AND LOWER(name) NOT LIKE '%atletico%'
      AND LOWER(name) NOT LIKE '%futebol%'
      AND LOWER(name) NOT LIKE '%fc%'
      AND LOWER(name) NOT LIKE '%f.c%'
      AND LOWER(name) NOT LIKE '%sc %'
      AND LOWER(name) NOT LIKE '%s.c%'
      AND LOWER(name) NOT LIKE '%núcleo%'
      AND LOWER(name) NOT LIKE '%recreativ%'
      AND LOWER(name) NOT LIKE '%desportiv%'
      AND LOWER(name) NOT LIKE '%sociedade%'
      AND LOWER(name) NOT LIKE '%velha%'
      AND LOWER(name) NOT LIKE '%amigos%'
      AND LOWER(name) NOT LIKE '%bairro%'
      AND LOWER(name) NOT LIKE '%peña%'
      AND LOWER(name) NOT LIKE '%u.d%'
      AND LOWER(name) NOT LIKE '%gd %'
      AND LOWER(name) NOT LIKE '%g.d%'
      AND LOWER(name) NOT LIKE '%real %'
      AND LOWER(name) NOT LIKE '%académic%'
      AND LOWER(name) NOT LIKE '%boavista%'
      AND LOWER(name) NOT LIKE '%benfica%'
      AND LOWER(name) NOT LIKE '%casa do%'
      AND LOWER(name) NOT LIKE '%casa pia%'
      AND LOWER(name) NOT LIKE '%uva%'
      AND LOWER(name) NOT LIKE '%grap%'
      AND LOWER(name) NOT LIKE '%grc%'
      AND LENGTH(TRIM(name)) > 0
      AND name ~ '^[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ][a-záéíóúàâêôãõç]+ [A-ZÁÉÍÓÚÀÂÊÔÃÕÇ][a-záéíóúàâêôãõç]+( [A-ZÁÉÍÓÚÀÂÊÔÃÕÇ].*)?$'
      AND array_length(string_to_array(TRIM(name), ' '), 1) BETWEEN 2 AND 4
  `);

  for (const row of personalNames.rows as any[]) {
    await db.execute(sql`
      UPDATE teams SET duplicate_flag = COALESCE(duplicate_flag || ' | ', '') || 'Possível nome pessoal'
      WHERE id = ${row.id}::uuid AND (duplicate_flag IS NULL OR duplicate_flag NOT LIKE '%nome pessoal%')
    `);
  }
  console.log(`Possíveis nomes pessoais: ${personalNames.rows.length}`);
  for (const row of personalNames.rows as any[]) {
    console.log(`  - "${row.name}"`);
  }

  // Contar total de flagged
  const [{ total }] = (await db.execute(sql`
    SELECT COUNT(*) as total FROM teams WHERE duplicate_flag IS NOT NULL
  `)).rows as any[];

  console.log(`\n=== Total de equipas marcadas: ${total} ===`);
}

main().catch(console.error);
