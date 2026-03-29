import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { count, eq, ilike, or, asc, isNotNull, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; duplicados?: string }>;
}) {
  await requireAdmin();

  async function deleteTeam(formData: FormData) {
    "use server";
    const adminUser = await requireAdmin();
    const teamId = formData.get("teamId") as string;

    await db
      .update(teams)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(teams.id, teamId));

    await logAudit({
      actorType: adminUser.role === "super_admin" ? "super_admin" : "moderator",
      actorEmail: adminUser.email,
      action: "team_deleted_by_admin",
      teamId,
    });

    redirect("/admin");
  }

  const { page: pageParam, q, duplicados } = await searchParams;
  const showDuplicates = duplicados === "1";
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Build search conditions
  const searchConditions = [];
  if (q) {
    searchConditions.push(
      or(
        ilike(teams.name, `%${q}%`),
        ilike(teams.coordinatorName, `%${q}%`),
        ilike(teams.coordinatorEmail, `%${q}%`),
        ilike(teams.location, `%${q}%`)
      )!
    );
  }
  if (showDuplicates) {
    searchConditions.push(isNotNull(teams.duplicateFlag));
  }
  // Always filter active teams by default
  searchConditions.push(eq(teams.isActive, true));
  const conditions = searchConditions;

  // Build where clause
  const whereClause =
    conditions.length > 1
      ? and(...conditions)
      : conditions.length === 1
        ? conditions[0]
        : undefined;

  // Get paginated teams
  const allTeams = await db
    .select()
    .from(teams)
    .where(whereClause)
    .orderBy(asc(teams.name))
    .limit(PAGE_SIZE)
    .offset(offset);

  // Get total count for pagination
  const [{ totalFiltered }] = await db
    .select({ totalFiltered: count() })
    .from(teams)
    .where(whereClause);

  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

  // Stats
  const [{ totalActive }] = await db
    .select({ totalActive: count() })
    .from(teams)
    .where(eq(teams.isActive, true));

  const [{ pending }] = await db
    .select({ pending: count() })
    .from(teams)
    .where(eq(teams.rgpdConsent, false));

  const [{ totalAll }] = await db
    .select({ totalAll: count() })
    .from(teams);

  // Build search URL helper
  function pageUrl(page: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (showDuplicates) params.set("duplicados", "1");
    params.set("page", page.toString());
    return `/admin?${params.toString()}`;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono text-primary">
              {totalActive}
            </p>
            <p className="text-sm text-muted-foreground">Equipas Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono text-yellow-500">
              {pending}
            </p>
            <p className="text-sm text-muted-foreground">RGPD Pendente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono">{totalAll}</p>
            <p className="text-sm text-muted-foreground">
              Total (incl. inativas)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Todas as Equipas</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <form action="/admin" method="GET" className="flex-1 sm:flex-initial">
                <Input
                  name="q"
                  placeholder="Pesquisar equipa, coordenador, email..."
                  defaultValue={q || ""}
                  className="w-full sm:w-[300px]"
                />
              </form>
              <Link href={showDuplicates ? "/admin" : "/admin?duplicados=1"}>
                <Button
                  variant={showDuplicates ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {showDuplicates ? "Todos" : "Duplicados"}
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {q && (
            <p className="text-sm text-muted-foreground mb-4">
              {totalFiltered} resultado{totalFiltered !== 1 ? "s" : ""} para &quot;{q}&quot;
              {" — "}
              <Link href="/admin" className="text-primary hover:underline">
                Limpar pesquisa
              </Link>
            </p>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipa</TableHead>
                <TableHead>Coordenador</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>RGPD</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">
                    {team.name}
                    {team.duplicateFlag && (
                      <span
                        className="block text-[10px] text-orange-400 mt-0.5"
                        title={team.duplicateFlag}
                      >
                        ⚠ {team.duplicateFlag.length > 60
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
                      <form action={deleteTeam}>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} ({totalFiltered} equipas)
              </p>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link href={pageUrl(currentPage - 1)}>
                    <Button variant="outline" size="sm">
                      Anterior
                    </Button>
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link href={pageUrl(currentPage + 1)}>
                    <Button variant="outline" size="sm">
                      Seguinte
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
