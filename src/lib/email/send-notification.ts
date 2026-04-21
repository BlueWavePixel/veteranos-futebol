import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { admins, teams } from "@/lib/db/schema";
import { ne, inArray } from "drizzle-orm";

/** Escape HTML special characters to prevent injection in email templates */
function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return _transporter;
}

export async function notifyAdminsSuggestion(params: {
  authorName: string;
  authorEmail: string;
  subject: string;
  message: string;
  teamName?: string;
}) {
  try {
    // Buscar emails de todos os admins/moderadores
    const allAdmins = await db.select({ email: admins.email }).from(admins);
    const adminEmails = allAdmins.map((a) => a.email);

    if (adminEmails.length === 0) return;

    await getTransporter().sendMail({
      from: `"Veteranos - Clubes de Futebol" <${process.env.GMAIL_USER}>`,
      to: adminEmails.join(", "),
      subject: `Nova sugestão: ${params.subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Nova Sugestão · Veteranos - Clubes de Futebol</h2>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #666;">De:</td>
              <td style="padding: 8px;">${escHtml(params.authorName)} (${escHtml(params.authorEmail)})</td>
            </tr>
            ${params.teamName ? `<tr><td style="padding: 8px; font-weight: bold; color: #666;">Equipa:</td><td style="padding: 8px;">${escHtml(params.teamName)}</td></tr>` : ""}
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #666;">Assunto:</td>
              <td style="padding: 8px;">${escHtml(params.subject)}</td>
            </tr>
          </table>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${escHtml(params.message)}</p>
          </div>
          <p style="color: #666; font-size: 14px;">
            Responda no <a href="${process.env.NEXT_PUBLIC_URL || "https://veteranos-futebol.vercel.app"}/admin/sugestoes">painel de administração</a>.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
}

/** Notifica admins/moderadores quando uma nova equipa fica pendente de aprovação. */
export async function notifyAdminsNewTeamPending(params: {
  teamName: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone?: string | null;
  location?: string | null;
  suspiciousFlags?: string[];
}) {
  try {
    const allAdmins = await db.select({ email: admins.email }).from(admins);
    const adminEmails = allAdmins.map((a) => a.email);
    if (adminEmails.length === 0) return;

    const appUrl =
      (process.env.NEXT_PUBLIC_APP_URL || "https://veteranos-futebol.vercel.app").trim();
    const adminUrl = `${appUrl}/admin?pendentes=1`;

    const suspiciousBadge =
      params.suspiciousFlags && params.suspiciousFlags.length > 0
        ? `<p style="background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;padding:12px;border-radius:8px;font-size:14px;">
             &#9888; <strong>Registo com sinais suspeitos:</strong> ${params.suspiciousFlags.map(escHtml).join(", ")}. Rever com atenção antes de aprovar.
           </p>`
        : "";

    await getTransporter().sendMail({
      from: `"Veteranos - Clubes de Futebol" <${process.env.GMAIL_USER}>`,
      to: adminEmails.join(", "),
      subject: `Nova equipa pendente: ${params.teamName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Nova equipa pendente de aprovação</h2>
          <p>Uma nova equipa foi registada e aguarda aprovação:</p>
          ${suspiciousBadge}
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #666;">Equipa:</td>
              <td style="padding: 8px;">${escHtml(params.teamName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #666;">Coordenador:</td>
              <td style="padding: 8px;">${escHtml(params.coordinatorName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #666;">Email:</td>
              <td style="padding: 8px;">${escHtml(params.coordinatorEmail)}</td>
            </tr>
            ${
              params.coordinatorPhone
                ? `<tr><td style="padding: 8px; font-weight: bold; color: #666;">Telefone:</td><td style="padding: 8px;">${escHtml(params.coordinatorPhone)}</td></tr>`
                : ""
            }
            ${
              params.location
                ? `<tr><td style="padding: 8px; font-weight: bold; color: #666;">Localização:</td><td style="padding: 8px;">${escHtml(params.location)}</td></tr>`
                : ""
            }
          </table>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${adminUrl}" style="display:inline-block; padding:12px 24px; background-color:#16a34a; color:#fff; text-decoration:none; border-radius:8px; font-weight:600;">
              Ver equipas pendentes
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">
            Ao aprovar, um magic link de acesso é enviado automaticamente ao coordenador.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to notify admins of new team:", error);
  }
}

const STATUS_PT: Record<string, string> = {
  pending: "Pendente",
  read: "Lida",
  resolved: "Resolvida",
};

export async function notifyCoordinatorReply(params: {
  coordinatorEmail: string;
  coordinatorName: string;
  subject: string;
  originalMessage: string;
  adminReply: string;
  status: string;
}) {
  try {
    const statusLabel = STATUS_PT[params.status] || params.status;

    await getTransporter().sendMail({
      from: `"Veteranos - Clubes de Futebol" <${process.env.GMAIL_USER}>`,
      to: params.coordinatorEmail,
      subject: `Resposta à sua sugestão: ${params.subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Veteranos - Clubes de Futebol · Resposta à Sugestão</h2>
          <p>Olá ${escHtml(params.coordinatorName)},</p>
          <p>A equipa de moderação respondeu à sua sugestão.</p>

          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #666;">A sua mensagem:</p>
            <p style="margin: 0; white-space: pre-wrap;">${escHtml(params.originalMessage)}</p>
          </div>

          <div style="background: #dcfce7; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #16a34a;">Resposta da moderação:</p>
            <p style="margin: 0; white-space: pre-wrap;">${escHtml(params.adminReply)}</p>
          </div>

          <p style="color: #666; font-size: 14px;">
            Estado: <strong>${statusLabel}</strong>
          </p>
          <p style="color: #666; font-size: 14px;">
            Pode consultar as suas sugestões em
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://veteranos-futebol.vercel.app"}/sugestoes">veteranos-futebol.vercel.app/sugestoes</a>.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to notify coordinator:", error);
  }
}

/**
 * Helper: envia email a todos os admins EXCETO o que executou a ação.
 * Usado em audit trails (aprovação/rejeição/resposta) para evitar trabalho duplicado.
 */
async function notifyOtherAdmins(
  actorEmail: string,
  subject: string,
  html: string,
): Promise<void> {
  try {
    const others = await db
      .select({ email: admins.email })
      .from(admins)
      .where(ne(admins.email, actorEmail));
    const emails = others.map((a) => a.email);
    if (emails.length === 0) return;

    await getTransporter().sendMail({
      from: `"Veteranos - Clubes de Futebol" <${process.env.GMAIL_USER}>`,
      to: emails.join(", "),
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to notify other admins:", error);
  }
}

/** Notifica outros admins que uma equipa foi aprovada por [admin]. */
export async function notifyOtherAdminsTeamApproved(params: {
  actorEmail: string;
  actorName: string;
  actorRole: string;
  teamName: string;
  coordinatorEmail: string;
}) {
  const roleLabel = params.actorRole === "super_admin" ? "Super Admin" : "Moderador";
  await notifyOtherAdmins(
    params.actorEmail,
    `Equipa aprovada: ${params.teamName}`,
    `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #16a34a;">&#10004; Equipa aprovada</h2>
      <p>Apenas para informação — já não precisa de ir ao painel aprovar esta equipa.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #666;">Equipa:</td>
          <td style="padding: 8px;">${escHtml(params.teamName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #666;">Coordenador:</td>
          <td style="padding: 8px;">${escHtml(params.coordinatorEmail)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #666;">Aprovada por:</td>
          <td style="padding: 8px;">${escHtml(params.actorName)} (${roleLabel})</td>
        </tr>
      </table>
      <p style="color: #888; font-size: 13px;">O coordenador já recebeu o link de acesso à plataforma.</p>
    </div>
    `,
  );
}

/** Notifica outros admins que uma equipa foi rejeitada por [admin]. */
export async function notifyOtherAdminsTeamRejected(params: {
  actorEmail: string;
  actorName: string;
  actorRole: string;
  teamNames: string[];
}) {
  const roleLabel = params.actorRole === "super_admin" ? "Super Admin" : "Moderador";
  const count = params.teamNames.length;
  const listHtml = params.teamNames.map((n) => `<li>${escHtml(n)}</li>`).join("");
  await notifyOtherAdmins(
    params.actorEmail,
    count === 1
      ? `Equipa rejeitada: ${params.teamNames[0]}`
      : `${count} equipas rejeitadas`,
    `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #dc2626;">&#10006; ${count === 1 ? "Equipa rejeitada" : `${count} equipas rejeitadas`}</h2>
      <p>Apenas para informação — já não precisa de ir ao painel tratar ${count === 1 ? "desta equipa" : "destas equipas"}.</p>
      <ul style="padding-left: 20px;">${listHtml}</ul>
      <p style="padding: 8px 0;">
        <strong>Rejeitada${count === 1 ? "" : "s"} por:</strong>
        ${escHtml(params.actorName)} (${roleLabel})
      </p>
    </div>
    `,
  );
}

const REASON_LABELS: Record<string, string> = {
  email: "Mesmo email",
  phone: "Mesmo telefone",
  phone_normalized: "Telefone equivalente",
  name_exact: "Mesmo nome",
  name_fuzzy: "Nome muito parecido",
  name_equals_coordinator: "Nome igual ao do coordenador",
};

/**
 * Notifica admins quando o cron bi-semanal deteta novos pares de duplicados pendentes.
 * Só é disparado a partir da rota do cron, nunca das server actions do admin
 * (nestas, o admin já está no painel e não precisa de email).
 */
export async function notifyAdminsNewDuplicates(params: {
  newlyDetected: Array<{ teamAId: string; teamBId: string; reason: string }>;
  totalPending: number;
}) {
  try {
    if (params.newlyDetected.length === 0) return;

    const allAdmins = await db.select({ email: admins.email }).from(admins);
    const adminEmails = allAdmins.map((a) => a.email);
    if (adminEmails.length === 0) return;

    const teamIds = new Set<string>();
    for (const pair of params.newlyDetected) {
      teamIds.add(pair.teamAId);
      teamIds.add(pair.teamBId);
    }

    const teamRows = await db
      .select({ id: teams.id, name: teams.name })
      .from(teams)
      .where(inArray(teams.id, Array.from(teamIds)));
    const nameById = new Map(teamRows.map((t) => [t.id, t.name]));

    const PREVIEW_LIMIT = 10;
    const previewPairs = params.newlyDetected.slice(0, PREVIEW_LIMIT);
    const rowsHtml = previewPairs
      .map((pair) => {
        const nameA = nameById.get(pair.teamAId) ?? "(equipa removida)";
        const nameB =
          pair.teamAId === pair.teamBId
            ? "(auto-verificação)"
            : (nameById.get(pair.teamBId) ?? "(equipa removida)");
        const reasonLabel = REASON_LABELS[pair.reason] ?? pair.reason;
        return `
          <tr>
            <td style="padding:8px; border-bottom:1px solid #e5e7eb;">${escHtml(nameA)}</td>
            <td style="padding:8px; border-bottom:1px solid #e5e7eb;">${escHtml(nameB)}</td>
            <td style="padding:8px; border-bottom:1px solid #e5e7eb; color:#666; font-size:13px;">${escHtml(reasonLabel)}</td>
          </tr>`;
      })
      .join("");

    const extraCount = params.newlyDetected.length - previewPairs.length;
    const moreLine =
      extraCount > 0
        ? `<p style="color:#666; font-size:13px; margin-top:8px;">E mais ${extraCount} ${extraCount === 1 ? "par" : "pares"}. Ver todos no painel.</p>`
        : "";

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL || "https://veteranos-futebol.vercel.app"
    ).trim();
    const adminUrl = `${appUrl}/admin/duplicados`;

    const newCount = params.newlyDetected.length;
    await getTransporter().sendMail({
      from: `"Veteranos - Clubes de Futebol" <${process.env.GMAIL_USER}>`,
      to: adminEmails.join(", "),
      subject:
        newCount === 1
          ? "Novo possível duplicado detetado"
          : `${newCount} novos possíveis duplicados detetados`,
      html: `
        <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Verificação automática de duplicados</h2>
          <p>
            A rotina agendada detetou
            <strong>${newCount} ${newCount === 1 ? "novo par" : "novos pares"}</strong>
            de possíveis duplicados desde a última verificação.
          </p>
          <p style="color:#666; font-size:14px;">
            Total de pares pendentes no painel: <strong>${params.totalPending}</strong>.
          </p>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0; font-size:14px;">
            <thead>
              <tr style="background:#f4f4f5;">
                <th style="padding:8px; text-align:left;">Equipa A</th>
                <th style="padding:8px; text-align:left;">Equipa B</th>
                <th style="padding:8px; text-align:left;">Motivo</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          ${moreLine}
          <div style="text-align: center; margin: 28px 0;">
            <a href="${adminUrl}" style="display:inline-block; padding:12px 24px; background-color:#16a34a; color:#fff; text-decoration:none; border-radius:8px; font-weight:600;">
              Rever duplicados
            </a>
          </div>
          <p style="color:#888; font-size:12px;">
            Este email é enviado automaticamente pela rotina diária de verificação.
            Só chega ao inbox quando há pares novos a tratar face ao dia anterior.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to notify admins of new duplicates:", error);
  }
}

/** Notifica outros admins que uma sugestão foi tratada por [admin]. */
export async function notifyOtherAdminsSuggestionHandled(params: {
  actorEmail: string;
  actorName: string;
  actorRole: string;
  suggestionSubject: string;
  suggestionAuthor: string;
  newStatus: string;
  hasReply: boolean;
}) {
  const roleLabel = params.actorRole === "super_admin" ? "Super Admin" : "Moderador";
  const STATUS_LABELS: Record<string, string> = {
    pending: "Pendente",
    read: "Lida",
    resolved: "Resolvida",
  };
  const statusLabel = STATUS_LABELS[params.newStatus] || params.newStatus;
  await notifyOtherAdmins(
    params.actorEmail,
    `Sugestão tratada: ${params.suggestionSubject}`,
    `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #16a34a;">&#10004; Sugestão tratada</h2>
      <p>Apenas para informação — já não precisa de ir ao painel responder a esta sugestão.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #666;">Assunto:</td>
          <td style="padding: 8px;">${escHtml(params.suggestionSubject)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #666;">De:</td>
          <td style="padding: 8px;">${escHtml(params.suggestionAuthor)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #666;">Novo estado:</td>
          <td style="padding: 8px;">${statusLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #666;">Tratada por:</td>
          <td style="padding: 8px;">${escHtml(params.actorName)} (${roleLabel})</td>
        </tr>
        ${
          params.hasReply
            ? `<tr><td style="padding: 8px; font-weight: bold; color: #666;">Resposta:</td><td style="padding: 8px; color: #16a34a;">Enviada ao coordenador</td></tr>`
            : ""
        }
      </table>
    </div>
    `,
  );
}
