import { TeamForm } from "@/components/teams/team-form";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { generateSlug } from "@/lib/slug";
import { extractTeamFields } from "@/lib/form-helpers";
import { createMagicLink } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email/send-magic-link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

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

  const magicLink = await createMagicLink(coordinatorEmail);
  if (magicLink) {
    await sendMagicLinkEmail(coordinatorEmail, magicLink);
  }

  redirect("/registar/sucesso");
}

export default function RegistarPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Registar Equipa</h1>
      <p className="text-muted-foreground mb-8">
        Preencha os dados da sua equipa de veteranos. Após o registo, receberá
        um email com um link para aceder e editar os seus dados a qualquer
        momento.
      </p>
      <TeamForm action={registerTeam} />
    </div>
  );
}
