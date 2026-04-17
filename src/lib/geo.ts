type Coordinates = { latitude: number; longitude: number };

const ALLOWED_HOSTS = [
  "google.com", "google.pt", "google.es", "google.co.uk",
  "goo.gl", "maps.app.goo.gl", "g.co",
];

/** Check if a URL points to an allowed maps domain (prevents SSRF). */
function isAllowedMapsUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return ALLOWED_HOSTS.some((h) => host === h || host.endsWith("." + h));
  } catch {
    return false;
  }
}

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

/** Fetch HTML from a URL and extract coordinates from page content.
 *  Only trusts @lat,lng and JSON patterns — NOT center= which is always
 *  a server-geolocation default (PT on EU servers, US on Vercel US-East). */
async function extractCoordsFromHtml(url: string): Promise<Coordinates | null> {
  if (!isAllowedMapsUrl(url)) return null;
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await response.text();

    // Try @lat,lng in the HTML (most reliable — only present in real place pages)
    const atMatch = html.match(/@(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (isValidCoords(lat, lng)) return { latitude: lat, longitude: lng };
    }

    // Try "lat":XX.XXX,"lng":YY.YYY in JSON embedded data
    const jsonMatch = html.match(/"lat"\s*:\s*(-?\d+\.\d{4,})\s*,\s*"lng"\s*:\s*(-?\d+\.\d{4,})/);
    if (jsonMatch) {
      const lat = parseFloat(jsonMatch[1]);
      const lng = parseFloat(jsonMatch[2]);
      if (isValidCoords(lat, lng)) return { latitude: lat, longitude: lng };
    }

    // NOTE: center=lat%2Clng is intentionally NOT used here.
    // It always contains the Google Maps default center based on server
    // geolocation (e.g. Portugal on EU servers, Virginia on US servers),
    // not the actual place coordinates.
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

  if (isShortUrl && isAllowedMapsUrl(cleanUrl)) {
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
  if (isAllowedMapsUrl(cleanUrl) && (cleanUrl.includes("google.com/maps") || cleanUrl.includes("google.com/search"))) {
    return await extractCoordsFromHtml(cleanUrl);
  }

  return null;
}
