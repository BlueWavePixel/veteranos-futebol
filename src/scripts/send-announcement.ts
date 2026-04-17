/**
 * Script de envio de email de apresentação da plataforma.
 *
 * USO:
 *   DRY RUN (ver o que seria enviado, sem enviar):
 *     npx tsx src/scripts/send-announcement.ts --dry-run
 *
 *   ENVIAR DE FACTO (lotes de 40, 3s entre cada):
 *     npx tsx src/scripts/send-announcement.ts
 *
 *   ENVIAR APENAS A UM EMAIL (teste):
 *     npx tsx src/scripts/send-announcement.ts --test email@exemplo.com
 *
 * O script regista quem já recebeu em src/scripts/announcement-sent.json
 * para não enviar duplicados se for re-executado.
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";
import { sendAnnouncementEmail } from "../lib/email/send-announcement";
import * as fs from "fs";
import * as path from "path";

const BATCH_SIZE = 40;
const DELAY_BETWEEN_EMAILS_MS = 3000; // 3 seconds
const DELAY_BETWEEN_BATCHES_MS = 60000; // 1 minute
const SENT_LOG_PATH = path.join(__dirname, "announcement-sent.json");

function loadSentLog(): Set<string> {
  try {
    const data = fs.readFileSync(SENT_LOG_PATH, "utf-8");
    return new Set(JSON.parse(data));
  } catch {
    return new Set();
  }
}

function saveSentLog(sent: Set<string>) {
  fs.writeFileSync(SENT_LOG_PATH, JSON.stringify([...sent], null, 2));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const testIdx = args.indexOf("--test");
  const testEmail = testIdx >= 0 ? args[testIdx + 1] : null;

  const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

  if (testEmail) {
    console.log(`\n--- MODO TESTE: enviar apenas para ${testEmail} ---\n`);
    const [team] = await db
      .select({ name: schema.teams.name, slug: schema.teams.slug, email: schema.teams.coordinatorEmail })
      .from(schema.teams)
      .where(eq(schema.teams.coordinatorEmail, testEmail));

    if (!team) {
      console.log(`Email ${testEmail} não encontrado na BD.`);
      // Enviar com dados genéricos para teste visual
      console.log("A enviar com dados genéricos para teste visual...");
      const ok = await sendAnnouncementEmail(testEmail, "Equipa de Teste", "equipa-teste");
      console.log(ok ? "Enviado com sucesso!" : "Falhou o envio.");
      return;
    }

    console.log(`Equipa: ${team.name} (${team.slug})`);
    const ok = await sendAnnouncementEmail(testEmail, team.name, team.slug);
    console.log(ok ? "Enviado com sucesso!" : "Falhou o envio.");
    return;
  }

  // Buscar todas as equipas ativas e aprovadas
  const teams = await db
    .select({
      email: schema.teams.coordinatorEmail,
      name: schema.teams.name,
      slug: schema.teams.slug,
    })
    .from(schema.teams)
    .where(eq(schema.teams.isActive, true));

  // Deduplicar por email
  const uniqueTeams = new Map<string, { name: string; slug: string }>();
  for (const t of teams) {
    if (!uniqueTeams.has(t.email)) {
      uniqueTeams.set(t.email, { name: t.name, slug: t.slug });
    }
  }

  const sentLog = loadSentLog();
  const toSend = [...uniqueTeams.entries()].filter(([email]) => !sentLog.has(email));

  console.log(`\nTotal equipas ativas: ${teams.length}`);
  console.log(`Emails únicos: ${uniqueTeams.size}`);
  console.log(`Já enviados: ${sentLog.size}`);
  console.log(`A enviar: ${toSend.length}`);
  console.log(`Lotes de ${BATCH_SIZE}, ${DELAY_BETWEEN_EMAILS_MS / 1000}s entre emails\n`);

  if (isDryRun) {
    console.log("--- DRY RUN: nenhum email será enviado ---\n");
    for (const [email, { name }] of toSend) {
      console.log(`  [DRY] ${email} — ${name}`);
    }
    console.log(`\nTotal: ${toSend.length} emails seriam enviados.`);
    return;
  }

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < toSend.length; i++) {
    const [email, { name, slug }] = toSend[i];

    const ok = await sendAnnouncementEmail(email, name, slug);
    if (ok) {
      sent++;
      sentLog.add(email);
      saveSentLog(sentLog);
      console.log(`[${sent + failed}/${toSend.length}] OK: ${email} (${name})`);
    } else {
      failed++;
      console.log(`[${sent + failed}/${toSend.length}] FALHOU: ${email} (${name})`);
    }

    // Delay between emails
    if (i < toSend.length - 1) {
      await sleep(DELAY_BETWEEN_EMAILS_MS);
    }

    // Delay between batches
    if ((i + 1) % BATCH_SIZE === 0 && i < toSend.length - 1) {
      const remaining = toSend.length - i - 1;
      console.log(`\n--- Pausa entre lotes. ${remaining} restantes. Aguardando ${DELAY_BETWEEN_BATCHES_MS / 1000}s... ---\n`);
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  console.log(`\n--- Concluído ---`);
  console.log(`Enviados: ${sent}`);
  console.log(`Falhados: ${failed}`);
  console.log(`Total processados: ${sent + failed}`);
}

main().catch(console.error).finally(() => process.exit(0));
