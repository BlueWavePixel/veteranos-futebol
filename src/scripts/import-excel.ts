import * as XLSX from "xlsx";
import { generateSlug } from "@/lib/slug";
import { extractCoordinates } from "@/lib/geo";

export function cleanPhone(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).replace(/\.0$/, "").trim();
  return str || null;
}

export function parseExcelRow(row: unknown[]) {
  const mapsUrl = row[14] as string | null;
  const coords = extractCoordinates(mapsUrl);

  return {
    name: (row[3] as string)?.trim() || "",
    coordinatorEmail: ((row[1] as string) || "").toLowerCase().trim(),
    logoUrl: (row[2] as string) || null,
    coordinatorName: ((row[4] as string) || "").trim(),
    coordinatorAltName: (row[5] as string) || null,
    coordinatorPhone: cleanPhone(row[6]),
    coordinatorAltPhone: cleanPhone(row[7]),
    dinnerThirdParty: (row[8] as string)?.toLowerCase() === "sim",
    kitPrimary: (row[9] as string) || null,
    kitSecondary: (row[10] as string) || null,
    fieldName: (row[11] as string) || null,
    fieldAddress: (row[12] as string) || null,
    location: ((row[13] as string) || "").trim(),
    mapsUrl: mapsUrl || null,
    latitude: coords?.latitude?.toString() || null,
    longitude: coords?.longitude?.toString() || null,
    notes: (row[15] as string) || null,
  };
}

export function parseExcelFile(filePath: string) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

  const dataRows = rows.slice(1).filter((row) => row[3]);

  const teamsData = dataRows.map((row) => {
    const parsed = parseExcelRow(row);
    const slug = generateSlug(parsed.name);
    return {
      ...parsed,
      slug,
      rgpdConsent: false,
      isActive: true,
    };
  });

  // Handle duplicate slugs
  const slugCounts = new Map<string, number>();
  for (const team of teamsData) {
    const count = slugCounts.get(team.slug) || 0;
    if (count > 0) {
      team.slug = `${team.slug}-${count + 1}`;
    }
    slugCounts.set(team.slug, count + 1);
  }

  return teamsData;
}
