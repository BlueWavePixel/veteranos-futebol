import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));
  let total = 0;

  async function processGroup(rows: any[]) {
    const withRgpd = rows.filter((t) => t.rgpd_consent === true);
    const withoutRgpd = rows.filter((t) => !t.rgpd_consent);
    if (withRgpd.length > 0 && withoutRgpd.length > 0) {
      for (const t of withoutRgpd) {
        await db.execute(
          sql`UPDATE teams SET is_active = false, updated_at = NOW() WHERE id = ${t.id}::uuid`
        );
        console.log(
          `DESATIVADO: ${t.name} (${t.coordinator_email}) - sem RGPD`
        );
        total++;
      }
    }
  }

  // By email
  const byEmail = await db.execute(sql`
    SELECT id, name, coordinator_email, coordinator_phone, rgpd_consent, created_at
    FROM teams WHERE is_active = true AND coordinator_email IN (
      SELECT coordinator_email FROM teams
      WHERE is_active = true AND coordinator_email IS NOT NULL AND coordinator_email != ''
      GROUP BY coordinator_email HAVING COUNT(*) > 1
    ) ORDER BY coordinator_email, created_at
  `);

  const emailGroups = new Map<string, any[]>();
  for (const r of byEmail.rows as any[]) {
    const key = r.coordinator_email.toLowerCase();
    if (!emailGroups.has(key)) emailGroups.set(key, []);
    emailGroups.get(key)!.push(r);
  }
  for (const [, rows] of emailGroups) {
    await processGroup(rows);
  }

  // By phone (excluding already processed by email)
  const byPhone = await db.execute(sql`
    SELECT id, name, coordinator_email, coordinator_phone, rgpd_consent, created_at
    FROM teams WHERE is_active = true AND coordinator_phone IN (
      SELECT coordinator_phone FROM teams
      WHERE is_active = true AND coordinator_phone IS NOT NULL AND TRIM(coordinator_phone) != '' AND LENGTH(TRIM(coordinator_phone)) > 5
      GROUP BY coordinator_phone HAVING COUNT(*) > 1
    ) ORDER BY coordinator_phone, created_at
  `);

  const phoneGroups = new Map<string, any[]>();
  for (const r of byPhone.rows as any[]) {
    const key = (r.coordinator_phone || "").trim();
    if (!phoneGroups.has(key)) phoneGroups.set(key, []);
    phoneGroups.get(key)!.push(r);
  }
  for (const [, rows] of phoneGroups) {
    const emails = [
      ...new Set(
        rows.map((t: any) => (t.coordinator_email || "").toLowerCase())
      ),
    ];
    if (emails.length === 1) continue; // already in email group
    await processGroup(rows);
  }

  console.log(`\nTotal desativados: ${total}`);
}

main().catch(console.error);
