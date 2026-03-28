"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon in Next.js
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type TeamMapData = {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  latitude: string | null;
  longitude: string | null;
};

export function PortugalMap({ teams }: { teams: TeamMapData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-lg animate-pulse" />
    );
  }

  const teamsWithCoords = teams.filter((t) => t.latitude && t.longitude);

  // Center of Portugal
  const center: [number, number] = [39.5, -8.0];

  return (
    <MapContainer
      center={center}
      zoom={7}
      className="w-full h-[500px] rounded-lg z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {teamsWithCoords.map((team) => (
        <Marker
          key={team.id}
          position={[parseFloat(team.latitude!), parseFloat(team.longitude!)]}
          icon={markerIcon}
        >
          <Popup>
            <Link
              href={`/equipas/${team.slug}`}
              className="font-semibold text-green-700 hover:underline"
            >
              {team.name}
            </Link>
            {team.location && (
              <p className="text-sm text-gray-600">{team.location}</p>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
