import { extractCoordinates } from "@/lib/geo";

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
    name: ((formData.get("name") as string) || "").trim(),
    logoUrl: (formData.get("logoUrl") as string) || null,
    teamPhotoUrl: (formData.get("teamPhotoUrl") as string) || null,
    coordinatorName: ((formData.get("coordinatorName") as string) || "").trim(),
    coordinatorAltName: (formData.get("coordinatorAltName") as string) || null,
    coordinatorPhone: (formData.get("coordinatorPhone") as string) || null,
    coordinatorAltPhone: (formData.get("coordinatorAltPhone") as string) || null,
    dinnerThirdParty: formData.get("dinnerThirdParty") === "on",
    // Team types
    teamTypeF11: formData.get("teamTypeF11") === "on",
    teamTypeF7: formData.get("teamTypeF7") === "on",
    teamTypeFutsal: formData.get("teamTypeFutsal") === "on",
    // Kit primary
    kitPrimaryShirt: (formData.get("kitPrimaryShirt") as string) || null,
    kitPrimaryShorts: (formData.get("kitPrimaryShorts") as string) || null,
    kitPrimarySocks: (formData.get("kitPrimarySocks") as string) || null,
    // Kit secondary
    kitSecondaryShirt: (formData.get("kitSecondaryShirt") as string) || null,
    kitSecondaryShorts: (formData.get("kitSecondaryShorts") as string) || null,
    kitSecondarySocks: (formData.get("kitSecondarySocks") as string) || null,
    // Field
    fieldName: (formData.get("fieldName") as string) || null,
    fieldAddress: (formData.get("fieldAddress") as string) || null,
    fieldType: (formData.get("fieldType") as string) || null,
    // Location
    localidade: (formData.get("localidade") as string) || null,
    location: [concelho, distrito].filter(Boolean).join(" / "),
    concelho,
    distrito,
    mapsUrl,
    latitude,
    longitude,
    // Other fields
    foundedYear: foundedYear ? parseInt(foundedYear, 10) : null,
    playerCount: playerCount ? parseInt(playerCount, 10) : null,
    ageGroup: formData.getAll("ageGroup").filter(Boolean).join(", ") || null,
    socialFacebook: (formData.get("socialFacebook") as string) || null,
    socialInstagram: (formData.get("socialInstagram") as string) || null,
    trainingSchedule: (formData.get("trainingSchedule") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
}
