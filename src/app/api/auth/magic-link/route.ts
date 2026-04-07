import { NextRequest, NextResponse } from "next/server";
import { createMagicLink } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email/send-magic-link";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { logSecurityEvent, getClientIp } from "@/lib/security/audit";
import type { Locale } from "@/lib/i18n/translations";

const GENERIC_MESSAGE: Record<string, string> = {
  pt: "Se o email estiver registado, receberá um link de acesso.",
  br: "Se o email estiver registado, receberá um link de acesso.",
  es: "Si el email está registrado, recibirá un enlace de acceso.",
  en: "If the email is registered, you will receive an access link.",
};

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || undefined;

  try {
    const body = await request.json();
    const { email, turnstileToken } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const localeCookie = request.cookies.get("locale")?.value;
    const locale: string =
      localeCookie === "es" || localeCookie === "br" || localeCookie === "en"
        ? localeCookie
        : "pt";
    const emailLocale: Locale =
      locale === "es" ? "es" : locale === "br" ? "br" : "pt";

    const genericMsg = GENERIC_MESSAGE[locale] || GENERIC_MESSAGE.pt;

    // Rate limit by IP (20 per 15 min)
    const ipLimit = checkRateLimit(`magic-link:ip:${ip}`, 20, FIFTEEN_MINUTES);
    if (!ipLimit.allowed) {
      await logSecurityEvent({
        eventType: "magic_link_rate_limited",
        email: email.trim(),
        ip,
        userAgent,
        details: { reason: "ip_limit" },
      });
      return NextResponse.json({ message: genericMsg });
    }

    // Rate limit by email (5 per 15 min)
    const normalizedEmail = email.trim().toLowerCase();
    const emailLimit = checkRateLimit(
      `magic-link:email:${normalizedEmail}`,
      5,
      FIFTEEN_MINUTES
    );
    if (!emailLimit.allowed) {
      await logSecurityEvent({
        eventType: "magic_link_rate_limited",
        email: normalizedEmail,
        ip,
        userAgent,
        details: { reason: "email_limit" },
      });
      return NextResponse.json({ message: genericMsg });
    }

    // Verify Turnstile if token provided
    if (turnstileToken) {
      const valid = await verifyTurnstile(turnstileToken, ip);
      if (!valid) {
        await logSecurityEvent({
          eventType: "magic_link_captcha_failed",
          email: normalizedEmail,
          ip,
          userAgent,
        });
        return NextResponse.json({ message: genericMsg });
      }
    }

    const magicLink = await createMagicLink(normalizedEmail);

    // Always return success to prevent email enumeration
    if (magicLink) {
      try {
        await sendMagicLinkEmail(normalizedEmail, magicLink, emailLocale);
        await logSecurityEvent({
          eventType: "magic_link_sent",
          email: normalizedEmail,
          ip,
          userAgent,
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        await logSecurityEvent({
          eventType: "magic_link_failed",
          email: normalizedEmail,
          ip,
          userAgent,
          details: { error: String(emailError) },
        });
      }
    }

    return NextResponse.json({ message: genericMsg });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json({
      message: GENERIC_MESSAGE.pt,
    });
  }
}
