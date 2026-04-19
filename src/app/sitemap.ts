import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

// trim() defensivo: env vars no Vercel dashboard às vezes colam com \n extra
const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://veteranos-futebol.vercel.app").trim();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/equipas`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/registar`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/sugestoes`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const rows = await db
      .select({ slug: teams.slug, updatedAt: teams.updatedAt })
      .from(teams)
      .where(and(eq(teams.isActive, true), eq(teams.isApproved, true)));

    const teamRoutes: MetadataRoute.Sitemap = rows.map((t) => ({
      url: `${BASE_URL}/equipas/${t.slug}`,
      lastModified: t.updatedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...teamRoutes];
  } catch {
    return staticRoutes;
  }
}
