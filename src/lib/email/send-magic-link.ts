import nodemailer from "nodemailer";

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

export async function sendMagicLinkEmail(
  email: string,
  magicLink: string
): Promise<boolean> {
  try {
    await getTransporter().sendMail({
      from: `"Veteranos Futebol" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Aceda à sua equipa — Veteranos Futebol",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Veteranos Futebol</h2>
          <p>Clique no link abaixo para aceder à sua equipa:</p>
          <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Aceder à Minha Equipa
          </a>
          <p style="color: #666; font-size: 14px;">Este link expira em 24 horas.</p>
          <p style="color: #666; font-size: 14px;">Se não solicitou este acesso, ignore este email.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
