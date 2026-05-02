import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Endpoint público consumido pelo Vet-Gest (app.veteranos.bluewavepixel.pt)
// para fazer lookup canónico de equipas durante o claim flow. Retorna snake_case
// — o cliente Vet-Gest faz a transformação para camelCase. Email do coordenador
// NÃO é exposto em texto: só hash sha256 do email lowercased, para o Vet-Gest
// validar ownership sem o conhecer (privacy + anti-spam preserved). Apenas
// equipas isActive + isApproved são listadas.

function hashEmail(email: string | null): string | null {
  if (!email) return null;
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const result = await db
    .select({
      slug: teams.slug,
      name: teams.name,
      logo_url: teams.logoUrl,
      region: teams.distrito,
      primary_color: teams.kitPrimary,
      secondary_color: teams.kitSecondary,
      social_facebook: teams.socialFacebook,
      social_instagram: teams.socialInstagram,
      coordinator_email: teams.coordinatorEmail,
    })
    .from(teams)
    .where(and(eq(teams.slug, slug), eq(teams.isActive, true), eq(teams.isApproved, true)))
    .limit(1);

  if (result.length === 0) {
    return NextResponse.json({ error: "team_not_found" }, { status: 404 });
  }

  const team = result[0];
  // Não expor o email em texto. Devolver apenas o hash para verificação.
  const { coordinator_email, ...publicData } = team;
  const response = {
    ...publicData,
    coordinator_email_hash: hashEmail(coordinator_email),
  };

  return NextResponse.json(response, {
    headers: {
      // Cache 5 min público + 10 min em CDNs. Slug muda raramente.
      "Cache-Control": "public, max-age=300, s-maxage=600",
    },
  });
}
