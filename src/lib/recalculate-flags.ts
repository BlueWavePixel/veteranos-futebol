import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

/**
 * Recalcula os flags de duplicados considerando apenas equipas ativas.
 * Deve ser chamado após desativar/reativar equipas.
 */
export async function recalculateDuplicateFlags() {
  // Limpar todos os flags
  await db.execute(sql`UPDATE teams SET duplicate_flag = NULL`);

  // 1. Mesmo email (só ativas)
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

  // 2. Mesmo telefone (só ativas)
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

  // 3. Mesmo nome (só ativas)
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

  // 4. Nome da equipa igual ao nome do coordenador (só ativas)
  const personalNames = await db.execute(sql`
    SELECT id FROM teams
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
}
