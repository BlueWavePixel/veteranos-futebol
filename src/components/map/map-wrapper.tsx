"use client";

import dynamic from "next/dynamic";

const PortugalMap = dynamic(
  () => import("./portugal-map").then((mod) => mod.PortugalMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-muted rounded-lg animate-pulse" />
    ),
  }
);

type TeamMapData = {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  latitude: string | null;
  longitude: string | null;
};

export function MapWrapper({ teams }: { teams: TeamMapData[] }) {
  return <PortugalMap teams={teams} />;
}
