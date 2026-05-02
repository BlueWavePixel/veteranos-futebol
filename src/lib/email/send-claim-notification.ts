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

interface ClaimNotificationArgs {
  coordinatorEmail: string;
  teamName: string;
  requestingEmail: string;
  confirmUrl: string;
  blockUrl: string;
}

/**
 * Notifica o coordenador real de uma equipa registada no diretório que alguém
 * com email diferente está a tentar reclamar a equipa no Vet-Gest.
 * Email tem 2 botões: confirmar transferência (caso o coordenador esteja a usar
 * email novo) ou bloquear (caso seja tentativa de squatting).
 */
export async function sendClaimNotificationEmail(
  args: ClaimNotificationArgs,
): Promise<boolean> {
  try {
    await getTransporter().sendMail({
      from: `"Veteranos - Clubes de Futebol" <${process.env.GMAIL_USER}>`,
      to: args.coordinatorEmail,
      subject: `Pedido de reclamação · ${args.teamName}`,
      html: `<!DOCTYPE html>
<html lang="pt-PT">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;">

    <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #222;">
      <h1 style="color:#16a34a;font-size:22px;margin:0;">Pedido de reclamação</h1>
    </div>

    <div style="padding:24px 0;color:#ccc;font-size:15px;line-height:1.6;">
      <p>Olá,</p>

      <p>Alguém com o email <strong style="color:#fff;">${args.requestingEmail}</strong> está a tentar reclamar a equipa <strong style="color:#fff;">${args.teamName}</strong> na app Vet-Gest (gestão de cotas e convocatórias).</p>

      <p>Como és o coordenador registado da equipa no diretório, precisamos da tua confirmação antes de dar acesso a essa pessoa.</p>

      <h2 style="color:#fff;font-size:16px;margin:24px 0 12px;">Foste tu a tentar reclamar?</h2>

      <p style="color:#ccc;font-size:14px;">Se sim, talvez estejas a usar um email diferente do que tinhas registado. Confirma com o botão abaixo e o acesso será concedido a esse novo email.</p>

      <div style="text-align:center;margin:20px 0;">
        <a href="${args.confirmUrl}" style="display:inline-block;padding:14px 32px;background-color:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">
          Confirmar reclamação
        </a>
      </div>

      <h2 style="color:#fff;font-size:16px;margin:24px 0 12px;">Não foste tu?</h2>

      <p style="color:#ccc;font-size:14px;">Bloqueia este pedido para impedir que essa pessoa fique como coordenador da tua equipa no Vet-Gest. A reclamação dela é cancelada.</p>

      <div style="text-align:center;margin:20px 0;">
        <a href="${args.blockUrl}" style="display:inline-block;padding:14px 32px;background-color:#dc2626;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">
          Bloquear reclamação
        </a>
      </div>

      <p style="color:#888;font-size:12px;margin-top:24px;">Os links são válidos durante 7 dias. Se ignorares, a reclamação fica em estado pendente até moderação manual.</p>
    </div>

    <div style="border-top:1px solid #222;padding:16px 0;text-align:center;">
      <p style="color:#666;font-size:12px;margin:0;">Veteranos - Clubes de Futebol</p>
      <p style="color:#666;font-size:12px;margin:4px 0 0;">Vet-Gest é um produto BlueWavePixel</p>
    </div>

  </div>
</body>
</html>`,
    });
    return true;
  } catch (error) {
    console.error("Failed to send claim notification email:", error);
    return false;
  }
}
