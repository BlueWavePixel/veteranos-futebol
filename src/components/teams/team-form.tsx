"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RgpdConsent } from "@/components/auth/rgpd-consent";
import type { Team } from "@/lib/db/schema";

type TeamFormProps = {
  action: (
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean }>;
  defaultValues?: Partial<Team>;
  submitLabel?: string;
  showRgpd?: boolean;
};

export function TeamForm({
  action,
  defaultValues,
  submitLabel = "Registar Equipa",
  showRgpd = true,
}: TeamFormProps) {
  const [rgpdConsent, setRgpdConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (showRgpd && !rgpdConsent) {
      setError("É necessário aceitar a Política de Privacidade.");
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
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Dados da Equipa */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Dados da Equipa</legend>

        <div>
          <Label htmlFor="name">Nome da Equipa *</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={defaultValues?.name || ""}
          />
        </div>

        <div>
          <Label htmlFor="logoUrl">Link do Logotipo (Google Drive)</Label>
          <Input
            id="logoUrl"
            name="logoUrl"
            type="url"
            defaultValue={defaultValues?.logoUrl || ""}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="kitPrimary">Equipamento Principal</Label>
            <Input
              id="kitPrimary"
              name="kitPrimary"
              defaultValue={defaultValues?.kitPrimary || ""}
            />
          </div>
          <div>
            <Label htmlFor="kitSecondary">Equipamento Alternativo</Label>
            <Input
              id="kitSecondary"
              name="kitSecondary"
              defaultValue={defaultValues?.kitSecondary || ""}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="dinnerThirdParty"
            name="dinnerThirdParty"
            defaultChecked={defaultValues?.dinnerThirdParty || false}
          />
          <Label htmlFor="dinnerThirdParty">
            Disponível para Jantar (3ª Parte)
          </Label>
        </div>
      </fieldset>

      {/* Responsável */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Responsável</legend>

        <div>
          <Label htmlFor="coordinatorEmail">Email do Responsável *</Label>
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
            <Label htmlFor="coordinatorName">Nome do Responsável *</Label>
            <Input
              id="coordinatorName"
              name="coordinatorName"
              required
              defaultValue={defaultValues?.coordinatorName || ""}
            />
          </div>
          <div>
            <Label htmlFor="coordinatorPhone">Contacto do Responsável</Label>
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
              Nome Responsável Alternativo
            </Label>
            <Input
              id="coordinatorAltName"
              name="coordinatorAltName"
              defaultValue={defaultValues?.coordinatorAltName || ""}
            />
          </div>
          <div>
            <Label htmlFor="coordinatorAltPhone">Contacto Alternativo</Label>
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
        <legend className="text-lg font-semibold">Campo</legend>

        <div>
          <Label htmlFor="fieldName">Nome do Campo</Label>
          <Input
            id="fieldName"
            name="fieldName"
            defaultValue={defaultValues?.fieldName || ""}
          />
        </div>

        <div>
          <Label htmlFor="fieldAddress">Morada do Campo</Label>
          <Input
            id="fieldAddress"
            name="fieldAddress"
            defaultValue={defaultValues?.fieldAddress || ""}
          />
        </div>

        <div>
          <Label htmlFor="location">Concelho / Distrito *</Label>
          <Input
            id="location"
            name="location"
            required
            defaultValue={defaultValues?.location || ""}
          />
        </div>

        <div>
          <Label htmlFor="mapsUrl">Link Google Maps</Label>
          <Input
            id="mapsUrl"
            name="mapsUrl"
            type="url"
            defaultValue={defaultValues?.mapsUrl || ""}
          />
        </div>
      </fieldset>

      {/* Observações */}
      <div>
        <Label htmlFor="notes">Observações</Label>
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

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "A submeter..." : submitLabel}
      </Button>
    </form>
  );
}
