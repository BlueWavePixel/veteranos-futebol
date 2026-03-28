/**
 * Convert Google Drive sharing URL to a direct image URL.
 * Google Drive blocks /uc?export and /thumbnail for many files.
 * The lh3.googleusercontent.com/d/{id} format works more reliably.
 */
export function getLogoUrl(driveUrl: string | null): string | null {
  if (!driveUrl) return null;

  // Extract file ID from various Google Drive URL formats
  const patterns = [
    /\/open\?id=([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = driveUrl.match(pattern);
    if (match) {
      return `https://lh3.googleusercontent.com/d/${match[1]}=s200`;
    }
  }

  // Return as-is if not a recognized Google Drive URL
  return driveUrl;
}
