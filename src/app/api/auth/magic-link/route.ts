import { NextRequest, NextResponse } from "next/server";
import { createMagicLink } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email/send-magic-link";
import type { Locale } from "@/lib/i18n/translations";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const localeCookie = request.cookies.get("locale")?.value;
    const locale: Locale =
      localeCookie === "es" || localeCookie === "br" ? (localeCookie as Locale) : "pt";

    const magicLink = await createMagicLink(email.trim());

    // Always return success to prevent email enumeration
    if (magicLink) {
      try {
        await sendMagicLinkEmail(email.trim(), magicLink, locale);
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
