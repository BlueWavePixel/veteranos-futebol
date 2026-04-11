"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { t, type Locale } from "@/lib/i18n/translations";
import type { Match } from "@/lib/db/schema";

type Props = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Match;
  csrfToken?: string;
};

function getClientLocale(): Locale {
  if (typeof document === "undefined") return "pt";
  const match = document.cookie.match(/locale=(\w+)/);
  const val = match?.[1];
  if (val === "pt" || val === "br" || val === "es" || val === "en") return val;
  return "pt";
}

export function MatchForm({ action, defaultValues, csrfToken }: Props) {
  const locale = getClientLocale();
  const defaultDate = defaultValues
    ? new Date(defaultValues.matchDate).toISOString().split("T")[0]
    : "";
  const defaultTime = defaultValues
    ? new Date(defaultValues.matchDate).toTimeString().slice(0, 5)
    : "15:00";

  return (
    <form action={action} className="space-y-4">
      {csrfToken && <input type="hidden" name="_csrf" value={csrfToken} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="opponent">{t("matches", "opponent", locale)} *</Label>
          <Input
            id="opponent"
            name="opponent"
            required
            placeholder={t("matches", "opponentPlaceholder", locale)}
            defaultValue={defaultValues?.opponent || ""}
          />
        </div>
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2 pb-2">
            <Checkbox
              id="isHome"
              name="isHome"
              defaultChecked={defaultValues?.isHome ?? true}
            />
            <Label htmlFor="isHome" className="cursor-pointer">
              {t("matches", "homeMatch", locale)}
            </Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="matchDate">{t("matches", "date", locale)} *</Label>
          <Input
            id="matchDate"
            name="matchDate"
            type="date"
            required
            defaultValue={defaultDate}
          />
        </div>
        <div>
          <Label htmlFor="matchTime">{t("matches", "time", locale)}</Label>
          <Input
            id="matchTime"
            name="matchTime"
            type="time"
            defaultValue={defaultTime}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fieldName">{t("form", "fieldName", locale)}</Label>
          <Input
            id="fieldName"
            name="fieldName"
            placeholder="Ex: Campo Municipal..."
            defaultValue={defaultValues?.fieldName || ""}
          />
        </div>
        <div>
          <Label htmlFor="location">{t("matches", "location", locale)}</Label>
          <Input
            id="location"
            name="location"
            placeholder={t("matches", "locationPlaceholder", locale)}
            defaultValue={defaultValues?.location || ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="goalsFor">{t("matches", "goalsFor", locale)}</Label>
          <Input
            id="goalsFor"
            name="goalsFor"
            type="number"
            min="0"
            placeholder="-"
            defaultValue={defaultValues?.goalsFor ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="goalsAgainst">{t("matches", "goalsAgainst", locale)}</Label>
          <Input
            id="goalsAgainst"
            name="goalsAgainst"
            type="number"
            min="0"
            placeholder="-"
            defaultValue={defaultValues?.goalsAgainst ?? ""}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">{t("matches", "matchNotes", locale)}</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder={t("matches", "matchNotesPlaceholder", locale)}
          defaultValue={defaultValues?.notes || ""}
        />
      </div>

      <Button type="submit" className="w-full">
        {defaultValues ? t("common", "save", locale) : t("matches", "addMatch", locale)}
      </Button>
    </form>
  );
}
