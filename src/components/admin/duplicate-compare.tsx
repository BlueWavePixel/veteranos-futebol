"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Team, DuplicatePair } from "@/lib/db/schema";

function countFilledFields(team: Team): number {
  const optionalFields: (keyof Team)[] = [
    "coordinatorPhone", "coordinatorAltName", "coordinatorAltPhone",
    "logoUrl", "fieldName", "fieldAddress", "location", "localidade",
    "concelho", "kitPrimary", "kitPrimaryShirt", "kitPrimaryShorts",
    "kitSecondarySocks", "socialFacebook", "socialInstagram",
    "latitude", "longitude",
  ];
  return optionalFields.filter((f) => {
    const v = team[f];
    return v !== null && v !== undefined && v !== "";
  }).length;
}

function getRecommendedId(teamA: Team, teamB: Team): string {
  const aUpdated = teamA.updatedAt?.getTime() ?? 0;
  const bUpdated = teamB.updatedAt?.getTime() ?? 0;
  if (aUpdated !== bUpdated) return aUpdated > bUpdated ? teamA.id : teamB.id;
  return countFilledFields(teamA) >= countFilledFields(teamB) ? teamA.id : teamB.id;
}

const REASON_LABELS: Record<string, string> = {
  email: "Mesmo Email",
  phone: "Mesmo Telefone",
  phone_normalized: "Telefone (normalizado)",
  name_exact: "Nome Exato",
  name_fuzzy: "Nome Semelhante",
  geo_proximity: "Proximidade Geográfica",
  name_equals_coordinator: "Nome = Coordenador",
};

const REASON_COLORS: Record<string, string> = {
  email: "bg-red-500/20 text-red-400",
  phone: "bg-orange-500/20 text-orange-400",
  phone_normalized: "bg-orange-500/20 text-orange-400",
  name_exact: "bg-yellow-500/20 text-yellow-400",
  name_fuzzy: "bg-yellow-500/20 text-yellow-400",
  geo_proximity: "bg-blue-500/20 text-blue-400",
  name_equals_coordinator: "bg-purple-500/20 text-purple-400",
};

type Props = {
  pair: DuplicatePair;
  teamA: Team;
  teamB: Team;
  resolveNotDuplicateAction: (formData: FormData) => Promise<void>;
  resolveConfirmedAction: (formData: FormData) => Promise<void>;
  mergeAction: (formData: FormData) => Promise<void>;
};

function CompareField({
  label,
  valueA,
  valueB,
}: {
  label: string;
  valueA: string | null | undefined;
  valueB: string | null | undefined;
}) {
  const a = valueA || "-";
  const b = valueB || "-";
  const isDifferent = a !== b;

  return (
    <div className="grid grid-cols-[120px_1fr_1fr] gap-2 py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span
        className={`text-xs break-all ${isDifferent ? "text-orange-400 font-medium" : ""}`}
      >
        {a}
      </span>
      <span
        className={`text-xs break-all ${isDifferent ? "text-orange-400 font-medium" : ""}`}
      >
        {b}
      </span>
    </div>
  );
}

export function DuplicateCompare({
  pair,
  teamA,
  teamB,
  resolveNotDuplicateAction,
  resolveConfirmedAction,
  mergeAction,
}: Props) {
  const isSelfCheck = teamA.id === teamB.id;
  const [primaryId, setPrimaryId] = useState<string>(
    isSelfCheck ? teamA.id : getRecommendedId(teamA, teamB)
  );

  const filledA = countFilledFields(teamA);
  const filledB = countFilledFields(teamB);
  const isAMoreRecent = (teamA.updatedAt?.getTime() ?? 0) > (teamB.updatedAt?.getTime() ?? 0);
  const isBMoreRecent = (teamB.updatedAt?.getTime() ?? 0) > (teamA.updatedAt?.getTime() ?? 0);
  const recommendedId = isSelfCheck ? teamA.id : getRecommendedId(teamA, teamB);

  const secondaryId = primaryId === teamA.id ? teamB.id : teamA.id;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base">
              {isSelfCheck
                ? teamA.name
                : `${teamA.name} / ${teamB.name}`}
            </CardTitle>
            <Badge
              variant="secondary"
              className={REASON_COLORS[pair.reason] || ""}
            >
              {REASON_LABELS[pair.reason] || pair.reason}
            </Badge>
            <Badge variant="outline">
              {Math.round(pair.similarityScore * 100)}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isSelfCheck ? (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              O nome da equipa é igual ao nome do coordenador. Pode ser um
              registo pessoal em vez de uma equipa.
            </p>
            <div className="mt-2 space-y-1">
              <CompareField
                label="Nome"
                valueA={teamA.name}
                valueB={null}
              />
              <CompareField
                label="Coordenador"
                valueA={teamA.coordinatorName}
                valueB={null}
              />
              <CompareField
                label="Email"
                valueA={teamA.coordinatorEmail}
                valueB={null}
              />
              <CompareField
                label="Telefone"
                valueA={teamA.coordinatorPhone}
                valueB={null}
              />
            </div>
          </div>
        ) : (
          <div className="mb-4">
            {/* Side-by-side comparison header */}
            <div className="grid grid-cols-[120px_1fr_1fr] gap-2 pb-2 mb-2 border-b border-border">
              <span />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted-foreground">Equipa A</span>
                <div className="flex flex-wrap gap-1">
                  {teamA.id === recommendedId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-semibold">
                      Sugerida
                    </span>
                  )}
                  {isAMoreRecent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      Mais recente
                    </span>
                  )}
                  {filledA > filledB && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                      Mais completa ({filledA})
                    </span>
                  )}
                  {filledA === filledB && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-border text-muted-foreground">
                      {filledA} campos
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted-foreground">Equipa B</span>
                <div className="flex flex-wrap gap-1">
                  {teamB.id === recommendedId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-semibold">
                      Sugerida
                    </span>
                  )}
                  {isBMoreRecent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      Mais recente
                    </span>
                  )}
                  {filledB > filledA && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                      Mais completa ({filledB})
                    </span>
                  )}
                  {filledA === filledB && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-border text-muted-foreground">
                      {filledB} campos
                    </span>
                  )}
                </div>
              </div>
            </div>

            <CompareField
              label="Nome"
              valueA={teamA.name}
              valueB={teamB.name}
            />
            <CompareField
              label="Localidade"
              valueA={teamA.location || teamA.localidade}
              valueB={teamB.location || teamB.localidade}
            />
            <CompareField
              label="Concelho"
              valueA={teamA.concelho}
              valueB={teamB.concelho}
            />
            <CompareField
              label="Coordenador"
              valueA={teamA.coordinatorName}
              valueB={teamB.coordinatorName}
            />
            <CompareField
              label="Telefone"
              valueA={teamA.coordinatorPhone}
              valueB={teamB.coordinatorPhone}
            />
            <CompareField
              label="Email"
              valueA={teamA.coordinatorEmail}
              valueB={teamB.coordinatorEmail}
            />
            <CompareField
              label="Campo"
              valueA={teamA.fieldName}
              valueB={teamB.fieldName}
            />
            <CompareField
              label="Kit Principal"
              valueA={teamA.kitPrimary}
              valueB={teamB.kitPrimary}
            />
            <CompareField
              label="Facebook"
              valueA={teamA.socialFacebook}
              valueB={teamB.socialFacebook}
            />
            <CompareField
              label="Instagram"
              valueA={teamA.socialInstagram}
              valueB={teamB.socialInstagram}
            />
            <CompareField
              label="Criado em"
              valueA={teamA.createdAt?.toLocaleDateString("pt-PT")}
              valueB={teamB.createdAt?.toLocaleDateString("pt-PT")}
            />
            <CompareField
              label="Atualizado em"
              valueA={teamA.updatedAt?.toLocaleDateString("pt-PT")}
              valueB={teamB.updatedAt?.toLocaleDateString("pt-PT")}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-border/50">
          {!isSelfCheck && (
            <div className="flex items-center gap-2 mr-auto">
              <span className="text-xs text-muted-foreground">Principal:</span>
              <label className="flex items-center gap-1 text-xs cursor-pointer">
                <input
                  type="radio"
                  name={`primary-${pair.id}`}
                  value={teamA.id}
                  checked={primaryId === teamA.id}
                  onChange={() => setPrimaryId(teamA.id)}
                  className="accent-primary"
                />
                {teamA.name.length > 20
                  ? teamA.name.slice(0, 20) + "..."
                  : teamA.name}
              </label>
              <label className="flex items-center gap-1 text-xs cursor-pointer">
                <input
                  type="radio"
                  name={`primary-${pair.id}`}
                  value={teamB.id}
                  checked={primaryId === teamB.id}
                  onChange={() => setPrimaryId(teamB.id)}
                  className="accent-primary"
                />
                {teamB.name.length > 20
                  ? teamB.name.slice(0, 20) + "..."
                  : teamB.name}
              </label>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <form action={resolveNotDuplicateAction}>
              <input type="hidden" name="pairId" value={pair.id} />
              <Button type="submit" variant="outline" size="sm">
                Não é Duplicado
              </Button>
            </form>

            <form action={resolveConfirmedAction}>
              <input type="hidden" name="pairId" value={pair.id} />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
              >
                Confirmar Duplicado
              </Button>
            </form>

            {!isSelfCheck && (
              <form action={mergeAction}>
                <input type="hidden" name="pairId" value={pair.id} />
                <input type="hidden" name="primaryId" value={primaryId} />
                <input type="hidden" name="secondaryId" value={secondaryId} />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary"
                >
                  Merge
                </Button>
              </form>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
