/**
 * Apply security headers to a response.
 *
 * CSP allows:
 * - self
 * - Cloudflare Turnstile (challenges.cloudflare.com)
 * - OpenStreetMap tiles (*.tile.openstreetmap.org)
 * - Vercel Blob images (*.public.blob.vercel-storage.com)
 * - unpkg CDN (leaflet assets)
 * - Google user content (logos — lh3.googleusercontent.com)
 */
export function applySecurityHeaders(headers: Headers): void {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://unpkg.com",
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.public.blob.vercel-storage.com https://lh3.googleusercontent.com https://unpkg.com",
    "font-src 'self'",
    "connect-src 'self' https://challenges.cloudflare.com https://*.tile.openstreetmap.org",
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; ");

  headers.set("Content-Security-Policy", csp);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=()"
  );
}
