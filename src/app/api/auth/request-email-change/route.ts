import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { suggestions } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const { oldEmail, newEmail } = await request.json();

    if (!oldEmail || !newEmail) {
      return NextResponse.json({ error: "Emails obrigatórios" }, { status: 400 });
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
    return NextResponse.json({ ok: true });
  }
}
