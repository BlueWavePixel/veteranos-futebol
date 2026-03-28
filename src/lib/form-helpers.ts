import { extractCoordinates } from "@/lib/geo";

export function extractTeamFields(formData: FormData) {
  const mapsUrl = (formData.get("mapsUrl") as string) || null;
  const coords = extractCoordinates(mapsUrl);
  const foundedYear = formData.get("foundedYear") as string;
  const playerCount = formData.get("playerCount") as string;

  return {
    name: ((formData.get("name") as string) || "").trim(),
    logoUrl: (formData.get("logoUrl") as string) || null,
    teamPhotoUrl: (formData.get("teamPhotoUrl") as string) || null,
    coordinatorName: ((formData.get("coordinatorName") as string) || "").trim(),
    coordinatorAltName: (formData.get("coordinatorAltName") as string) || null,
    coordinatorPhone: (formData.get("coordinatorPhone") as string) || null,
    coordinatorAltPhone: (formData.get("coordinatorAltPhone") as string) || null,
    dinnerThirdParty: formData.get("dinnerThirdParty") === "on",
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
    location: ((formData.get("location") as string) || "").trim(),
    mapsUrl,
    latitude: coords?.latitude?.toString() || null,
    longitude: coords?.longitude?.toString() || null,
    // New fields
    foundedYear: foundedYear ? parseInt(foundedYear, 10) : null,
    playerCount: playerCount ? parseInt(playerCount, 10) : null,
    ageGroup: (formData.get("ageGroup") as string) || null,
    socialFacebook: (formData.get("socialFacebook") as string) || null,
    socialInstagram: (formData.get("socialInstagram") as string) || null,
    trainingSchedule: (formData.get("trainingSchedule") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
}
