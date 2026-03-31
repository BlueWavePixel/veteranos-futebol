import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

// Title Case com exceções portuguesas
function toTitleCase(str: string): string {
  const lowerWords = new Set([
    "de", "da", "do", "das", "dos", "e", "a", "o", "em", "no", "na",
    "nos", "nas", "por", "para", "com", "sem",
  ]);
  const upperWords = new Set([
    "fc", "sc", "cd", "gd", "gdr", "cdr", "ud", "ad", "cr", "cf",
    "acd", "acdr", "adr", "ccd", "ccdr", "crc", "gdcr", "grc",
    "slb", "scp", "fcp", "udr", "srbu", "avgdc", "adqc",
    "acr", "arc", "caov", "nv", "ii", "iii", "iv",
  ]);

  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((word, i) => {
      const lower = word.toLowerCase();
      const noPunct = lower.replace(/[^a-záéíóúàâêôãõçü]/gi, "");

      if (upperWords.has(noPunct)) return word.toUpperCase();
      if (i > 0 && lowerWords.has(lower)) return lower;

      // Handle parentheses: (veteranos) -> (Veteranos)
      if (word.startsWith("(")) {
        return "(" + word.charAt(1).toUpperCase() + word.slice(2).toLowerCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  const result = await db.execute(sql`SELECT * FROM teams WHERE is_active = true`);
  const teams = result.rows as any[];

  let trimmed = 0;
  let doubleSpaces = 0;
  let titleCased = 0;
  let altPhoneCleaned = 0;
  let altNameCleaned = 0;
  let emailFixed = 0;
  let coordNameFixed = 0;
  let fieldNameFixed = 0;

  for (const t of teams) {
    const updates: string[] = [];
    const sets: Record<string, any> = {};

    // === TRIM espaços em todos os campos de texto ===
    const textFields = [
      "name", "coordinator_name", "coordinator_alt_name",
      "coordinator_phone", "coordinator_alt_phone",
      "field_name", "field_address", "localidade", "concelho",
      "notes", "social_facebook", "social_instagram",
    ];
    for (const f of textFields) {
      if (t[f] && t[f] !== t[f].trim()) {
        sets[f] = t[f].trim();
        updates.push(`trim ${f}`);
        trimmed++;
      }
    }

    // === Espaços duplos ===
    const doubleSpaceFields = ["name", "coordinator_name", "field_name"];
    for (const f of doubleSpaceFields) {
      const val = sets[f] || t[f];
      if (val && /\s{2,}/.test(val)) {
        sets[f] = val.replace(/\s{2,}/g, " ");
        updates.push(`double-space ${f}`);
        doubleSpaces++;
      }
    }

    // === Nomes em MAIÚSCULAS -> Title Case ===
    const nameVal = sets["name"] || t.name;
    if (nameVal && nameVal === nameVal.toUpperCase() && nameVal.length > 5) {
      sets["name"] = toTitleCase(nameVal);
      updates.push(`title-case name: "${nameVal}" -> "${sets["name"]}"`);
      titleCased++;
    }

    // === Nome em minúsculas -> Title Case ===
    if (nameVal && nameVal === nameVal.toLowerCase() && nameVal.length > 3) {
      sets["name"] = toTitleCase(nameVal);
      updates.push(`title-case name: "${nameVal}" -> "${sets["name"]}"`);
      titleCased++;
    }

    // === Coordinator name em MAIÚSCULAS -> Title Case ===
    const coordVal = sets["coordinator_name"] || t.coordinator_name;
    if (coordVal && coordVal === coordVal.toUpperCase() && coordVal.length > 5) {
      sets["coordinator_name"] = toTitleCase(coordVal);
      updates.push(`title-case coord: "${coordVal}" -> "${sets["coordinator_name"]}"`);
      coordNameFixed++;
    }

    // === Telefone alternativo igual ao principal -> limpar ===
    if (t.coordinator_phone && t.coordinator_alt_phone) {
      const p1 = t.coordinator_phone.replace(/\D/g, "");
      const p2 = t.coordinator_alt_phone.replace(/\D/g, "");
      if (p1 === p2) {
        sets["coordinator_alt_phone"] = null;
        updates.push(`alt phone = principal, limpo`);
        altPhoneCleaned++;
      }
    }

    // === Nome alternativo igual ao principal -> limpar ===
    if (t.coordinator_alt_name && t.coordinator_name) {
      if (t.coordinator_alt_name.toLowerCase().trim() === t.coordinator_name.toLowerCase().trim()) {
        sets["coordinator_alt_name"] = null;
        updates.push(`alt name = principal, limpo`);
        altNameCleaned++;
      }
    }

    // === Email com múltiplos emails -> manter primeiro, resto para notes ===
    if (t.coordinator_email && (t.coordinator_email.includes("|") || t.coordinator_email.includes(";"))) {
      const parts = t.coordinator_email.split(/[|;]/).map((e: string) => e.trim()).filter(Boolean);
      if (parts.length > 1) {
        sets["coordinator_email"] = parts[0].toLowerCase();
        const extraEmails = parts.slice(1).join(", ");
        const currentNotes = sets["notes"] || t.notes || "";
        sets["notes"] = currentNotes
          ? `${currentNotes}\nEmail adicional: ${extraEmails}`
          : `Email adicional: ${extraEmails}`;
        updates.push(`email split: "${t.coordinator_email}" -> "${sets["coordinator_email"]}" + notes`);
        emailFixed++;
      }
    }

    // === Apply updates ===
    if (updates.length > 0) {
      // Build SQL SET clause dynamically
      const setClauses: string[] = [];
      const snakeCase: Record<string, string> = {
        name: "name",
        coordinator_name: "coordinator_name",
        coordinator_alt_name: "coordinator_alt_name",
        coordinator_phone: "coordinator_phone",
        coordinator_alt_phone: "coordinator_alt_phone",
        coordinator_email: "coordinator_email",
        field_name: "field_name",
        field_address: "field_address",
        localidade: "localidade",
        concelho: "concelho",
        notes: "notes",
        social_facebook: "social_facebook",
        social_instagram: "social_instagram",
      };

      for (const [key, val] of Object.entries(sets)) {
        const col = snakeCase[key] || key;
        if (val === null) {
          setClauses.push(`${col} = NULL`);
        } else {
          setClauses.push(`${col} = '${val.replace(/'/g, "''")}'`);
        }
      }
      setClauses.push("updated_at = NOW()");

      const query = `UPDATE teams SET ${setClauses.join(", ")} WHERE id = '${t.id}'`;
      await db.execute(sql.raw(query));

      console.log(`${t.name}`);
      for (const u of updates) {
        console.log(`  -> ${u}`);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("RESUMO DAS CORREÇÕES");
  console.log("=".repeat(60));
  console.log(`  Espaços trim:           ${trimmed}`);
  console.log(`  Espaços duplos:         ${doubleSpaces}`);
  console.log(`  Title Case (nomes):     ${titleCased}`);
  console.log(`  Title Case (coord):     ${coordNameFixed}`);
  console.log(`  Tel alt limpo:          ${altPhoneCleaned}`);
  console.log(`  Nome alt limpo:         ${altNameCleaned}`);
  console.log(`  Email separado:         ${emailFixed}`);
}

main().catch(console.error);
