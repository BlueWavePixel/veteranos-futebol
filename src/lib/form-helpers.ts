import { extractCoordinates } from "@/lib/geo";

/** Truncate input to a max length to prevent DoS via huge text fields. */
function limit(value: string | null, max: number): string | null {
  if (!value) return value;
  return value.length > max ? value.slice(0, max) : value;
}

function getField(formData: FormData, name: string, max: number): string | null {
  const raw = formData.get(name) as string | null;
  return raw ? limit(raw, max) : null;
}

/**
 * Extract team fields from form data.
 * @param existingCoords — pass current lat/lng when updating, so they're
 *   preserved if the new mapsUrl can't be resolved. Omit on registration.
 */
export async function extractTeamFields(
  formData: FormData,
  existingCoords?: { latitude: string | null; longitude: string | null },
) {
  let mapsUrl = (formData.get("mapsUrl") as string)?.trim() || null;

  // Sanitize: only allow http/https URLs (prevent javascript: XSS)
  if (mapsUrl && !/^https?:\/\//i.test(mapsUrl) && !/^-?\d/.test(mapsUrl)) {
    mapsUrl = null;
  }

  // If user entered raw coordinates, convert to a Google Maps link
  const coords = await extractCoordinates(mapsUrl);
  if (mapsUrl && coords && /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(mapsUrl)) {
    mapsUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
  }

  // Priority: 1) picker coords (from map click/search), 2) URL extraction, 3) existing coords
  const pickerLat = (formData.get("_pickerLat") as string)?.trim() || null;
  const pickerLng = (formData.get("_pickerLng") as string)?.trim() || null;

  let latitude: string | null = null;
  let longitude: string | null = null;

  if (pickerLat && pickerLng) {
    latitude = pickerLat;
    longitude = pickerLng;
  } else if (coords) {
    latitude = coords.latitude.toString();
    longitude = coords.longitude.toString();
  } else if (existingCoords?.latitude) {
    latitude = existingCoords.latitude;
    longitude = existingCoords.longitude;
  }

  const foundedYear = formData.get("foundedYear") as string;
  const playerCount = formData.get("playerCount") as string;
  const concelho = ((formData.get("concelho") as string) || "").trim();
  const distrito = (formData.get("distrito") as string) || null;

  return {
    name: limit(((formData.get("name") as string) || "").trim(), 150) || "",
    logoUrl: getField(formData, "logoUrl", 500),
    teamPhotoUrl: getField(formData, "teamPhotoUrl", 500),
    coordinatorName: limit(((formData.get("coordinatorName") as string) || "").trim(), 150) || "",
    coordinatorAltName: getField(formData, "coordinatorAltName", 150),
    coordinatorPhone: getField(formData, "coordinatorPhone", 30),
    coordinatorAltPhone: getField(formData, "coordinatorAltPhone", 30),
    dinnerThirdParty: formData.get("dinnerThirdParty") === "on",
    // Team types
    teamTypeF11: formData.get("teamTypeF11") === "on",
    teamTypeF7: formData.get("teamTypeF7") === "on",
    teamTypeFutsal: formData.get("teamTypeFutsal") === "on",
    // Kit primary
    kitPrimaryShirt: getField(formData, "kitPrimaryShirt", 100),
    kitPrimaryShorts: getField(formData, "kitPrimaryShorts", 100),
    kitPrimarySocks: getField(formData, "kitPrimarySocks", 100),
    // Kit secondary
    kitSecondaryShirt: getField(formData, "kitSecondaryShirt", 100),
    kitSecondaryShorts: getField(formData, "kitSecondaryShorts", 100),
    kitSecondarySocks: getField(formData, "kitSecondarySocks", 100),
    // Field
    fieldName: getField(formData, "fieldName", 200),
    fieldAddress: getField(formData, "fieldAddress", 300),
    fieldType: getField(formData, "fieldType", 50),
    // Location
    localidade: getField(formData, "localidade", 150),
    location: [concelho, distrito].filter(Boolean).join(" / "),
    concelho: limit(concelho, 100) || "",
    distrito: limit(distrito, 100),
    mapsUrl: limit(mapsUrl, 500),
    latitude,
    longitude,
    // Other fields
    foundedYear: foundedYear ? parseInt(foundedYear, 10) : null,
    playerCount: playerCount ? parseInt(playerCount, 10) : null,
    ageGroup: limit(formData.getAll("ageGroup").filter(Boolean).join(", ") || null, 200),
    socialFacebook: getField(formData, "socialFacebook", 300),
    socialInstagram: getField(formData, "socialInstagram", 300),
    trainingSchedule: getField(formData, "trainingSchedule", 300),
    notes: getField(formData, "notes", 2000),
  };
}
