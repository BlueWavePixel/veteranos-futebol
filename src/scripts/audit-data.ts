import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  const result = await db.execute(sql`
    SELECT * FROM teams WHERE is_active = true ORDER BY name
  `);
  const teams = result.rows as any[];
  console.log(`Total equipas ativas: ${teams.length}\n`);

  const issues: { team: string; id: string; field: string; value: string; issue: string }[] = [];

  function flag(team: any, field: string, value: string, issue: string) {
    issues.push({ team: team.name, id: team.id, field, value, issue });
  }

  for (const t of teams) {
    // === NOME DA EQUIPA ===
    if (t.name !== t.name.trim()) flag(t, "name", t.name, "Espaços extra no início/fim");
    if (/\s{2,}/.test(t.name)) flag(t, "name", t.name, "Espaços duplos no nome");
    if (t.name === t.name.toUpperCase() && t.name.length > 5) flag(t, "name", t.name, "Nome todo em MAIÚSCULAS");
    if (t.name === t.name.toLowerCase()) flag(t, "name", t.name, "Nome todo em minúsculas");
    if (/^\s*$/.test(t.name)) flag(t, "name", t.name, "Nome vazio");

    // === NOME DO COORDENADOR ===
    if (t.coordinator_name) {
      if (t.coordinator_name !== t.coordinator_name.trim()) flag(t, "coordinator_name", t.coordinator_name, "Espaços extra");
      if (/\s{2,}/.test(t.coordinator_name)) flag(t, "coordinator_name", t.coordinator_name, "Espaços duplos");
      if (t.coordinator_name === t.coordinator_name.toUpperCase() && t.coordinator_name.length > 5) flag(t, "coordinator_name", t.coordinator_name, "Nome todo em MAIÚSCULAS");
      // Two names in coordinator_name that look like "Name1 / Name2" or "Name1 e Name2"
      if (/\s+[/\\|]\s+/.test(t.coordinator_name)) flag(t, "coordinator_name", t.coordinator_name, "Possível dois nomes separados por /");
      // Check if alt name is stuffed into main name
      if (t.coordinator_name.includes(" e ") && t.coordinator_name.split(" e ").every((p: string) => p.trim().split(" ").length >= 2)) {
        flag(t, "coordinator_name", t.coordinator_name, "Possível dois nomes no mesmo campo (separados por 'e')");
      }
    }

    // === NOME ALTERNATIVO ===
    if (t.coordinator_alt_name) {
      if (t.coordinator_alt_name === t.coordinator_name) flag(t, "coordinator_alt_name", t.coordinator_alt_name, "Igual ao nome principal");
    }

    // === EMAIL ===
    if (t.coordinator_email) {
      if (t.coordinator_email !== t.coordinator_email.trim()) flag(t, "coordinator_email", t.coordinator_email, "Espaços extra");
      if (t.coordinator_email !== t.coordinator_email.toLowerCase()) flag(t, "coordinator_email", t.coordinator_email, "Email com maiúsculas");
      if (!t.coordinator_email.includes("@")) flag(t, "coordinator_email", t.coordinator_email, "Email sem @");
      if (/\s/.test(t.coordinator_email.trim())) flag(t, "coordinator_email", t.coordinator_email, "Email com espaços");
      // Multiple emails
      if (t.coordinator_email.includes(",") || t.coordinator_email.includes(";") || t.coordinator_email.includes(" ")) {
        if (t.coordinator_email.includes("@") && (t.coordinator_email.split("@").length > 2)) {
          flag(t, "coordinator_email", t.coordinator_email, "Possível múltiplos emails no mesmo campo");
        }
      }
    }

    // === TELEFONE ===
    const phones = [
      { field: "coordinator_phone", val: t.coordinator_phone },
      { field: "coordinator_alt_phone", val: t.coordinator_alt_phone },
    ];
    for (const { field, val } of phones) {
      if (!val) continue;
      const cleaned = val.replace(/[\s\-().+]/g, "");
      if (cleaned.length < 9 && cleaned.length > 0) flag(t, field, val, `Telefone demasiado curto (${cleaned.length} dígitos)`);
      if (cleaned.length > 15) flag(t, field, val, `Telefone demasiado longo (${cleaned.length} dígitos)`);
      // Multiple phones in one field
      if (/\d{9}.*\d{9}/.test(cleaned)) flag(t, field, val, "Possível dois telefones no mesmo campo");
      if (val.includes("/") || val.includes(";") || val.includes(",")) flag(t, field, val, "Possível múltiplos telefones (separador encontrado)");
      // Non-numeric characters (except +, spaces, dashes, parens)
      if (/[a-zA-Z]/.test(val)) flag(t, field, val, "Telefone contém letras");
    }
    // Same phone in both fields
    if (t.coordinator_phone && t.coordinator_alt_phone) {
      const p1 = t.coordinator_phone.replace(/\D/g, "");
      const p2 = t.coordinator_alt_phone.replace(/\D/g, "");
      if (p1 === p2) flag(t, "coordinator_alt_phone", t.coordinator_alt_phone, "Telefone alternativo igual ao principal");
    }

    // === LOCALIZAÇÃO ===
    if (!t.distrito) flag(t, "distrito", "-", "Distrito em falta");
    if (!t.concelho) flag(t, "concelho", "-", "Concelho em falta");
    if (t.location && t.location.includes("null")) flag(t, "location", t.location, "Location contém 'null'");
    if (t.location === " / " || t.location === "/") flag(t, "location", t.location, "Location vazio (só separador)");

    // === COORDENADAS ===
    if (!t.latitude || !t.longitude) flag(t, "coordenadas", "-", "Sem coordenadas (não aparece no mapa)");
    if (t.latitude && t.longitude) {
      const lat = parseFloat(t.latitude);
      const lng = parseFloat(t.longitude);
      // Portugal continental: lat 36.9-42.2, lng -9.5 to -6.1
      // Madeira: lat 32.6-33.1, lng -17.3 to -16.2
      // Açores: lat 36.9-39.7, lng -31.3 to -25.0
      // Espanha/Internacional: broader range
      if (lat < 30 || lat > 50 || lng < -32 || lng > 5) {
        flag(t, "coordenadas", `${lat}, ${lng}`, "Coordenadas fora da Península Ibérica/Ilhas");
      }
    }

    // === CAMPO ===
    if (t.field_name && t.field_name !== t.field_name.trim()) flag(t, "field_name", t.field_name, "Espaços extra");
    if (t.field_name && /\s{2,}/.test(t.field_name)) flag(t, "field_name", t.field_name, "Espaços duplos");

    // === ANO FUNDAÇÃO ===
    if (t.founded_year) {
      if (t.founded_year < 1850 || t.founded_year > 2026) flag(t, "founded_year", String(t.founded_year), "Ano de fundação improvável");
    }

    // === Nº JOGADORES ===
    if (t.player_count) {
      if (t.player_count < 5) flag(t, "player_count", String(t.player_count), "Poucos jogadores (< 5)");
      if (t.player_count > 100) flag(t, "player_count", String(t.player_count), "Muitos jogadores (> 100)");
    }

    // === ESCALÃO ===
    if (!t.age_group) flag(t, "age_group", "-", "Escalão etário em falta");

    // === MAPS URL ===
    if (t.maps_url && !t.maps_url.startsWith("http")) {
      flag(t, "maps_url", t.maps_url.substring(0, 60), "URL do Maps não começa com http");
    }

    // === REDES SOCIAIS ===
    if (t.social_facebook && !t.social_facebook.startsWith("http") && !t.social_facebook.startsWith("www") && !t.social_facebook.startsWith("facebook")) {
      flag(t, "social_facebook", t.social_facebook, "Facebook não parece ser um link válido");
    }
    if (t.social_instagram && !t.social_instagram.startsWith("http") && !t.social_instagram.startsWith("www") && !t.social_instagram.startsWith("instagram") && !t.social_instagram.startsWith("@")) {
      flag(t, "social_instagram", t.social_instagram, "Instagram não parece ser um link válido");
    }

    // === RGPD ===
    if (!t.rgpd_consent) flag(t, "rgpd_consent", "false", "RGPD não aceite");
  }

  // === OUTPUT POR CATEGORIA ===
  const categories = new Map<string, typeof issues>();
  for (const i of issues) {
    const key = i.issue;
    if (!categories.has(key)) categories.set(key, []);
    categories.get(key)!.push(i);
  }

  // Sort by count descending
  const sorted = [...categories.entries()].sort((a, b) => b[1].length - a[1].length);

  console.log("=".repeat(80));
  console.log("AUDITORIA DE DADOS - RESUMO");
  console.log("=".repeat(80));
  console.log(`\nTotal de problemas encontrados: ${issues.length}\n`);

  for (const [issue, items] of sorted) {
    console.log(`\n--- ${issue} (${items.length}) ---`);
    for (const i of items.slice(0, 20)) {
      console.log(`  ${i.team} | ${i.field}: "${i.value}"`);
    }
    if (items.length > 20) console.log(`  ... e mais ${items.length - 20}`);
  }

  // Summary table
  console.log("\n" + "=".repeat(80));
  console.log("RESUMO POR TIPO DE PROBLEMA");
  console.log("=".repeat(80));
  for (const [issue, items] of sorted) {
    console.log(`  ${String(items.length).padStart(4)} | ${issue}`);
  }
  console.log(`  ${String(issues.length).padStart(4)} | TOTAL`);
}

main().catch(console.error);
