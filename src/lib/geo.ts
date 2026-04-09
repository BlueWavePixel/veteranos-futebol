type Coordinates = { latitude: number; longitude: number };

function isValidCoords(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0);
}

function extractFromFullUrl(url: string): Coordinates | null {
  // Try @lat,lng format (most common in full Google Maps URLs)
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidCoords(lat, lng)) return { latitude: lat, longitude: lng };
  }

  // Try !3d{lat}!4d{lng} format (data URLs)
  const dataMatch = url.match(/!3d(-?\d+\.?\d*).*!4d(-?\d+\.?\d*)/);
  if (dataMatch) {
    const lat = parseFloat(dataMatch[1]);
    const lng = parseFloat(dataMatch[2]);
    if (isValidCoords(lat, lng)) return { latitude: lat, longitude: lng };
  }

  // Try ?q=lat,lng or &q=lat,lng format
  const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (isValidCoords(lat, lng)) return { latitude: lat, longitude: lng };
  }

  // Try center=lat%2Clng format (ftid redirect pages)
  const centerMatch = url.match(/center=(-?\d+\.?\d*)%2C(-?\d+\.?\d*)/);
  if (centerMatch) {
    const lat = parseFloat(centerMatch[1]);
    const lng = parseFloat(centerMatch[2]);
    if (isValidCoords(lat, lng)) return { latitude: lat, longitude: lng };
  }

  // Try ll=lat,lng format
  const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (llMatch) {
    const lat = parseFloat(llMatch[1]);
    const lng = parseFloat(llMatch[2]);
    if (isValidCoords(lat, lng)) return { latitude: lat, longitude: lng };
  }

  return null;
}

/** Parse DMS coordinates: "40° 33′ 27″ N, 7° 57′ 33″ O" */
function parseDMS(input: string): Coordinates | null {
  const dmsRegex = /(\d+)\s*\u00b0\s*(\d+)\s*[\u2032\u0027']\s*(\d+)\s*[\u2033\u0022"]\s*([NSEOW])/g;
  const matches = [...input.matchAll(dmsRegex)];
  if (matches.length < 2) return null;

  let lat = parseInt(matches[0][1]) + parseInt(matches[0][2]) / 60 + parseInt(matches[0][3]) / 3600;
  let lng = parseInt(matches[1][1]) + parseInt(matches[1][2]) / 60 + parseInt(matches[1][3]) / 3600;
  if (matches[0][4] === "S") lat = -lat;
  if (matches[1][4] === "W" || matches[1][4] === "O") lng = -lng;

  if (isValidCoords(lat, lng)) return { latitude: lat, longitude: lng };
  return null;
}

/** Extract a URL from text that might contain other words before/after it */
function extractUrlFromText(input: string): string | null {
  const urlMatch = input.match(/(https?:\/\/[^\s]+)/);
  return urlMatch ? urlMatch[1] : null;
}

/**
 * Known Google Maps default center coordinates that appear in shell/ftid pages.
 * These are NOT real place coordinates and must be rejected.
 */
const GOOGLE_DEFAULT_CENTERS = [
  { lat: 38.54546715, lng: -9.0243072 },
];

function isGoogleDefault(lat: number, lng: number): boolean {
  return GOOGLE_DEFAULT_CENTERS.some(
    (d) => Math.abs(lat - d.lat) < 0.001 && Math.abs(lng - d.lng) < 0.001,
  );
}

/** Fetch HTML from a URL and extract coordinates from page content */
async function extractCoordsFromHtml(url: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await response.text();

    // Try @lat,lng in the HTML (most reliable)
    const atMatch = html.match(/@(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (isValidCoords(lat, lng) && !isGoogleDefault(lat, lng)) {
        return { latitude: lat, longitude: lng };
      }
    }

    // Try "lat":XX.XXX,"lng":YY.YYY in JSON
    const jsonMatch = html.match(/"lat"\s*:\s*(-?\d+\.\d{4,})\s*,\s*"lng"\s*:\s*(-?\d+\.\d{4,})/);
    if (jsonMatch) {
      const lat = parseFloat(jsonMatch[1]);
      const lng = parseFloat(jsonMatch[2]);
      if (isValidCoords(lat, lng) && !isGoogleDefault(lat, lng)) {
        return { latitude: lat, longitude: lng };
      }
    }

    // Try center=lat%2Clng but ONLY if not the known Google default
    const centerMatch = html.match(/center=(-?\d+\.\d{4,})%2C(-?\d+\.\d{4,})/);
    if (centerMatch) {
      const lat = parseFloat(centerMatch[1]);
      const lng = parseFloat(centerMatch[2]);
      if (isValidCoords(lat, lng) && !isGoogleDefault(lat, lng)) {
        return { latitude: lat, longitude: lng };
      }
    }
  } catch {
    // Timeout or network error
  }
  return null;
}

export async function extractCoordinates(
  url: string | null | undefined
): Promise<Coordinates | null> {
  if (!url) return null;

  const input = url.trim();

  // Try raw coordinates: "38.821488,-9.292596" or "38.821488, -9.292596"
  const rawMatch = input.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (isValidCoords(lat, lng)) return { latitude: lat, longitude: lng };
  }

  // Try DMS coordinates: "40° 33′ 27″ N, 7° 57′ 33″ O"
  const fromDMS = parseDMS(input);
  if (fromDMS) return fromDMS;

  // If input contains a URL mixed with text, extract just the URL
  const cleanUrl = input.startsWith("http") ? input : extractUrlFromText(input);
  if (!cleanUrl) return null;

  // Try full URL directly
  const fromFull = extractFromFullUrl(cleanUrl);
  if (fromFull) return fromFull;

  // Resolve short URLs (goo.gl, maps.app.goo.gl, g.co, share.google)
  const isShortUrl =
    cleanUrl.includes("goo.gl") ||
    cleanUrl.includes("maps.app") ||
    cleanUrl.includes("g.co/") ||
    cleanUrl.includes("share.google");

  if (isShortUrl) {
    try {
      // Step 1: try HEAD redirect
      const response = await fetch(cleanUrl, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
      const resolved = response.url;
      if (resolved !== cleanUrl) {
        const fromResolved = extractFromFullUrl(resolved);
        if (fromResolved) return fromResolved;
      }

      // Step 2: if HEAD didn't give coords (ftid URLs), try GET + HTML scraping
      return await extractCoordsFromHtml(resolved !== cleanUrl ? resolved : cleanUrl);
    } catch {
      // Network error - try GET as last resort
      return await extractCoordsFromHtml(cleanUrl);
    }
  }

  // For google.com/maps URLs that might need HTML scraping (e.g. maps?q= with place name)
  if (cleanUrl.includes("google.com/maps") || cleanUrl.includes("google.com/search")) {
    return await extractCoordsFromHtml(cleanUrl);
  }

  return null;
}
