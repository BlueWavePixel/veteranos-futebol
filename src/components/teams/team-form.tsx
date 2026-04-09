"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RgpdConsent } from "@/components/auth/rgpd-consent";
import { ImageUpload } from "@/components/teams/image-upload";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { t, type Locale } from "@/lib/i18n/translations";
import type { Team } from "@/lib/db/schema";

const LocationPicker = dynamic(
  () => import("@/components/map/location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="w-full h-[300px] bg-muted rounded-lg animate-pulse" /> },
);

type TeamFormProps = {
  action: (
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean }>;
  defaultValues?: Partial<Team>;
  submitLabel?: string;
  showRgpd?: boolean;
  turnstileSiteKey?: string;
  csrfToken?: string;
};

function getClientLocale(): Locale {
  if (typeof document === "undefined") return "pt";
  const match = document.cookie.match(/locale=(\w+)/);
  const val = match?.[1];
  if (val === "pt" || val === "br" || val === "es" || val === "en") return val;
  return "pt";
}

export function TeamForm({
  action,
  defaultValues,
  submitLabel,
  showRgpd = true,
  turnstileSiteKey,
  csrfToken,
}: TeamFormProps) {
  const [rgpdConsent, setRgpdConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const locale = getClientLocale();

  const resolvedSubmitLabel = submitLabel || t("register", "submitButton", locale);

  async function handleSubmit(formData: FormData) {
    if (loading) return;
    if (showRgpd && !rgpdConsent) {
      setError(t("form", "rgpdRequired", locale));
      return;
    }
    setError(null);
    setLoading(true);
    formData.set("rgpdConsent", rgpdConsent ? "true" : "false");
    const result = await action(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {csrfToken && <input type="hidden" name="_csrf" value={csrfToken} />}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Dados da Equipa */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">{t("form", "teamData", locale)}</legend>

        <div>
          <Label htmlFor="name">{t("form", "teamName", locale)} *</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={defaultValues?.name || ""}
          />
        </div>

        <ImageUpload
          name="logoUrl"
          label={t("form", "teamLogo", locale)}
          currentUrl={defaultValues?.logoUrl}
          type="logo"
        />

        <ImageUpload
          name="teamPhotoUrl"
          label={t("form", "teamPhoto", locale)}
          currentUrl={defaultValues?.teamPhotoUrl}
          type="photo"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="foundedYear">{t("form", "foundedYear", locale)}</Label>
            <Input
              id="foundedYear"
              name="foundedYear"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              defaultValue={defaultValues?.foundedYear || ""}
            />
          </div>
          <div>
            <Label htmlFor="playerCount">{t("form", "playerCount", locale)}</Label>
            <Input
              id="playerCount"
              name="playerCount"
              type="number"
              min="1"
              defaultValue={defaultValues?.playerCount || ""}
            />
          </div>
          <div>
            <Label className="mb-2 block">{t("form", "ageGroup", locale)}</Label>
            <div className="flex flex-wrap gap-4">
              {[
                { value: "35+", label: "+35" },
                { value: "40+", label: "+40" },
                { value: "45+", label: "+45" },
                { value: "50+", label: "+50" },
                { value: "misto", label: t("form", "mixed", locale) },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="ageGroup"
                    value={opt.value}
                    defaultChecked={
                      defaultValues?.ageGroup?.includes(opt.value) ?? false
                    }
                    className="size-4 rounded border border-input accent-primary"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Tipo de Equipa */}
        <div>
          <Label className="mb-2 block">{t("form", "teamType", locale)}</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="teamTypeF11"
                name="teamTypeF11"
                defaultChecked={defaultValues?.teamTypeF11 || false}
              />
              <Label htmlFor="teamTypeF11">Futebol 11</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="teamTypeF7"
                name="teamTypeF7"
                defaultChecked={defaultValues?.teamTypeF7 || false}
              />
              <Label htmlFor="teamTypeF7">Futebol 7</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="teamTypeFutsal"
                name="teamTypeFutsal"
                defaultChecked={defaultValues?.teamTypeFutsal || false}
              />
              <Label htmlFor="teamTypeFutsal">Futsal</Label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="dinnerThirdParty"
            name="dinnerThirdParty"
            defaultChecked={defaultValues?.dinnerThirdParty || false}
          />
          <Label htmlFor="dinnerThirdParty">
            {t("form", "dinner", locale)}
          </Label>
        </div>
      </fieldset>

      {/* Equipamentos */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">
          {t("form", "primaryKit", locale)}
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="kitPrimaryShirt">{t("form", "shirt", locale)}</Label>
            <Input
              id="kitPrimaryShirt"
              name="kitPrimaryShirt"
              placeholder={locale === "en" ? "e.g. Red and White" : "Ex: Vermelho e Branco"}
              defaultValue={defaultValues?.kitPrimaryShirt || defaultValues?.kitPrimary || ""}
            />
          </div>
          <div>
            <Label htmlFor="kitPrimaryShorts">{t("form", "shorts", locale)}</Label>
            <Input
              id="kitPrimaryShorts"
              name="kitPrimaryShorts"
              placeholder={locale === "en" ? "e.g. Black" : "Ex: Preto"}
              defaultValue={defaultValues?.kitPrimaryShorts || ""}
            />
          </div>
          <div>
            <Label htmlFor="kitPrimarySocks">{t("form", "socks", locale)}</Label>
            <Input
              id="kitPrimarySocks"
              name="kitPrimarySocks"
              placeholder={locale === "en" ? "e.g. Red" : "Ex: Vermelho"}
              defaultValue={defaultValues?.kitPrimarySocks || ""}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">
          {t("form", "secondaryKit", locale)}
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="kitSecondaryShirt">{t("form", "shirt", locale)}</Label>
            <Input
              id="kitSecondaryShirt"
              name="kitSecondaryShirt"
              placeholder={locale === "en" ? "e.g. White" : "Ex: Branco"}
              defaultValue={defaultValues?.kitSecondaryShirt || defaultValues?.kitSecondary || ""}
            />
          </div>
          <div>
            <Label htmlFor="kitSecondaryShorts">{t("form", "shorts", locale)}</Label>
            <Input
              id="kitSecondaryShorts"
              name="kitSecondaryShorts"
              placeholder={locale === "en" ? "e.g. White" : "Ex: Branco"}
              defaultValue={defaultValues?.kitSecondaryShorts || ""}
            />
          </div>
          <div>
            <Label htmlFor="kitSecondarySocks">{t("form", "socks", locale)}</Label>
            <Input
              id="kitSecondarySocks"
              name="kitSecondarySocks"
              placeholder={locale === "en" ? "e.g. White" : "Ex: Branco"}
              defaultValue={defaultValues?.kitSecondarySocks || ""}
            />
          </div>
        </div>
      </fieldset>

      {/* Responsável */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">{t("form", "coordinator", locale)}</legend>

        <div>
          <Label htmlFor="coordinatorEmail">{t("form", "coordinatorEmail", locale)} *</Label>
          <Input
            id="coordinatorEmail"
            name="coordinatorEmail"
            type="email"
            required
            defaultValue={defaultValues?.coordinatorEmail || ""}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="coordinatorName">{t("form", "coordinatorName", locale)} *</Label>
            <Input
              id="coordinatorName"
              name="coordinatorName"
              required
              defaultValue={defaultValues?.coordinatorName || ""}
            />
          </div>
          <div>
            <Label htmlFor="coordinatorPhone">{t("form", "coordinatorPhone", locale)}</Label>
            <Input
              id="coordinatorPhone"
              name="coordinatorPhone"
              type="tel"
              defaultValue={defaultValues?.coordinatorPhone || ""}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="coordinatorAltName">
              {t("form", "altCoordinatorName", locale)}
            </Label>
            <Input
              id="coordinatorAltName"
              name="coordinatorAltName"
              defaultValue={defaultValues?.coordinatorAltName || ""}
            />
          </div>
          <div>
            <Label htmlFor="coordinatorAltPhone">{t("form", "altPhone", locale)}</Label>
            <Input
              id="coordinatorAltPhone"
              name="coordinatorAltPhone"
              type="tel"
              defaultValue={defaultValues?.coordinatorAltPhone || ""}
            />
          </div>
        </div>
      </fieldset>

      {/* Campo */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">{t("form", "field", locale)}</legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fieldName">{t("form", "fieldName", locale)}</Label>
            <Input
              id="fieldName"
              name="fieldName"
              defaultValue={defaultValues?.fieldName || ""}
            />
          </div>
          <div>
            <Label htmlFor="fieldType">{t("form", "fieldType", locale)}</Label>
            <Select
              name="fieldType"
              defaultValue={defaultValues?.fieldType || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form", "select", locale)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sintetico">{t("form", "synthetic", locale)}</SelectItem>
                <SelectItem value="relva">{t("form", "naturalGrass", locale)}</SelectItem>
                <SelectItem value="pelado">{t("form", "dirt", locale)}</SelectItem>
                <SelectItem value="futsal">{t("form", "futsalCourt", locale)}</SelectItem>
                <SelectItem value="outro">{t("form", "other", locale)}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="fieldAddress">{t("form", "fieldAddress", locale)}</Label>
          <Input
            id="fieldAddress"
            name="fieldAddress"
            defaultValue={defaultValues?.fieldAddress || ""}
          />
        </div>

        <div>
          <Label htmlFor="localidade">{t("form", "parish", locale)}</Label>
          <Input
            id="localidade"
            name="localidade"
            placeholder={locale === "en" ? "e.g. Arrentela, Brejos de Azeitão..." : "Ex: Arrentela, Brejos de Azeitão..."}
            defaultValue={defaultValues?.localidade || ""}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="concelho">{t("form", "municipality", locale)} *</Label>
            <Input
              id="concelho"
              name="concelho"
              required
              defaultValue={defaultValues?.concelho || defaultValues?.location || ""}
            />
          </div>
          <div>
            <Label htmlFor="distrito">{t("form", "district", locale)}</Label>
            <Select
              name="distrito"
              defaultValue={defaultValues?.distrito || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form", "selectDistrict", locale)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aveiro">Aveiro</SelectItem>
                <SelectItem value="Beja">Beja</SelectItem>
                <SelectItem value="Braga">Braga</SelectItem>
                <SelectItem value="Bragança">Bragança</SelectItem>
                <SelectItem value="Castelo Branco">Castelo Branco</SelectItem>
                <SelectItem value="Coimbra">Coimbra</SelectItem>
                <SelectItem value="Évora">Évora</SelectItem>
                <SelectItem value="Faro">Faro</SelectItem>
                <SelectItem value="Guarda">Guarda</SelectItem>
                <SelectItem value="Leiria">Leiria</SelectItem>
                <SelectItem value="Lisboa">Lisboa</SelectItem>
                <SelectItem value="Portalegre">Portalegre</SelectItem>
                <SelectItem value="Porto">Porto</SelectItem>
                <SelectItem value="Santarém">Santarém</SelectItem>
                <SelectItem value="Setúbal">Setúbal</SelectItem>
                <SelectItem value="Viana do Castelo">Viana do Castelo</SelectItem>
                <SelectItem value="Vila Real">Vila Real</SelectItem>
                <SelectItem value="Viseu">Viseu</SelectItem>
                <SelectItem value="Açores">Açores</SelectItem>
                <SelectItem value="Madeira">Madeira</SelectItem>
                <SelectItem value="Internacional">{t("form", "international", locale)}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <LocationPicker
          defaultMapsUrl={defaultValues?.mapsUrl}
          defaultLat={defaultValues?.latitude}
          defaultLng={defaultValues?.longitude}
          locale={locale}
        />
      </fieldset>

      {/* Redes Sociais e Horário */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">{t("form", "additionalInfo", locale)}</legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="socialFacebook">Facebook</Label>
            <Input
              id="socialFacebook"
              name="socialFacebook"
              placeholder="https://facebook.com/..."
              defaultValue={defaultValues?.socialFacebook || ""}
            />
          </div>
          <div>
            <Label htmlFor="socialInstagram">Instagram</Label>
            <Input
              id="socialInstagram"
              name="socialInstagram"
              placeholder="https://instagram.com/..."
              defaultValue={defaultValues?.socialInstagram || ""}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="trainingSchedule">{t("form", "trainingSchedule", locale)}</Label>
          <Input
            id="trainingSchedule"
            name="trainingSchedule"
            placeholder={locale === "en" ? "e.g. Wednesdays 9pm, Saturdays 4pm" : "Ex: Quartas 21h, Sábados 16h"}
            defaultValue={defaultValues?.trainingSchedule || ""}
          />
        </div>
      </fieldset>

      {/* Observações */}
      <div>
        <Label htmlFor="notes">{t("form", "notes", locale)}</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes || ""}
        />
      </div>

      {/* RGPD */}
      {showRgpd && (
        <RgpdConsent checked={rgpdConsent} onCheckedChange={setRgpdConsent} />
      )}

      {/* Turnstile CAPTCHA */}
      {turnstileSiteKey && (
        <TurnstileWidget siteKey={turnstileSiteKey} />
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? t("form", "submitting", locale) : resolvedSubmitLabel}
      </Button>
    </form>
  );
}
