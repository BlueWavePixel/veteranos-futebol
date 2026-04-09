"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t, type Locale } from "@/lib/i18n/translations";

const PORTUGAL_CENTER: [number, number] = [39.5, -8.0];
const DEFAULT_ZOOM = 7;
const PLACED_ZOOM = 15;

const PIN_ICON = L.divIcon({
  className: "custom-marker",
  html: `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center">
    <svg viewBox="0 0 24 24" width="28" height="28" fill="#e11d48" stroke="white" stroke-width="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
    </svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

/** Tries to extract coordinates from a Google Maps URL (client-side, no fetch) */
function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  if (!url) return null;
  const input = url.trim();

  // Raw coordinates
  const rawMatch = input.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng };
  }

  // @lat,lng
  const atMatch = input.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

  // !3d lat !4d lng
  const dataMatch = input.match(/!3d(-?\d+\.?\d*).*!4d(-?\d+\.?\d*)/);
  if (dataMatch) return { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) };

  // ?q=lat,lng
  const qMatch = input.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };

  return null;
}

/** Click handler for map */
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Fly to position when it changes */
function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, PLACED_ZOOM, { duration: 0.8 });
    }
  }, [position, map]);
  return null;
}

type LocationPickerProps = {
  defaultMapsUrl?: string | null;
  defaultLat?: string | null;
  defaultLng?: string | null;
  locale: Locale;
};

export function LocationPicker({
  defaultMapsUrl,
  defaultLat,
  defaultLng,
  locale,
}: LocationPickerProps) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [mapsUrl, setMapsUrl] = useState(defaultMapsUrl || "");
  const [position, setPosition] = useState<[number, number] | null>(
    defaultLat && defaultLng
      ? [parseFloat(defaultLat), parseFloat(defaultLng)]
      : null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState<"idle" | "valid" | "invalid" | "manual">(
    defaultLat && defaultLng ? "valid" : "idle",
  );
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // React to mapsUrl changes
  const handleUrlChange = useCallback((url: string) => {
    setMapsUrl(url);
    if (!url.trim()) {
      setStatus("idle");
      return;
    }
    const coords = extractCoordsFromUrl(url);
    if (coords) {
      setPosition([coords.lat, coords.lng]);
      setStatus("valid");
    } else {
      // URL present but can't extract coords client-side
      setStatus("invalid");
    }
  }, []);

  // Nominatim search with debounce
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({
          q: query,
          format: "json",
          limit: "5",
          countrycodes: "pt,es",
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          { headers: { "User-Agent": "VeteranosFutebol/1.0" } },
        );
        const data: NominatimResult[] = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 800);
  }, []);

  const handleSelectResult = useCallback((result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPosition([lat, lng]);
    setStatus("manual");
    setSearchResults([]);
    setSearchQuery("");
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    setStatus("manual");
  }, []);

  const labels = {
    mapsLink: t("form", "mapsLink", locale),
    searchPlaceholder: {
      pt: "Pesquisar localização no mapa...",
      br: "Pesquisar localização no mapa...",
      es: "Buscar ubicación en el mapa...",
      en: "Search location on map...",
    }[locale],
    hintValid: {
      pt: "Link válido. O pin foi colocado automaticamente no mapa.",
      br: "Link válido. O pin foi colocado automaticamente no mapa.",
      es: "Enlace válido. El pin se ha colocado automáticamente.",
      en: "Valid link. The pin was placed automatically on the map.",
    }[locale],
    hintInvalid: {
      pt: "Não foi possível extrair a localização do link. Pesquise ou clique no mapa para posicionar o pin manualmente.",
      br: "Não foi possível extrair a localização do link. Pesquise ou clique no mapa para posicionar o pin manualmente.",
      es: "No se pudo extraer la ubicación del enlace. Busque o haga clic en el mapa.",
      en: "Could not extract location from link. Search or click the map to place the pin manually.",
    }[locale],
    hintManual: {
      pt: "Pin posicionado manualmente. Pode arrastar o pin para ajustar.",
      br: "Pin posicionado manualmente. Pode arrastar o pin para ajustar.",
      es: "Pin colocado manualmente. Puede arrastrar el pin para ajustar.",
      en: "Pin placed manually. You can drag the pin to adjust.",
    }[locale],
    hintIdle: {
      pt: "Cole um link do Google Maps ou pesquise/clique no mapa para definir a localização.",
      br: "Cole um link do Google Maps ou pesquise/clique no mapa para definir a localização.",
      es: "Pegue un enlace de Google Maps o busque/haga clic en el mapa.",
      en: "Paste a Google Maps link or search/click the map to set the location.",
    }[locale],
  };

  const statusHint =
    status === "valid" ? labels.hintValid :
    status === "invalid" ? labels.hintInvalid :
    status === "manual" ? labels.hintManual :
    labels.hintIdle;

  const statusColor =
    status === "valid" || status === "manual"
      ? "text-green-600 dark:text-green-400"
      : status === "invalid"
        ? "text-amber-600 dark:text-amber-400"
        : "text-muted-foreground";

  return (
    <div className="space-y-3">
      {/* Hidden inputs for form submission */}
      <input type="hidden" name="_pickerLat" value={position ? position[0].toString() : ""} />
      <input type="hidden" name="_pickerLng" value={position ? position[1].toString() : ""} />

      {/* Google Maps URL input */}
      <div>
        <Label htmlFor="mapsUrl">{labels.mapsLink}</Label>
        <Input
          id="mapsUrl"
          name="mapsUrl"
          type="text"
          placeholder="https://maps.google.com/..."
          value={mapsUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
        />
      </div>

      {/* Status hint */}
      <p className={`text-xs ${statusColor}`}>{statusHint}</p>

      {/* Map */}
      {mounted ? (
        <div className="relative">
          {/* Search bar on top of map */}
          <div className="absolute top-2 left-2 right-2 z-[1000]">
            <Input
              type="text"
              placeholder={labels.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-white dark:bg-zinc-900 shadow-md text-sm h-9"
            />
            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <ul className="bg-white dark:bg-zinc-900 border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                {searchResults.map((r, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => handleSelectResult(r)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted truncate"
                    >
                      {r.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {searching && (
              <p className="text-xs text-muted-foreground mt-1 ml-1">
                {locale === "en" ? "Searching..." : "A pesquisar..."}
              </p>
            )}
          </div>

          <MapContainer
            center={position || PORTUGAL_CENTER}
            zoom={position ? PLACED_ZOOM : DEFAULT_ZOOM}
            className="w-full h-[300px] rounded-lg z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {position && (
              <Marker
                position={position}
                icon={PIN_ICON}
                draggable
                eventHandlers={{
                  dragend(e) {
                    const marker = e.target as L.Marker;
                    const latlng = marker.getLatLng();
                    setPosition([latlng.lat, latlng.lng]);
                    setStatus("manual");
                  },
                }}
              />
            )}
            <MapClickHandler onMapClick={handleMapClick} />
            <FlyTo position={position} />
          </MapContainer>
        </div>
      ) : (
        <div className="w-full h-[300px] bg-muted rounded-lg animate-pulse" />
      )}
    </div>
  );
}
