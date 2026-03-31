import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  let total = 0;

  // Helper: deactivate all but the oldest for a given email, keeping specific IDs
  async function deactivateByEmail(email: string, keepCount: number = 1) {
    const rows = await db.execute(sql`
      SELECT id, name, created_at FROM teams
      WHERE is_active = true AND coordinator_email = ${email}
      ORDER BY created_at ASC
    `);
    const toDeactivate = (rows.rows as any[]).slice(keepCount);
    for (const r of toDeactivate) {
      await db.execute(sql`UPDATE teams SET is_active = false, updated_at = NOW() WHERE id = ${r.id}::uuid`);
      console.log(`  DESATIVADO: ${r.name} (${r.id}) criado ${r.created_at.toString().substring(0, 10)}`);
      total++;
    }
    return toDeactivate.length;
  }

  async function deactivateByPhone(phone: string, keepCount: number = 1) {
    const rows = await db.execute(sql`
      SELECT id, name, created_at FROM teams
      WHERE is_active = true AND coordinator_phone = ${phone}
      ORDER BY created_at ASC
    `);
    const toDeactivate = (rows.rows as any[]).slice(keepCount);
    for (const r of toDeactivate) {
      await db.execute(sql`UPDATE teams SET is_active = false, updated_at = NOW() WHERE id = ${r.id}::uuid`);
      console.log(`  DESATIVADO: ${r.name} (${r.id}) criado ${r.created_at.toString().substring(0, 10)}`);
      total++;
    }
    return toDeactivate.length;
  }

  // 1. Veteranos de Tavira - grupovetaranosdetavira@gmail.com - manter 15 cópias spam, apagar
  //    Tem 2 originais com emails diferentes (nelinho.frutas@ e grupoveteranosdetavira@)
  //    Manter os 2 originais de 2022-12-08, apagar as 15 de 2026-03-30
  console.log("\n1. Grupo Veteranos de Tavira (grupovetaranosdetavira@gmail.com) - 15 cópias spam");
  await deactivateByEmail("grupovetaranosdetavira@gmail.com", 1); // manter só 1 das 15, o resto é spam
  // Na verdade queremos manter 0 desta lista e só os 2 originais. Mas o original com este email
  // é de 2026-03-30 também. Vamos manter 1 com este email (o primeiro criado)

  // 2. São Pedro de Alva - sousa.fernando76@gmail.com - 14 cópias idênticas
  console.log("\n2. São Pedro de Alva (sousa.fernando76@gmail.com) - 13 cópias spam");
  await deactivateByEmail("sousa.fernando76@gmail.com", 1);

  // 3. SC Penalva do Castelo - toze77@hotmail.com - manter original (2025-11-17), apagar 10 de 2026-03-30
  console.log("\n3. Veteranos SC Penalva do Castelo (toze77@hotmail.com) - 10 cópias spam");
  await deactivateByEmail("toze77@hotmail.com", 1);

  // 4. Tigres de Loulé - v.bento1982@gmail.com - manter original (2025-07-01), apagar cópia
  console.log("\n4. Tigres de Loulé (v.bento1982@gmail.com) - 1 duplicado");
  await deactivateByEmail("v.bento1982@gmail.com", 1);

  // 5. UD Sampedrense - joaonunoromao@gmail.com - manter original (2026-03-16), apagar cópia com distrito errado
  console.log("\n5. UD Sampedrense (joaonunoromao@gmail.com) - 1 duplicado com distrito errado");
  await deactivateByEmail("joaonunoromao@gmail.com", 1);

  // 6. SC Encarnacense - josefernando.rodrigues@gmail.com - 2 do mesmo dia, manter 1
  console.log("\n6. Sporting Clube Encarnacense (josefernando.rodrigues@gmail.com) - 1 duplicado");
  await deactivateByEmail("josefernando.rodrigues@gmail.com", 1);

  // 7. SC Nelas - mesmo telefone 964626134, emails diferentes, manter o mais recente (email melhor)
  //    Original: ricardo.tavares@netvisao.pt (2022-12-08), Novo: scnveteranos@gmail.com (2023-08-01)
  //    Manter o mais recente pois tem email dedicado da equipa
  console.log("\n7. Sport Clube Nelas e Veteranos (tel: 964626134) - manter o mais recente (email melhor)");
  const nelasRows = await db.execute(sql`
    SELECT id, name, coordinator_email, created_at FROM teams
    WHERE is_active = true AND coordinator_phone = '964626134'
    ORDER BY created_at ASC
  `);
  if (nelasRows.rows.length > 1) {
    const oldest = nelasRows.rows[0] as any;
    await db.execute(sql`UPDATE teams SET is_active = false, updated_at = NOW() WHERE id = ${oldest.id}::uuid`);
    console.log(`  DESATIVADO: ${oldest.name} (${oldest.coordinator_email}) criado ${oldest.created_at.toString().substring(0, 10)}`);
    total++;
  }

  // 8. Veteranos de Tavira - o original nelinho.frutas@ tem 2 (2022-12-08) com emails diferentes
  //    Manter 1 original, que fica com o grupoveteranosdetavira já guardado acima
  //    Verificar se há 2 com o tel 969212175 e emails diferentes
  console.log("\n8. Grupo Veteranos de Tavira (nelinho.frutas@gmail.com) - verificar segundo original");
  const taviraOriginals = await db.execute(sql`
    SELECT id, name, coordinator_email, created_at FROM teams
    WHERE is_active = true AND coordinator_phone = '969212175'
    ORDER BY created_at ASC
  `);
  console.log(`  Restam ${taviraOriginals.rows.length} ativas com este telefone:`);
  for (const r of taviraOriginals.rows as any[]) {
    console.log(`  - ${r.name} | ${r.coordinator_email} | ${r.created_at.toString().substring(0, 10)}`);
  }
  // Se restam mais de 2, desativar tudo excepto os 2 originais de 2022
  if (taviraOriginals.rows.length > 2) {
    const toDeactivate = (taviraOriginals.rows as any[]).slice(2);
    for (const r of toDeactivate) {
      await db.execute(sql`UPDATE teams SET is_active = false, updated_at = NOW() WHERE id = ${r.id}::uuid`);
      console.log(`  DESATIVADO: ${r.name} (${r.coordinator_email}) criado ${r.created_at.toString().substring(0, 10)}`);
      total++;
    }
  }

  console.log(`\n=== Total desativados: ${total} ===`);

  // Recalcular flags
  console.log("\nA recalcular flags de duplicados...");
  await db.execute(sql`UPDATE teams SET duplicate_flag = NULL`);

  // Email
  const byEmail = await db.execute(sql`
    SELECT coordinator_email, ARRAY_AGG(id) as ids
    FROM teams WHERE is_active = true AND coordinator_email IS NOT NULL AND coordinator_email != ''
    GROUP BY coordinator_email HAVING COUNT(*) > 1
  `);
  for (const row of byEmail.rows as any[]) {
    for (const id of row.ids) {
      await db.execute(sql`
        UPDATE teams SET duplicate_flag = COALESCE(duplicate_flag || ' | ', '') || ${"Mesmo email: " + row.coordinator_email}
        WHERE id = ${id}::uuid AND (duplicate_flag IS NULL OR duplicate_flag NOT LIKE ${"%" + row.coordinator_email + "%"})
      `);
    }
  }

  // Phone
  const byPhone = await db.execute(sql`
    SELECT coordinator_phone, ARRAY_AGG(id) as ids
    FROM teams WHERE is_active = true AND coordinator_phone IS NOT NULL AND TRIM(coordinator_phone) != '' AND LENGTH(TRIM(coordinator_phone)) > 5
    GROUP BY coordinator_phone HAVING COUNT(*) > 1
  `);
  for (const row of byPhone.rows as any[]) {
    for (const id of row.ids) {
      await db.execute(sql`
        UPDATE teams SET duplicate_flag = COALESCE(duplicate_flag || ' | ', '') || ${"Mesmo tel: " + row.coordinator_phone}
        WHERE id = ${id}::uuid AND (duplicate_flag IS NULL OR duplicate_flag NOT LIKE ${"%" + row.coordinator_phone + "%"})
      `);
    }
  }

  // Name
  const byName = await db.execute(sql`
    SELECT LOWER(TRIM(name)) as norm, ARRAY_AGG(id) as ids
    FROM teams WHERE is_active = true GROUP BY LOWER(TRIM(name)) HAVING COUNT(*) > 1
  `);
  for (const row of byName.rows as any[]) {
    for (const id of row.ids) {
      await db.execute(sql`
        UPDATE teams SET duplicate_flag = COALESCE(duplicate_flag || ' | ', '') || 'Nome duplicado'
        WHERE id = ${id}::uuid AND (duplicate_flag IS NULL OR duplicate_flag NOT LIKE '%Nome duplicado%')
      `);
    }
  }

  // Personal name = coordinator name
  const personalNames = await db.execute(sql`
    SELECT id FROM teams
    WHERE is_active = true AND coordinator_name IS NOT NULL AND TRIM(coordinator_name) != ''
      AND LOWER(TRIM(name)) = LOWER(TRIM(coordinator_name))
  `);
  for (const row of personalNames.rows as any[]) {
    await db.execute(sql`
      UPDATE teams SET duplicate_flag = COALESCE(duplicate_flag || ' | ', '') || 'Nome equipa = nome coordenador'
      WHERE id = ${row.id}::uuid AND (duplicate_flag IS NULL OR duplicate_flag NOT LIKE '%nome coordenador%')
    `);
  }

  const [{ remaining }] = (await db.execute(sql`
    SELECT COUNT(*) as remaining FROM teams WHERE is_active = true AND duplicate_flag IS NOT NULL
  `)).rows as any[];
  console.log(`\nFlags recalculados. Equipas ativas com alertas: ${remaining}`);
}

main().catch(console.error);
