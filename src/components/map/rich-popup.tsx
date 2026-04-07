"use client";

import type { Locale } from "@/lib/i18n/translations";

type PopupTeam = {
  slug: string;
  name: string;
  location: string | null;
  logoUrl: string | null;
  distrito: string | null;
  teamTypeF11: boolean | null;
  teamTypeF7: boolean | null;
  teamTypeFutsal: boolean | null;
  kitPrimaryShirt: string | null;
  kitSecondaryShirt: string | null;
  fieldName: string | null;
};

const labels: Record<string, Record<Locale, string>> = {
  viewTeam: { pt: "Ver Equipa", br: "Ver Time", es: "Ver Equipo", en: "View Team" },
  field: { pt: "Campo", br: "Campo", es: "Campo", en: "Field" },
  kit: { pt: "Equipamento", br: "Uniforme", es: "Equipación", en: "Kit" },
};

function l(key: string, locale: Locale) {
  return labels[key]?.[locale] ?? labels[key]?.pt ?? key;
}

const typeBadgeColors: Record<string, string> = {
  F11: "#166534",
  F7: "#1d4ed8",
  Futsal: "#9333ea",
};

export function RichPopupContent({
  team,
  locale,
}: {
  team: PopupTeam;
  locale: Locale;
}) {
  const types: string[] = [];
  if (team.teamTypeF11) types.push("F11");
  if (team.teamTypeF7) types.push("F7");
  if (team.teamTypeFutsal) types.push("Futsal");

  return (
    <div style={{ minWidth: 200, maxWidth: 260, fontSize: 13 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        {team.logoUrl && (
          <img
            src={team.logoUrl}
            alt=""
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #e5e7eb",
            }}
          />
        )}
        <a
          href={`/equipas/${team.slug}`}
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: "#166534",
            textDecoration: "none",
          }}
        >
          {team.name}
        </a>
      </div>

      {/* Location */}
      {(team.location || team.distrito) && (
        <div style={{ color: "#6b7280", marginBottom: 4 }}>
          {[team.location, team.distrito].filter(Boolean).join(", ")}
        </div>
      )}

      {/* Type badges */}
      {types.length > 0 && (
        <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
          {types.map((t) => (
            <span
              key={t}
              style={{
                background: typeBadgeColors[t],
                color: "white",
                padding: "1px 8px",
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Kit */}
      {(team.kitPrimaryShirt || team.kitSecondaryShirt) && (
        <div style={{ color: "#6b7280", marginBottom: 4, fontSize: 12 }}>
          {l("kit", locale)}:{" "}
          {[team.kitPrimaryShirt, team.kitSecondaryShirt].filter(Boolean).join(" / ")}
        </div>
      )}

      {/* Field */}
      {team.fieldName && (
        <div style={{ color: "#6b7280", marginBottom: 6, fontSize: 12 }}>
          {l("field", locale)}: {team.fieldName}
        </div>
      )}

      {/* Button */}
      <a
        href={`/equipas/${team.slug}`}
        style={{
          display: "inline-block",
          background: "#166534",
          color: "white",
          padding: "4px 14px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          textDecoration: "none",
          marginTop: 2,
        }}
      >
        {l("viewTeam", locale)}
      </a>
    </div>
  );
}
