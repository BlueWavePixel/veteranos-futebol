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
    subject: "Aceda à sua equipa — Veteranos Futebol",
    intro: "Clique no link abaixo para aceder à sua equipa:",
    button: "Aceder à Minha Equipa",
    expiry: "Este link expira em 30 minutos.",
    ignore: "Se não solicitou este acesso, ignore este email.",
  },
  br: {
    subject: "Acesse sua equipe — Veteranos Futebol",
    intro: "Clique no link abaixo para acessar sua equipe:",
    button: "Acessar Minha Equipe",
    expiry: "Este link expira em 30 minutos.",
    ignore: "Se não solicitou este acesso, ignore este email.",
  },
  es: {
    subject: "Acceda a su equipo — Veteranos Fútbol",
    intro: "Haga clic en el enlace de abajo para acceder a su equipo:",
    button: "Acceder a Mi Equipo",
    expiry: "Este enlace expira en 30 minutos.",
    ignore: "Si no solicitó este acceso, ignore este email.",
  },
  en: {
    subject: "Access your team — Veteranos Football",
    intro: "Click the link below to access your team:",
    button: "Access My Team",
    expiry: "This link expires in 30 minutes.",
    ignore: "If you didn't request this access, please ignore this email.",
  },
};

export async function sendMagicLinkEmail(
  email: string,
  magicLink: string,
  locale: Locale = "pt"
): Promise<boolean> {
  const txt = emailStrings[locale];
  try {
    await getTransporter().sendMail({
      from: `"Veteranos Futebol" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: txt.subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Veteranos Futebol</h2>
          <p>${txt.intro}</p>
          <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            ${txt.button}
          </a>
          <p style="color: #666; font-size: 14px;">${txt.expiry}</p>
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
