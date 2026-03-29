import "dotenv/config";
import * as XLSX from "xlsx";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

function excelDateToJS(serial: number): Date {
  // Excel serial date: days since 1899-12-30
  const epoch = new Date(1899, 11, 30);
  return new Date(epoch.getTime() + serial * 86400000);
}

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  // Ler ambos os ficheiros
  const files = [
    "/home/pestanislau/Mixed-Projects/Docs_general/Contactos dos Clubes Veteranos (Respostas).xlsx",
    "/home/pestanislau/Mixed-Projects/Docs_general/Contactos dos Clubes Veteranos (Respostas) (1).xlsx",
  ];

  const records: { email: string; name: string; date: Date }[] = [];

  for (const file of files) {
    const wb = XLSX.readFile(file);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const dateSerial = row[0];
      const email = ((row[1] as string) || "").toLowerCase().trim();
      const name = ((row[3] as string) || "").trim();

      if (!name || !dateSerial) continue;

      const date = excelDateToJS(dateSerial);
      records.push({ email, name, date });
    }

    console.log(`${file.split("/").pop()}: ${rows.length - 1} registos`);
  }

  console.log(`\nTotal registos nos Excel: ${records.length}\n`);

  let updated = 0;
  let notFound = 0;

  for (const rec of records) {
    // Tentar match por email primeiro, depois por nome
    let result;
    if (rec.email) {
      result = await db.execute(sql`
        UPDATE teams
        SET created_at = ${rec.date}, updated_at = ${rec.date}
        WHERE LOWER(coordinator_email) = ${rec.email}
        AND created_at > '2026-01-01'
        RETURNING name
      `);
    }

    if (!result || result.rows.length === 0) {
      result = await db.execute(sql`
        UPDATE teams
        SET created_at = ${rec.date}, updated_at = ${rec.date}
        WHERE LOWER(TRIM(name)) = ${rec.name.toLowerCase()}
        AND created_at > '2026-01-01'
        RETURNING name
      `);
    }

    if (result.rows.length > 0) {
      const dateStr = rec.date.toLocaleDateString("pt-PT");
      console.log(`✓ ${result.rows[0].name} → ${dateStr}`);
      updated += result.rows.length;
    } else {
      notFound++;
    }
  }

  console.log(`\n--- Resumo ---`);
  console.log(`Atualizados: ${updated}`);
  console.log(`Não encontrados: ${notFound}`);
}

main().catch(console.error);
