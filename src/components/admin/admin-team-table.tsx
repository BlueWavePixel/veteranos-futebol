"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Team } from "@/lib/db/schema";

type Props = {
  teams: Team[];
  deleteAction: (formData: FormData) => Promise<void>;
  bulkDeleteAction: (formData: FormData) => Promise<void>;
  reactivateAction?: (formData: FormData) => Promise<void>;
  permanentDeleteAction?: (formData: FormData) => Promise<void>;
  isInactiveView?: boolean;
  isDuplicatesView?: boolean;
  isSuperAdmin?: boolean;
};

export function AdminTeamTable({
  teams,
  deleteAction,
  bulkDeleteAction,
  reactivateAction,
  permanentDeleteAction,
  isInactiveView = false,
  isDuplicatesView = false,
  isSuperAdmin = false,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmPermanent, setConfirmPermanent] = useState(false);
  const showPermanentDelete = isSuperAdmin && permanentDeleteAction && (isInactiveView || isDuplicatesView);

  function toggleAll() {
    if (selected.size === teams.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(teams.map((t) => t.id)));
    }
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2 mb-4">
          <span className="text-sm font-medium">
            {selected.size} equipa{selected.size !== 1 ? "s" : ""}{" "}
            selecionada{selected.size !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSelected(new Set()); setConfirmPermanent(false); }}
            >
              Limpar
            </Button>
            {isInactiveView && reactivateAction ? (
              <form action={reactivateAction}>
                <input
                  type="hidden"
                  name="teamIds"
                  value={Array.from(selected).join(",")}
                />
                <Button type="submit" size="sm">
                  Reativar ({selected.size})
                </Button>
              </form>
            ) : (
              <form action={bulkDeleteAction}>
                <input
                  type="hidden"
                  name="teamIds"
                  value={Array.from(selected).join(",")}
                />
                <Button type="submit" variant="destructive" size="sm">
                  Inativar ({selected.size})
                </Button>
              </form>
            )}
            {showPermanentDelete && (
              confirmPermanent ? (
                <div className="flex items-center gap-2">
                  <form action={permanentDeleteAction}>
                    <input
                      type="hidden"
                      name="teamIds"
                      value={Array.from(selected).join(",")}
                    />
                    <Button type="submit" variant="destructive" size="sm" className="bg-red-700 hover:bg-red-800">
                      Confirmar eliminação ({selected.size})
                    </Button>
                  </form>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmPermanent(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-700 text-red-500 hover:bg-red-950 hover:text-red-400"
                  onClick={() => setConfirmPermanent(true)}
                >
                  Apagar definitivamente ({selected.size})
                </Button>
              )
            )}
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <input
                type="checkbox"
                checked={
                  selected.size === teams.length && teams.length > 0
                }
                onChange={toggleAll}
                className="size-4 accent-primary"
              />
            </TableHead>
            <TableHead>Equipa</TableHead>
            <TableHead>Coordenador</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>RGPD</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selected.has(team.id)}
                  onChange={() => toggle(team.id)}
                  className="size-4 accent-primary"
                />
              </TableCell>
              <TableCell className="font-medium">
                {team.name}
                {team.duplicateFlag && (
                  <span
                    className="block text-[10px] text-orange-400 mt-0.5"
                    title={team.duplicateFlag}
                  >
                    ⚠{" "}
                    {team.duplicateFlag.length > 60
                      ? team.duplicateFlag.slice(0, 60) + "..."
                      : team.duplicateFlag}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div>{team.coordinatorName}</div>
                <div className="text-xs text-muted-foreground">
                  {team.coordinatorEmail}
                </div>
              </TableCell>
              <TableCell>{team.location}</TableCell>
              <TableCell>
                {team.rgpdConsent ? (
                  <Badge
                    variant="secondary"
                    className="bg-primary/20 text-primary"
                  >
                    OK
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-500/20 text-yellow-400"
                  >
                    Pendente
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Link href={`/admin/equipas/${team.id}`}>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </Link>
                  <Link href={`/admin/transferir/${team.id}`}>
                    <Button variant="ghost" size="sm">
                      Transferir
                    </Button>
                  </Link>
                  <form action={deleteAction}>
                    <input type="hidden" name="teamId" value={team.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      Apagar
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
