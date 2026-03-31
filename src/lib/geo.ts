type Coordinates = { latitude: number; longitude: number };

export function extractCoordinates(
  url: string | null | undefined
): Coordinates | null {
  if (!url) return null;

  // Try @lat,lng format (most common in full Google Maps URLs)
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return {
      latitude: parseFloat(atMatch[1]),
      longitude: parseFloat(atMatch[2]),
    };
  }

  // Try !3d{lat}!4d{lng} format (data URLs)
  const dataMatch = url.match(/!3d(-?\d+\.?\d*).*!4d(-?\d+\.?\d*)/);
  if (dataMatch) {
    return {
      latitude: parseFloat(dataMatch[1]),
      longitude: parseFloat(dataMatch[2]),
    };
  }

  // Try raw coordinates: "38.821488,-9.292596" or "38.821488, -9.292596"
  const rawMatch = url.trim().match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { latitude: lat, longitude: lng };
    }
  }

  // Short URLs (goo.gl/maps/*) need HTTP resolution — cannot parse statically
  return null;
}
