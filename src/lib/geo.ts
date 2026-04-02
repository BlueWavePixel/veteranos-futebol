type Coordinates = { latitude: number; longitude: number };

function extractFromFullUrl(url: string): Coordinates | null {
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

  // Try ?q=lat,lng format
  const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) {
    return {
      latitude: parseFloat(qMatch[1]),
      longitude: parseFloat(qMatch[2]),
    };
  }

  return null;
}

export async function extractCoordinates(
  url: string | null | undefined
): Promise<Coordinates | null> {
  if (!url) return null;

  // Try raw coordinates: "38.821488,-9.292596" or "38.821488, -9.292596"
  const rawMatch = url.trim().match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { latitude: lat, longitude: lng };
    }
  }

  // Try full URL directly
  const fromFull = extractFromFullUrl(url);
  if (fromFull) return fromFull;

  // Resolve short URLs (goo.gl/maps/*, maps.app.goo.gl/*)
  if (url.includes("goo.gl") || url.includes("maps.app")) {
    try {
      const response = await fetch(url, { method: "HEAD", redirect: "follow" });
      const resolved = response.url;
      if (resolved !== url) {
        return extractFromFullUrl(resolved);
      }
    } catch {
      // Network error - return null silently
    }
  }

  return null;
}
