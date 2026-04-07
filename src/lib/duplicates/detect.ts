/**
 * Duplicate detection utilities for veteran football teams.
 */

const ABBREVIATIONS: Record<string, string> = {
  "vet.": "veteranos",
  "vet": "veteranos",
  "fc": "futebol clube",
  "f.c.": "futebol clube",
  "gd": "grupo desportivo",
  "g.d.": "grupo desportivo",
  "cd": "clube desportivo",
  "c.d.": "clube desportivo",
  "sc": "sporting clube",
  "s.c.": "sporting clube",
  "cf": "clube futebol",
  "c.f.": "clube futebol",
  "ud": "uniao desportiva",
  "u.d.": "uniao desportiva",
  "ad": "associacao desportiva",
  "a.d.": "associacao desportiva",
  "ac": "atletico clube",
  "a.c.": "atletico clube",
  "sr": "sociedade recreativa",
  "s.r.": "sociedade recreativa",
  "cr": "clube recreativo",
  "c.r.": "clube recreativo",
};

/**
 * Strip accents (NFD + remove diacritics), lowercase, trim,
 * expand common Portuguese football abbreviations.
 */
export function normalizeText(text: string): string {
  if (!text) return "";

  // NFD decompose + remove diacritics
  let normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  // Expand abbreviations
  // Sort by length descending so longer abbreviations match first (e.g. "f.c." before "fc")
  const sorted = Object.entries(ABBREVIATIONS).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [abbrev, expansion] of sorted) {
    // Escape dots for regex; use word-boundary-like matching that handles dots
    const escaped = abbrev.replace(/\./g, "\\.");
    // Use lookahead/lookbehind for word boundaries that work with dots
    const regex = new RegExp(`(?<=^|\\s)${escaped}(?=\\s|$)`, "gi");
    normalized = normalized.replace(regex, expansion);
  }

  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

/**
 * Normalize a Portuguese phone number:
 * strip non-digits, remove +351/00351/351 prefix, return last 9 digits.
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";

  // Strip everything except digits
  let digits = phone.replace(/\D/g, "");

  // Remove country prefix
  if (digits.startsWith("00351")) {
    digits = digits.slice(5);
  } else if (digits.startsWith("351") && digits.length > 9) {
    digits = digits.slice(3);
  }

  // Return last 9 digits
  return digits.slice(-9);
}

/**
 * Standard Levenshtein distance between two strings.
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Use two-row approach for memory efficiency
  let prevRow = Array.from({ length: b.length + 1 }, (_, i) => i);
  let currRow = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    currRow[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1, // insertion
        prevRow[j] + 1, // deletion
        prevRow[j - 1] + cost // substitution
      );
    }
    [prevRow, currRow] = [currRow, prevRow];
  }

  return prevRow[b.length];
}

/**
 * Haversine distance in meters between two lat/lon coordinates.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
