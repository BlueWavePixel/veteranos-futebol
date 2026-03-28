import { TeamForm } from "@/components/teams/team-form";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { generateSlug } from "@/lib/slug";
import { extractCoordinates } from "@/lib/geo";
import { createMagicLink } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email/send-magic-link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

async function registerTeam(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  "use server";

  const name = formData.get("name") as string;
  const coordinatorEmail = (formData.get("coordinatorEmail") as string)
    .toLowerCase()
    .trim();
  const coordinatorName = (formData.get("coordinatorName") as string)?.trim();
  const rgpdConsent = formData.get("rgpdConsent") === "true";

  if (!name || !coordinatorEmail || !coordinatorName) {
    return { error: "Nome da equipa, nome e email do responsável são obrigatórios." };
  }

  if (!rgpdConsent) {
    return { error: "É necessário aceitar a Política de Privacidade." };
  }

  // Generate unique slug
  let slug = generateSlug(name);
  const existing = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.slug, slug));
  if (existing.length > 0) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const mapsUrl = formData.get("mapsUrl") as string;
  const coords = extractCoordinates(mapsUrl);

  await db.insert(teams).values({
    slug,
    name: name.trim(),
    logoUrl: (formData.get("logoUrl") as string) || null,
    coordinatorName,
    coordinatorAltName: (formData.get("coordinatorAltName") as string) || null,
    coordinatorEmail,
    coordinatorPhone: (formData.get("coordinatorPhone") as string) || null,
    coordinatorAltPhone:
      (formData.get("coordinatorAltPhone") as string) || null,
    dinnerThirdParty: formData.get("dinnerThirdParty") === "on",
    kitPrimary: (formData.get("kitPrimary") as string) || null,
    kitSecondary: (formData.get("kitSecondary") as string) || null,
    fieldName: (formData.get("fieldName") as string) || null,
    fieldAddress: (formData.get("fieldAddress") as string) || null,
    location: ((formData.get("location") as string) || "").trim(),
    mapsUrl: mapsUrl || null,
    latitude: coords?.latitude?.toString() || null,
    longitude: coords?.longitude?.toString() || null,
    notes: (formData.get("notes") as string) || null,
    rgpdConsent: true,
    rgpdConsentAt: new Date(),
  });

  // Send magic link for immediate access
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
