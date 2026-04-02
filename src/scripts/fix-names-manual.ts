import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  const fixes: [string, string][] = [
    ["F.C. Os Beleneneses Mg", "F.C. Os Belenenses MG"],
    ["Grupo Veteranos 20aos 50 Porto Alto", "Grupo Veteranos 20 aos 50 - Porto Alto"],
  ];

  for (const [oldName, newName] of fixes) {
    await db.execute(
      sql`UPDATE teams SET name = ${newName}, updated_at = NOW() WHERE name = ${oldName}`
    );
    console.log(`"${oldName}" -> "${newName}"`);
  }
}

main().catch(console.error);
