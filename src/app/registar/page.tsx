import { TeamForm } from "@/components/teams/team-form";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { generateSlug } from "@/lib/slug";
import { extractTeamFields } from "@/lib/form-helpers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";
import { headers } from "next/headers";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { logSecurityEvent } from "@/lib/security/audit";
async function registerTeam(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  "use server";

  const fields = await extractTeamFields(formData);
  const coordinatorEmail = (formData.get("coordinatorEmail") as string)
    .toLowerCase()
    .trim();
  const rgpdConsent = formData.get("rgpdConsent") === "true";

  if (!fields.name || !coordinatorEmail || !fields.coordinatorName) {
    return {
      error: "Nome da equipa, nome e email do responsável são obrigatórios.",
    };
  }

  if (!rgpdConsent) {
    return { error: "É necessário aceitar a Política de Privacidade." };
  }

  // Get client IP once for all security checks
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown";

  // Honeypot check — bots fill hidden fields
  const honeypot1 = formData.get("website_url") as string;
  const honeypot2 = formData.get("fax_number") as string;
  if (honeypot1 || honeypot2) {
    await logSecurityEvent({
      eventType: "honeypot_triggered",
      email: coordinatorEmail,
      ip,
      details: { honeypot1, honeypot2 },
    });
    // Fake success — don't reveal detection
    redirect("/registar/sucesso");
  }

  // Suspicious pattern detection
  const suspiciousPatterns = [
    /^test/i, /^fake/i, /^spam/i, /^asdf/i, /^qwerty/i,
    /^aaa+/i, /^xxx+/i, /^123/,
  ];
  const nameIsSuspicious = suspiciousPatterns.some((p) => p.test(fields.name));
  const tempEmailDomains = [
    "tempmail", "guerrillamail", "mailinator", "throwaway",
    "yopmail", "sharklasers", "grr.la", "dispostable",
    "maildrop", "10minutemail", "trashmail",
  ];
  const emailDomain = coordinatorEmail.split("@")[1] || "";
  const emailIsSuspicious = tempEmailDomains.some((d) => emailDomain.includes(d));

  // Verify Turnstile — require when configured
  const turnstileResponse = formData.get("cf-turnstile-response") as string;
  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!turnstileResponse) {
      await logSecurityEvent({
        eventType: "captcha_failed",
        email: coordinatorEmail,
        ip,
        details: { reason: "token_missing" },
      });
      return { error: "Verificação de segurança obrigatória. Tente novamente." };
    }
    const valid = await verifyTurnstile(turnstileResponse, ip);
    if (!valid) {
      await logSecurityEvent({
        eventType: "captcha_failed",
        email: coordinatorEmail,
        ip,
      });
      return { error: "Verificação de segurança falhou. Tente novamente." };
    }
  }

  // Prevent duplicate submissions: reject if same name + email already exists
  const duplicate = await db
    .select({ id: teams.id })
    .from(teams)
    .where(
      and(eq(teams.name, fields.name), eq(teams.coordinatorEmail, coordinatorEmail))
    );
  if (duplicate.length > 0) {
    return {
      error: "Já existe uma equipa registada com este nome e email. Se precisa de ajuda, contacte-nos.",
    };
  }

  let slug = generateSlug(fields.name);
  const existing = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.slug, slug));
  if (existing.length > 0) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  if (nameIsSuspicious || emailIsSuspicious) {
    await logSecurityEvent({
      eventType: "suspicious_registration",
      email: coordinatorEmail,
      ip,
      details: {
        teamName: fields.name,
        nameIsSuspicious,
        emailIsSuspicious,
        emailDomain,
      },
    });
  }

  await db.insert(teams).values({
    slug,
    ...fields,
    coordinatorEmail,
    rgpdConsent: true,
    rgpdConsentAt: new Date(),
    isApproved: false,
  });

  redirect("/registar/sucesso");
}

export default async function RegistarPage() {
  const locale = await getLocale();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">{t("register", "title", locale)}</h1>
      <p className="text-muted-foreground mb-8">
        {t("register", "subtitle", locale)}
      </p>
      <div className="rounded-lg border bg-muted/50 p-4 mb-8 text-sm text-muted-foreground">
        {t("register", "alreadyRegistered", locale)}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {t("register", "goToLogin", locale)}
        </Link>
      </div>
      <TeamForm
        action={registerTeam}
        submitLabel={t("register", "submitButton", locale)}
        turnstileSiteKey={siteKey}
      />
    </div>
  );
}
