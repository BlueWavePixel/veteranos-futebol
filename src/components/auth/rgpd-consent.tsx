"use client";

import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export function RgpdConsent({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
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
        Ao submeter este formulário, consinto que os meus dados pessoais (nome,
        email, telefone) sejam armazenados e partilhados com outras equipas de
        veteranos registadas na plataforma, com a finalidade exclusiva de
        facilitar o contacto para marcação de jogos. Posso a qualquer momento
        editar ou eliminar os meus dados. Consulte a nossa{" "}
        <Link
          href="/privacidade"
          className="text-primary hover:underline"
          target="_blank"
        >
          Política de Privacidade
        </Link>
        .
      </label>
    </div>
  );
}
