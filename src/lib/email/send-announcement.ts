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

/**
 * Email de apresentação da plataforma Veteranos - Clubes de Futebol.
 * Enviado a coordenadores de equipas migradas que ainda não confirmaram RGPD.
 */
export async function sendAnnouncementEmail(
  to: string,
  teamName: string,
  teamSlug: string,
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://veteranos-futebol.vercel.app";
  const teamUrl = `${appUrl}/equipas/${teamSlug}`;
  const loginUrl = `${appUrl}/login`;

  const subject = "A sua equipa já está na nova plataforma · Veteranos - Clubes de Futebol";

  const html = `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 20px;">

    <!-- Header -->
    <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #222;">
      <h1 style="color: #16a34a; font-size: 24px; margin: 0;">&#9917; Veteranos - Clubes de Futebol</h1>
      <p style="color: #888; font-size: 14px; margin: 8px 0 0;">Plataforma oficial de contactos para equipas de veteranos em Portugal</p>
    </div>

    <!-- Body -->
    <div style="padding: 24px 0; color: #ccc; font-size: 15px; line-height: 1.6;">

      <p>Olá,</p>

      <p>Está a receber este email porque a equipa <strong style="color: #fff;">${teamName}</strong> faz parte da base de dados de equipas de veteranos de futebol de Portugal.</p>

      <p>Os contactos das equipas veteranas que estavam em ficheiros Excel foram migrados para uma plataforma online, mais organizada, segura e acessível a todos.</p>

      <h2 style="color: #fff; font-size: 18px; margin: 24px 0 12px;">O que pode fazer na plataforma?</h2>

      <ul style="padding-left: 20px; color: #ccc;">
        <li>Consultar e atualizar os dados da sua equipa a qualquer momento</li>
        <li>Pesquisar equipas por nome, concelho ou distrito</li>
        <li>Consultar o mapa interativo com mais de 300 equipas</li>
        <li>Criar o calendário de jogos, registar resultados e exportar para o telemóvel</li>
        <li>Enviar sugestões e dúvidas diretamente aos moderadores</li>
      </ul>

      <h2 style="color: #fff; font-size: 18px; margin: 24px 0 12px;">&#128274; Segurança e proteção de dados</h2>

      <p>A proteção dos vossos dados é uma prioridade. Implementámos várias medidas de segurança:</p>

      <ul style="padding-left: 20px; color: #ccc;">
        <li><strong style="color: #fff;">Contactos protegidos:</strong> os telefones e emails dos coordenadores só são visíveis para equipas verificadas. Visitantes anónimos não têm acesso.</li>
        <li><strong style="color: #fff;">Aprovação de registos:</strong> novos registos na plataforma são revistos por um moderador antes de ficarem ativos, para evitar acessos indevidos.</li>
        <li><strong style="color: #fff;">Acesso sem passwords:</strong> o login é feito através de um link enviado para o email do coordenador, sem necessidade de criar ou decorar passwords.</li>
        <li><strong style="color: #fff;">Proteção anti-bots:</strong> o sistema inclui CAPTCHA e outras camadas de segurança para impedir registos automáticos ou falsos.</li>
      </ul>

      <h2 style="color: #fff; font-size: 18px; margin: 24px 0 12px;">O que precisa de fazer?</h2>

      <p>Pedimos que aceda à plataforma para <strong>confirmar que os dados da sua equipa estão corretos</strong> e atualizá-los se necessário (contacto, campo de jogo, equipamentos, etc.).</p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${teamUrl}" style="display: inline-block; padding: 14px 32px; background-color: #16a34a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Ver a Minha Equipa
        </a>
      </div>

      <p>Para editar os dados, clique no botão abaixo para receber um link de acesso por email:</p>

      <div style="text-align: center; margin: 20px 0;">
        <a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; background-color: #222; color: #16a34a; text-decoration: none; border-radius: 8px; font-weight: 500; border: 1px solid #333;">
          Aceder ao Painel da Equipa
        </a>
      </div>

      <p style="color: #888; font-size: 13px;">Se os dados não corresponderem à sua equipa ou se tiver alguma dúvida, basta responder a este email.</p>

    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #222; padding-top: 20px; text-align: center;">
      <p style="color: #666; font-size: 12px; margin: 0;">
        Veteranos - Clubes de Futebol · Plataforma de contactos de equipas veteranas de Portugal
      </p>
      <p style="color: #555; font-size: 11px; margin: 8px 0 0;">
        Recebeu este email porque o seu contacto consta na base de dados de equipas veteranas.
        Se não pretende receber mais comunicações, responda com "Remover".
      </p>
    </div>

  </div>
</body>
</html>`;

  try {
    await getTransporter().sendMail({
      from: `"Veteranos - Clubes de Futebol" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send announcement to ${to}:`, error);
    return false;
  }
}
