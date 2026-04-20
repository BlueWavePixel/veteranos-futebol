import nodemailer from "nodemailer";
import type { Locale } from "@/lib/i18n/translations";

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

const emailStrings: Record<
  Locale,
  { subject: string; intro: string; button: string; expiry: string; ignore: string }
> = {
  pt: {
    subject: "Aceda à sua equipa · Veteranos - Clubes de Futebol",
    intro: "Clique no link abaixo para aceder à sua equipa:",
    button: "Aceder à Minha Equipa",
    expiry: "Este link expira em 30 minutos.",
    ignore: "Se não solicitou este acesso, ignore este email.",
  },
  br: {
    subject: "Acesse sua equipe · Veteranos - Clubes de Futebol",
    intro: "Clique no link abaixo para acessar sua equipe:",
    button: "Acessar Minha Equipe",
    expiry: "Este link expira em 30 minutos.",
    ignore: "Se não solicitou este acesso, ignore este email.",
  },
  es: {
    subject: "Acceda a su equipo · Veteranos - Clubes de Fútbol",
    intro: "Haga clic en el enlace de abajo para acceder a su equipo:",
    button: "Acceder a Mi Equipo",
    expiry: "Este enlace expira en 30 minutos.",
    ignore: "Si no solicitó este acceso, ignore este email.",
  },
  en: {
    subject: "Access your team · Veteranos - Football Clubs",
    intro: "Click the link below to access your team:",
    button: "Access My Team",
    expiry: "This link expires in 30 minutes.",
    ignore: "If you didn't request this access, please ignore this email.",
  },
};

export async function sendMagicLinkEmail(
  email: string,
  magicLink: string,
  locale: Locale = "pt",
  expiryMinutes: number = 30,
): Promise<boolean> {
  const txt = emailStrings[locale];
  // Override expiry text based on duration
  let expiryText = txt.expiry;
  if (expiryMinutes >= 60 * 24) {
    const days = Math.round(expiryMinutes / (60 * 24));
    const labels: Record<Locale, string> = {
      pt: `Este link expira em ${days} dias.`,
      br: `Este link expira em ${days} dias.`,
      es: `Este enlace expira en ${days} días.`,
      en: `This link expires in ${days} days.`,
    };
    expiryText = labels[locale];
  } else if (expiryMinutes !== 30) {
    const labels: Record<Locale, string> = {
      pt: `Este link expira em ${expiryMinutes} minutos.`,
      br: `Este link expira em ${expiryMinutes} minutos.`,
      es: `Este enlace expira en ${expiryMinutes} minutos.`,
      en: `This link expires in ${expiryMinutes} minutes.`,
    };
    expiryText = labels[locale];
  }
  try {
    await getTransporter().sendMail({
      from: `"Veteranos - Clubes de Futebol" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: txt.subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Veteranos - Clubes de Futebol</h2>
          <p>${txt.intro}</p>
          <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            ${txt.button}
          </a>
          <p style="color: #666; font-size: 14px;">${expiryText}</p>
          <p style="color: #666; font-size: 14px;">${txt.ignore}</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Email enviado quando o admin aprova uma equipa pendente.
 * Mais acolhedor que o magic link genérico: dá contexto de que a equipa
 * foi aprovada após registo, e explica o que o coordenador pode fazer.
 */
export async function sendTeamApprovedEmail(
  email: string,
  magicLink: string,
  teamName: string,
  expiryDays: number = 7,
): Promise<boolean> {
  try {
    await getTransporter().sendMail({
      from: `"Veteranos - Clubes de Futebol" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `A sua equipa foi aprovada · ${teamName}`,
      html: `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:32px 20px;">

    <div style="text-align:center; padding-bottom:24px; border-bottom:1px solid #222;">
      <h1 style="color:#16a34a; font-size:24px; margin:0;">&#9917; Equipa Aprovada!</h1>
    </div>

    <div style="padding:24px 0; color:#ccc; font-size:15px; line-height:1.6;">
      <p>Olá,</p>

      <p>Boas notícias! A sua equipa <strong style="color:#fff;">${teamName}</strong> foi aprovada pela equipa de moderação e está agora ativa na plataforma.</p>

      <p>Pode aceder ao painel da equipa clicando no botão abaixo:</p>

      <div style="text-align:center; margin:28px 0;">
        <a href="${magicLink}" style="display:inline-block; padding:14px 32px; background-color:#16a34a; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px;">
          Aceder à Minha Equipa
        </a>
      </div>

      <p style="color:#888; font-size:13px;">Este link é pessoal e válido por ${expiryDays} dias. Não precisa de criar password — basta clicar.</p>

      <h2 style="color:#fff; font-size:18px; margin:24px 0 12px;">O que pode fazer agora?</h2>

      <ul style="padding-left:20px; color:#ccc;">
        <li>Confirmar e atualizar os dados da equipa (contactos, campo, equipamentos)</li>
        <li>Adicionar fotografia e logótipo</li>
        <li>Criar o calendário de jogos e registar resultados</li>
        <li>Exportar o calendário para o Google/Apple/telemóvel</li>
        <li>Pesquisar equipas de outras zonas e marcar jogos</li>
      </ul>

      <p style="color:#888; font-size:13px; margin-top:24px;">
        Se precisar de ajuda ou tiver questões, use a página de Sugestões na plataforma ou responda a este email.
      </p>
    </div>

    <div style="border-top:1px solid #222; padding:16px 0; text-align:center;">
      <p style="color:#888; font-size:12px; margin:0;">Patrocinado por</p>
      <a href="https://bluewavepixel.pt" style="color:#16a34a; font-size:14px; font-weight:600; text-decoration:none;">BlueWavePixel</a>
    </div>

    <div style="padding-top:12px; text-align:center;">
      <p style="color:#666; font-size:12px; margin:0;">
        Veteranos - Clubes de Futebol
      </p>
    </div>

  </div>
</body>
</html>`,
    });
    return true;
  } catch (error) {
    console.error("Failed to send approval email:", error);
    return false;
  }
}
