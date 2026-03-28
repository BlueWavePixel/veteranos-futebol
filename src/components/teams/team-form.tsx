"use client";

import { useState } from "react";
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

        <ImageUpload
          name="logoUrl"
          label="Logotipo da Equipa"
          currentUrl={defaultValues?.logoUrl}
          type="logo"
        />

        <ImageUpload
          name="teamPhotoUrl"
          label="Foto de Equipa"
          currentUrl={defaultValues?.teamPhotoUrl}
          type="photo"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="foundedYear">Ano de Fundação</Label>
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
            <Label htmlFor="playerCount">N.º de Jogadores</Label>
            <Input
              id="playerCount"
              name="playerCount"
              type="number"
              min="1"
              defaultValue={defaultValues?.playerCount || ""}
            />
          </div>
          <div>
            <Label htmlFor="ageGroup">Escalão Etário</Label>
            <Select
              name="ageGroup"
              defaultValue={defaultValues?.ageGroup || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="35+">+35</SelectItem>
                <SelectItem value="40+">+40</SelectItem>
                <SelectItem value="45+">+45</SelectItem>
                <SelectItem value="50+">+50</SelectItem>
                <SelectItem value="misto">Misto</SelectItem>
              </SelectContent>
            </Select>
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

      {/* Equipamentos */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">
          Equipamento Principal
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="kitPrimaryShirt">Camisola</Label>
            <Input
              id="kitPrimaryShirt"
              name="kitPrimaryShirt"
              placeholder="Ex: Vermelho e Branco"
              defaultValue={defaultValues?.kitPrimaryShirt || defaultValues?.kitPrimary || ""}
            />
          </div>
          <div>
            <Label htmlFor="kitPrimaryShorts">Calções</Label>
            <Input
              id="kitPrimaryShorts"
              name="kitPrimaryShorts"
              placeholder="Ex: Preto"
              defaultValue={defaultValues?.kitPrimaryShorts || ""}
            />
          </div>
          <div>
            <Label htmlFor="kitPrimarySocks">Meias</Label>
            <Input
              id="kitPrimarySocks"
              name="kitPrimarySocks"
              placeholder="Ex: Vermelho"
              defaultValue={defaultValues?.kitPrimarySocks || ""}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">
          Equipamento Alternativo
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="kitSecondaryShirt">Camisola</Label>
            <Input
              id="kitSecondaryShirt"
              name="kitSecondaryShirt"
              placeholder="Ex: Branco"
              defaultValue={defaultValues?.kitSecondaryShirt || defaultValues?.kitSecondary || ""}
            />
          </div>
          <div>
            <Label htmlFor="kitSecondaryShorts">Calções</Label>
            <Input
              id="kitSecondaryShorts"
              name="kitSecondaryShorts"
              placeholder="Ex: Branco"
              defaultValue={defaultValues?.kitSecondaryShorts || ""}
            />
          </div>
          <div>
            <Label htmlFor="kitSecondarySocks">Meias</Label>
            <Input
              id="kitSecondarySocks"
              name="kitSecondarySocks"
              placeholder="Ex: Branco"
              defaultValue={defaultValues?.kitSecondarySocks || ""}
            />
          </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fieldName">Nome do Campo</Label>
            <Input
              id="fieldName"
              name="fieldName"
              defaultValue={defaultValues?.fieldName || ""}
            />
          </div>
          <div>
            <Label htmlFor="fieldType">Tipo de Campo</Label>
            <Select
              name="fieldType"
              defaultValue={defaultValues?.fieldType || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sintetico">Sintético</SelectItem>
                <SelectItem value="relva">Relva Natural</SelectItem>
                <SelectItem value="pelado">Pelado</SelectItem>
                <SelectItem value="futsal">Futsal (pavilhão)</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

      {/* Redes Sociais e Horário */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Informação Adicional</legend>

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
          <Label htmlFor="trainingSchedule">Horário de Treino / Jogo</Label>
          <Input
            id="trainingSchedule"
            name="trainingSchedule"
            placeholder="Ex: Quartas 21h, Sábados 16h"
            defaultValue={defaultValues?.trainingSchedule || ""}
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
