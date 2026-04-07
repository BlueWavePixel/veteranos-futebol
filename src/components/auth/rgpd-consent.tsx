"use client";

import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { t, type Locale } from "@/lib/i18n/translations";

function getClientLocale(): Locale {
  if (typeof document === "undefined") return "pt";
  const match = document.cookie.match(/locale=(\w+)/);
  const val = match?.[1];
  if (val === "pt" || val === "br" || val === "es" || val === "en") return val;
  return "pt";
}

export function RgpdConsent({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const locale = getClientLocale();

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-4">
      <Checkbox
        id="rgpd"
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        required
      />
      <label
        htmlFor="rgpd"
        className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
      >
        {t("rgpd", "consentText", locale)}{" "}
        <Link
          href="/privacidade"
          className="text-primary hover:underline"
          target="_blank"
        >
          {t("common", "privacyPolicy", locale)}
        </Link>
        .
      </label>
    </div>
  );
}
