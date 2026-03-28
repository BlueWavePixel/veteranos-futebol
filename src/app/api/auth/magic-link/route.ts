import { NextRequest, NextResponse } from "next/server";
import { createMagicLink } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email/send-magic-link";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const magicLink = await createMagicLink(email.trim());

    // Always return success to prevent email enumeration
    if (magicLink) {
      try {
        await sendMagicLinkEmail(email.trim(), magicLink);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    }

    return NextResponse.json({
      message: "Se o email estiver registado, receberá um link de acesso.",
    });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json(
      { message: "Se o email estiver registado, receberá um link de acesso." },
      { status: 200 }
    );
  }
}
