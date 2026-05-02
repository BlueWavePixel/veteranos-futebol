import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendClaimNotificationEmail } from "@/lib/email/send-claim-notification";

// Endpoint privado consumido pelo Vet-Gest quando um claim falha o hash
// compare (email do user não bate com coordinator_email registado).
// O Vet-Gest gera 2 magic-link URLs (confirm/block) e pede ao directory
// para enviar email ao coordenador real.
//
// Auth: bearer token shared secret (VETGEST_INTERNAL_TOKEN). NÃO é público
// — qualquer chamada sem token válido retorna 401 sem indicação de
// existência do endpoint.

interface BodyShape {
  requestingEmail: string;
  teamName: string;
  confirmUrl: string;
  blockUrl: string;
}

function isValidBody(data: unknown): data is BodyShape {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.requestingEmail === "string" &&
    d.requestingEmail.length > 0 &&
    d.requestingEmail.length <= 254 &&
    typeof d.teamName === "string" &&
    typeof d.confirmUrl === "string" &&
    d.confirmUrl.startsWith("https://") &&
    typeof d.blockUrl === "string" &&
    d.blockUrl.startsWith("https://")
  );
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Bearer token check (constant-time compare para evitar timing oracle)
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.VETGEST_INTERNAL_TOKEN ?? ""}`;
  if (!process.env.VETGEST_INTERNAL_TOKEN || !constantTimeEquals(authHeader, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // Lookup team — só equipas activas + aprovadas têm coordinator_email exposto.
  const result = await db
    .select({
      coordinator_email: teams.coordinatorEmail,
      name: teams.name,
    })
    .from(teams)
    .where(and(eq(teams.slug, slug), eq(teams.isActive, true), eq(teams.isApproved, true)))
    .limit(1);

  if (result.length === 0) {
    return NextResponse.json({ error: "team_not_found" }, { status: 404 });
  }

  const team = result[0];
  if (!team.coordinator_email) {
    // Equipa sem email registado — não há canal out-of-band, vet-gest deve fazer
    // moderação manual.
    return NextResponse.json({ error: "no_coordinator_email" }, { status: 422 });
  }

  const sent = await sendClaimNotificationEmail({
    coordinatorEmail: team.coordinator_email,
    teamName: body.teamName,
    requestingEmail: body.requestingEmail,
    confirmUrl: body.confirmUrl,
    blockUrl: body.blockUrl,
  });

  if (!sent) {
    return NextResponse.json({ error: "email_send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
