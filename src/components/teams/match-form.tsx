"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { Match } from "@/lib/db/schema";

type Props = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Match;
};

export function MatchForm({ action, defaultValues }: Props) {
  const defaultDate = defaultValues
    ? new Date(defaultValues.matchDate).toISOString().split("T")[0]
    : "";
  const defaultTime = defaultValues
    ? new Date(defaultValues.matchDate).toTimeString().slice(0, 5)
    : "15:00";

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="opponent">Adversário *</Label>
          <Input
            id="opponent"
            name="opponent"
            required
            placeholder="Nome da equipa adversária"
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
              Jogo em casa
            </Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="matchDate">Data *</Label>
          <Input
            id="matchDate"
            name="matchDate"
            type="date"
            required
            defaultValue={defaultDate}
          />
        </div>
        <div>
          <Label htmlFor="matchTime">Hora</Label>
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
          <Label htmlFor="fieldName">Nome do Campo</Label>
          <Input
            id="fieldName"
            name="fieldName"
            placeholder="Ex: Campo Municipal..."
            defaultValue={defaultValues?.fieldName || ""}
          />
        </div>
        <div>
          <Label htmlFor="location">Localização</Label>
          <Input
            id="location"
            name="location"
            placeholder="Ex: Seixal, Setúbal"
            defaultValue={defaultValues?.location || ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="goalsFor">Golos a favor</Label>
          <Input
            id="goalsFor"
            name="goalsFor"
            type="number"
            min="0"
            placeholder="—"
            defaultValue={defaultValues?.goalsFor ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="goalsAgainst">Golos contra</Label>
          <Input
            id="goalsAgainst"
            name="goalsAgainst"
            type="number"
            min="0"
            placeholder="—"
            defaultValue={defaultValues?.goalsAgainst ?? ""}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Torneio, amigável, observações..."
          defaultValue={defaultValues?.notes || ""}
        />
      </div>

      <Button type="submit" className="w-full">
        {defaultValues ? "Guardar Alterações" : "Adicionar Jogo"}
      </Button>
    </form>
  );
}
