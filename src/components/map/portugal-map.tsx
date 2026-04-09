"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { getMarkerIcon } from "./custom-marker";
import { RichPopupContent } from "./rich-popup";
import { MapFiltersBar, DEFAULT_FILTERS } from "./map-filters";
import type { MapFilters } from "./map-filters";
import type { Locale } from "@/lib/i18n/translations";

// ---- Types ----

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

// ---- Helpers ----

const PORTUGAL_CENTER: [number, number] = [39.5, -8.0];

function hasCoords(t: TeamMapData): t is TeamMapData & { latitude: string; longitude: string } {
  return t.latitude != null && t.longitude != null;
}

function matchesFilters(team: TeamMapData, f: MapFilters): boolean {
  // Search
  if (f.search) {
    const q = f.search.toLowerCase();
    const haystack = [team.name, team.location, team.distrito]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  // District
  if (f.distrito && team.distrito !== f.distrito) return false;

  // Team types (OR logic -- show teams that match ANY checked type)
  const anyTypeChecked = f.f11 || f.f7 || f.futsal;
  if (anyTypeChecked) {
    const matches =
      (f.f11 && team.teamTypeF11) ||
      (f.f7 && team.teamTypeF7) ||
      (f.futsal && team.teamTypeFutsal);
    if (!matches) return false;
  }

  // Dinner
  if (f.dinner && !team.dinnerThirdParty) return false;

  return true;
}

// ---- Sub-components ----

/** Fits map bounds to visible markers when they change */
function FitBounds({ teams }: { teams: TeamMapData[] }) {
  const map = useMap();

  useEffect(() => {
    const coords = teams.filter(hasCoords);
    if (coords.length === 0) {
      map.setView(PORTUGAL_CENTER, 7);
      return;
    }
    if (coords.length === 1) {
      map.setView(
        [parseFloat(coords[0].latitude), parseFloat(coords[0].longitude)],
        13,
      );
      return;
    }
    const bounds = L.latLngBounds(
      coords.map((t) => [parseFloat(t.latitude), parseFloat(t.longitude)] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [teams, map]);

  return null;
}

/** Geolocation button */
function LocateButton({ locale }: { locale: Locale }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const labels: Record<Locale, string> = {
    pt: "Onde estou?",
    br: "Onde estou?",
    es: "Donde estoy?",
    en: "Where am I?",
  };

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 11);

        // Drop a temporary marker
        const marker = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: "custom-marker",
            html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 8px rgba(59,130,246,0.5)"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
        }).addTo(map);

        setTimeout(() => {
          try { map.removeLayer(marker); } catch { /* already removed */ }
        }, 10000);

        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [map]);

  return (
    <button
      onClick={handleLocate}
      disabled={locating}
      type="button"
      className="leaflet-bar"
      style={{
        position: "absolute",
        top: 80,
        left: 10,
        zIndex: 1000,
        background: "white",
        border: "2px solid rgba(0,0,0,0.2)",
        borderRadius: 4,
        padding: "4px 8px",
        fontSize: 12,
        cursor: locating ? "wait" : "pointer",
        fontWeight: 600,
      }}
    >
      {locating ? "..." : labels[locale]}
    </button>
  );
}

// ---- Main Map ----

export function PortugalMap({
  teams,
  locale = "pt",
}: {
  teams: TeamMapData[];
  locale?: Locale;
}) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);

  const filteredTeams = useMemo(
    () => teams.filter((t) => hasCoords(t) && matchesFilters(t, filters)),
    [teams, filters],
  );

  if (!mounted) {
    return (
      <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-muted rounded-lg animate-pulse" />
    );
  }

  return (
    <div>
      <MapFiltersBar
        filters={filters}
        onChange={setFilters}
        total={teams.filter(hasCoords).length}
        showing={filteredTeams.length}
        locale={locale}
      />

      <MapContainer
        center={PORTUGAL_CENTER}
        zoom={7}
        className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
        >
          {filteredTeams.map((team) => (
            <Marker
              key={team.id}
              position={[parseFloat(team.latitude!), parseFloat(team.longitude!)]}
              icon={getMarkerIcon(team.logoUrl)}
            >
              <Popup>
                <RichPopupContent team={team} locale={locale} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        <FitBounds teams={filteredTeams} />
        <LocateButton locale={locale} />
      </MapContainer>
    </div>
  );
}
