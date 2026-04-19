"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n/translations";
import type { TeamMapData } from "./portugal-map";

export type { TeamMapData };

const PortugalMap = dynamic(
  () => import("./portugal-map").then((mod) => mod.PortugalMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-muted rounded-lg animate-pulse" />
    ),
  }
);

export function MapWrapper({
  teams,
  locale = "pt",
}: {
  teams: TeamMapData[];
  locale?: Locale;
}) {
  return <PortugalMap teams={teams} locale={locale} />;
}
