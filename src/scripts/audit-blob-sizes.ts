import { config } from "dotenv";
import { list } from "@vercel/blob";

config({ path: ".env.local" });

const LOGO_LIMIT = 500 * 1024;
const PHOTO_LIMIT = 2 * 1024 * 1024;

function fmt(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
  return `${(bytes / 1024).toFixed(0)}KB`;
}

async function main() {
  const all: Array<{ pathname: string; url: string; size: number; uploadedAt: Date }> = [];
  let cursor: string | undefined;
  do {
    const page = await list({ cursor, limit: 1000 });
    all.push(...page.blobs);
    cursor = page.cursor;
  } while (cursor);

  const logos = all.filter((b) => b.pathname.startsWith("logo-"));
  const photos = all.filter((b) => b.pathname.startsWith("photo-"));
  const others = all.filter(
    (b) => !b.pathname.startsWith("logo-") && !b.pathname.startsWith("photo-"),
  );

  const oversizedLogos = logos
    .filter((b) => b.size > LOGO_LIMIT)
    .sort((a, b) => b.size - a.size);
  const oversizedPhotos = photos
    .filter((b) => b.size > PHOTO_LIMIT)
    .sort((a, b) => b.size - a.size);

  console.log(`\n=== Audit Vercel Blob (${all.length} ficheiros total) ===`);
  console.log(`Logos: ${logos.length} (${oversizedLogos.length} acima de 500KB)`);
  console.log(`Fotos: ${photos.length} (${oversizedPhotos.length} acima de 2MB)`);
  console.log(`Outros: ${others.length}\n`);

  if (oversizedLogos.length > 0) {
    console.log(`--- Logos acima de 500KB (${oversizedLogos.length}) ---`);
    for (const b of oversizedLogos) {
      console.log(`${fmt(b.size).padStart(8)}  ${b.pathname}`);
      console.log(`          ${b.url}`);
    }
    console.log();
  }

  if (oversizedPhotos.length > 0) {
    console.log(`--- Fotos acima de 2MB (${oversizedPhotos.length}) ---`);
    for (const b of oversizedPhotos) {
      console.log(`${fmt(b.size).padStart(8)}  ${b.pathname}`);
      console.log(`          ${b.url}`);
    }
    console.log();
  }

  const sumAll = all.reduce((s, b) => s + b.size, 0);
  console.log(`Espaço total usado: ${fmt(sumAll)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
