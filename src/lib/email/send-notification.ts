import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";

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
      from: `"Veteranos Futebol" <${process.env.GMAIL_USER}>`,
      to: adminEmails.join(", "),
      subject: `Nova sugestão: ${params.subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Nova Sugestão — Veteranos Futebol</h2>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #666;">De:</td>
              <td style="padding: 8px;">${params.authorName} (${params.authorEmail})</td>
            </tr>
            ${params.teamName ? `<tr><td style="padding: 8px; font-weight: bold; color: #666;">Equipa:</td><td style="padding: 8px;">${params.teamName}</td></tr>` : ""}
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #666;">Assunto:</td>
              <td style="padding: 8px;">${params.subject}</td>
            </tr>
          </table>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${params.message}</p>
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
