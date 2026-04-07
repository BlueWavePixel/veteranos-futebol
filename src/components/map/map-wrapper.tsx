"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n/translations";

const PortugalMap = dynamic(
  () => import("./portugal-map").then((mod) => mod.PortugalMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-muted rounded-lg animate-pulse" />
    ),
  }
);

export type TeamMapData = {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  latitude: string | null;
  longitude: string | null;
  logoUrl: string | null;
  distrito: string | null;
  teamTypeF11: boolean | null;
  teamTypeF7: boolean | null;
  teamTypeFutsal: boolean | null;
  dinnerThirdParty: boolean | null;
  kitPrimaryShirt: string | null;
  kitSecondaryShirt: string | null;
  fieldName: string | null;
};

export function MapWrapper({
  teams,
  locale = "pt",
}: {
  teams: TeamMapData[];
  locale?: Locale;
}) {
  return <PortugalMap teams={teams} locale={locale} />;
}
