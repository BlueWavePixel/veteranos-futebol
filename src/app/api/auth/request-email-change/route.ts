import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { suggestions } from "@/lib/db/schema";
import { getSessionPayload } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { getClientIp } from "@/lib/security/audit";

export async function POST(request: NextRequest) {
  try {
    // Authentication: require valid coordinator session
    const session = await getSessionPayload();
    if (!session?.email) {
      return NextResponse.json({ error: "Autenticação obrigatória" }, { status: 401 });
    }

    // Rate limit: 3 requests per email per hour
    const ip = getClientIp(request);
    const rl = checkRateLimit(`email-change:${ip}`, 3, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Demasiados pedidos. Tente novamente mais tarde." }, { status: 429 });
    }

    const { oldEmail, newEmail } = await request.json();

    if (!oldEmail || !newEmail) {
      return NextResponse.json({ error: "Emails obrigatórios" }, { status: 400 });
    }

    // Ensure the user can only request changes for their own email
    if (oldEmail.toLowerCase().trim() !== session.email.toLowerCase()) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    await db.insert(suggestions).values({
      authorName: "Pedido Automático",
      authorEmail: oldEmail,
      subject: "Pedido de alteração de email",
      message: `Pedido de alteração de email do coordenador.\n\nEmail atual: ${oldEmail}\nNovo email: ${newEmail}`,
      status: "pending",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
