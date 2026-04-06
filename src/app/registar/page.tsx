import { TeamForm } from "@/components/teams/team-form";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { generateSlug } from "@/lib/slug";
import { extractTeamFields } from "@/lib/form-helpers";
import { createMagicLink } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email/send-magic-link";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/translations";
import { cookies } from "next/headers";

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

  await db.insert(teams).values({
    slug,
    ...fields,
    coordinatorEmail,
    rgpdConsent: true,
    rgpdConsentAt: new Date(),
  });

  const cookieStore = await cookies();
  const localeCookieValue = cookieStore.get("locale")?.value;
  const emailLocale: Locale =
    localeCookieValue === "es" || localeCookieValue === "br"
      ? (localeCookieValue as Locale)
      : "pt";

  const magicLink = await createMagicLink(coordinatorEmail);
  if (magicLink) {
    await sendMagicLinkEmail(coordinatorEmail, magicLink, emailLocale);
  }

  redirect("/registar/sucesso");
}

export default async function RegistarPage() {
  const locale = await getLocale();

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
      <TeamForm action={registerTeam} submitLabel={t("register", "submitButton", locale)} />
    </div>
  );
}
