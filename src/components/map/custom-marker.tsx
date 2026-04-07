"use client";

import L from "leaflet";

const FOOTBALL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 3.07c1.05.16 2.04.52 2.91 1.04L14.4 8.52 13 7.79V5.07zM11 5.07v2.72L9.6 8.52 8.09 6.11A7.97 7.97 0 0 1 11 5.07zM6.09 7.58l1.74 2.85-.49 1.85L5.07 13c-.02-.33-.07-.66-.07-1 0-1.62.43-3.13 1.09-4.42zM5.35 15l2.2-.66 1.62 1.22-.42 2.67a8.04 8.04 0 0 1-3.4-3.23zm6.15 3.93l-1.22-2.44 .52-1.84h2.4l.52 1.84-1.22 2.44a8 8 0 0 1-1 0zm4.75-1.03l-.42-2.58 1.62-1.22 2.2.66a8.04 8.04 0 0 1-3.4 3.14zM18.91 13l-2.27-.68-.49-1.85 1.74-2.85A7.96 7.96 0 0 1 19 12c0 .34-.05.67-.09 1z"/></svg>`;

/**
 * Sanitize a URL to only allow http(s) and data: protocols.
 * Returns empty string for invalid URLs.
 */
function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:" || parsed.protocol === "data:") {
      return parsed.href;
    }
    return "";
  } catch {
    return "";
  }
}

export function getMarkerIcon(logoUrl: string | null): L.DivIcon {
  if (logoUrl) {
    const safeUrl = sanitizeUrl(logoUrl);
    if (safeUrl) {
      return L.divIcon({
        className: "custom-marker",
        html: `<div style="width:40px;height:40px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);overflow:hidden;background:#f3f4f6"><img src="${safeUrl}" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.parentElement.style.background='#166534';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center'"/></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22],
      });
    }
  }

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:32px;height:32px;border-radius:50%;background:#166534;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white">${FOOTBALL_SVG}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}
