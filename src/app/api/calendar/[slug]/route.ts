import { db } from "@/lib/db";
import { teams, matches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

function escapeICS(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatICSDate(date: Date) {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = d.getUTCDate().toString().padStart(2, "0");
  const hours = d.getUTCHours().toString().padStart(2, "0");
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  const seconds = d.getUTCSeconds().toString().padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const { slug } = await params;

  const [team] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.slug, slug), eq(teams.isActive, true)));

  if (!team) {
    return NextResponse.json({ error: "Equipa não encontrada" }, { status: 404 });
  }

  const teamMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.teamId, team.id))
    .orderBy(matches.matchDate);

  const events = teamMatches
    .map((match) => {
      const start = formatICSDate(match.matchDate);
      const endDate = new Date(new Date(match.matchDate).getTime() + 2 * 60 * 60 * 1000);
      const end = formatICSDate(endDate);

      const homeAway = match.isHome ? "Casa" : "Fora";
      const summary = `${team.name} vs ${match.opponent} (${homeAway})`;

      const locationParts = [match.fieldName, match.location].filter(Boolean);
      const location = locationParts.join(", ");

      const descParts = [`${homeAway}`];
      if (match.goalsFor !== null && match.goalsAgainst !== null) {
        descParts.push(`Resultado: ${match.goalsFor}-${match.goalsAgainst}`);
      }
      if (match.notes) descParts.push(match.notes);

      return [
        "BEGIN:VEVENT",
        `UID:${match.id}@veteranos-futebol`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeICS(summary)}`,
        location ? `LOCATION:${escapeICS(location)}` : "",
        `DESCRIPTION:${escapeICS(descParts.join("\\n"))}`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\r\n");
    })
    .join("\r\n");

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//Veteranos - Clubes de Futebol//${team.name}//PT`,
    `X-WR-CALNAME:${escapeICS(team.name)}: Jogos`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    events,
    "END:VCALENDAR",
  ].join("\r\n");

  const filename = `${slug}-calendario.ics`;

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
