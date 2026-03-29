import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  const dupes = await db.execute(sql`
    SELECT LOWER(TRIM(name)) as norm_name,
           COUNT(*) as cnt,
           ARRAY_AGG(id) as ids,
           ARRAY_AGG(name) as names,
           ARRAY_AGG(location) as locations,
           ARRAY_AGG(coordinator_email) as emails,
           ARRAY_AGG(is_active::text) as active
    FROM teams
    GROUP BY LOWER(TRIM(name))
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
  `);

  console.log("=== EQUIPAS DUPLICADAS ===\n");
  console.log("Total de grupos duplicados:", dupes.rows.length);

  let totalDupes = 0;
  for (const row of dupes.rows as any[]) {
    console.log("\n---");
    console.log(`Nome: ${row.names[0]} (x${row.cnt})`);
    totalDupes += row.cnt - 1;
    for (let i = 0; i < row.cnt; i++) {
      console.log(`  ${i + 1}. ID: ${row.ids[i]}`);
      console.log(`     Nome exato: ${row.names[i]}`);
      console.log(`     Local: ${row.locations[i] || "sem"}`);
      console.log(`     Email: ${row.emails[i]}`);
      console.log(`     Ativa: ${row.active[i]}`);
    }
  }

  console.log(`\n=== Total: ${dupes.rows.length} grupos, ${totalDupes} registos a mais ===`);
}

main().catch(console.error);
