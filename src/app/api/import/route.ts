import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { parseExcelFile } from "@/scripts/import-excel";
import { getAdminSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import path from "path";

export async function POST() {
  const admin = await getAdminSession();
  if (!admin || admin.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const filePath = path.join(
    process.cwd(),
    "..",
    "Docs_general",
    "Contactos dos Clubes Veteranos (Respostas) (1).xlsx"
  );

  const teamsData = parseExcelFile(filePath);

  let imported = 0;
  for (const teamData of teamsData) {
    await db.insert(teams).values(teamData);
    imported++;
  }

  await logAudit({
    actorType: "super_admin",
    actorEmail: admin.email,
    action: "excel_imported",
    details: { count: imported },
  });

  return NextResponse.json({ imported });
}
