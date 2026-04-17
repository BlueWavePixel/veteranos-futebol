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
  approveAction?: (formData: FormData) => Promise<void>;
  rejectAction?: (formData: FormData) => Promise<void>;
  isInactiveView?: boolean;
  isDuplicatesView?: boolean;
  isPendingView?: boolean;
  isSuperAdmin?: boolean;
};

export function AdminTeamTable({
  teams,
  deleteAction,
  bulkDeleteAction,
  reactivateAction,
  permanentDeleteAction,
  approveAction,
  rejectAction,
  isInactiveView = false,
  isDuplicatesView = false,
  isPendingView = false,
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
            {isPendingView && approveAction && rejectAction ? (
              <>
                <form action={approveAction}>
                  <input
                    type="hidden"
                    name="teamIds"
                    value={Array.from(selected).join(",")}
                  />
                  <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                    Aprovar ({selected.size})
                  </Button>
                </form>
                <form action={rejectAction}>
                  <input
                    type="hidden"
                    name="teamIds"
                    value={Array.from(selected).join(",")}
                  />
                  <Button type="submit" variant="destructive" size="sm">
                    Rejeitar ({selected.size})
                  </Button>
                </form>
              </>
            ) : isInactiveView && reactivateAction ? (
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
            <TableHead>Registo</TableHead>
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
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {team.createdAt
                  ? new Date(team.createdAt).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })
                  : "-"}
              </TableCell>
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
                  {isPendingView && approveAction && (
                    <form action={approveAction}>
                      <input type="hidden" name="teamIds" value={team.id} />
                      <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                        Aprovar
                      </Button>
                    </form>
                  )}
                  <Link href={`/admin/equipas/${team.id}`}>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </Link>
                  {!isPendingView && (
                    <Link href={`/admin/transferir/${team.id}`}>
                      <Button variant="ghost" size="sm">
                        Transferir
                      </Button>
                    </Link>
                  )}
                  <form action={isPendingView && rejectAction ? rejectAction : deleteAction}>
                    <input type="hidden" name={isPendingView ? "teamIds" : "teamId"} value={team.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      {isPendingView ? "Rejeitar" : "Apagar"}
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
