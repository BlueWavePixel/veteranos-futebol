import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { count, eq, or, asc, desc, and, inArray, sql } from "drizzle-orm";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth/session";
import { del } from "@vercel/blob";
import { logAudit } from "@/lib/audit";
import { recalculateDuplicateFlags } from "@/lib/recalculate-flags";
import { createMagicLink, APPROVAL_TOKEN_EXPIRY_MINUTES } from "@/lib/auth/magic-link";
import { getSessionCsrf, requireCsrf } from "@/lib/security/csrf";
import { sendTeamApprovedEmail } from "@/lib/email/send-magic-link";
import {
  notifyOtherAdminsTeamApproved,
  notifyOtherAdminsTeamRejected,
} from "@/lib/email/send-notification";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminTeamTable } from "@/components/admin/admin-team-table";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; inativos?: string; pendentes?: string; ordem?: string }>;
}) {
  const adminUser = await requireAdmin();
  const csrf = await getSessionCsrf();

  async function deleteTeam(formData: FormData) {
    "use server";
    await requireCsrf(formData);
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

    await recalculateDuplicateFlags();
    redirect("/admin");
  }

  async function bulkDeleteTeams(formData: FormData) {
    "use server";
    await requireCsrf(formData);
    const adminUser = await requireAdmin();
    const ids = (formData.get("teamIds") as string).split(",").filter(Boolean);

    if (ids.length === 0) return;

    await db
      .update(teams)
      .set({ isActive: false, updatedAt: new Date() })
      .where(inArray(teams.id, ids));

    for (const teamId of ids) {
      await logAudit({
        actorType: adminUser.role === "super_admin" ? "super_admin" : "moderator",
        actorEmail: adminUser.email,
        action: "team_deleted_by_admin",
        teamId,
      });
    }

    await recalculateDuplicateFlags();
    redirect("/admin");
  }

  async function reactivateTeams(formData: FormData) {
    "use server";
    await requireCsrf(formData);
    const adminUser = await requireAdmin();
    const ids = (formData.get("teamIds") as string).split(",").filter(Boolean);

    if (ids.length === 0) return;

    await db
      .update(teams)
      .set({ isActive: true, updatedAt: new Date() })
      .where(inArray(teams.id, ids));

    for (const teamId of ids) {
      await logAudit({
        actorType: adminUser.role === "super_admin" ? "super_admin" : "moderator",
        actorEmail: adminUser.email,
        action: "team_reactivated_by_admin",
        teamId,
      });
    }

    await recalculateDuplicateFlags();
    redirect("/admin?inativos=1");
  }

  async function permanentDeleteTeams(formData: FormData) {
    "use server";
    await requireCsrf(formData);
    const adminUser = await requireSuperAdmin();
    const ids = (formData.get("teamIds") as string).split(",").filter(Boolean);

    if (ids.length === 0) return;

    // Buscar logos para limpar do Blob
    const toDelete = await db
      .select({ id: teams.id, logoUrl: teams.logoUrl })
      .from(teams)
      .where(inArray(teams.id, ids));

    const blobUrls = toDelete
      .map((t) => t.logoUrl)
      .filter((url): url is string => !!url && url.includes("blob.vercel-storage.com"));

    // Apagar logos do Vercel Blob
    if (blobUrls.length > 0) {
      try {
        await del(blobUrls);
      } catch {
        // Continuar mesmo se falhar a limpeza do blob
      }
    }

    // Log audit BEFORE deleting (FK constraint: team must exist)
    for (const teamId of ids) {
      await logAudit({
        actorType: "super_admin",
        actorEmail: adminUser.email,
        action: "team_permanently_deleted",
        teamId,
      });
    }

    // DELETE permanente da BD
    await db.delete(teams).where(inArray(teams.id, ids));

    await recalculateDuplicateFlags();
    redirect("/admin?inativos=1");
  }

  async function approveTeams(formData: FormData) {
    "use server";
    await requireCsrf(formData);
    const adminUser = await requireAdmin();
    const ids = (formData.get("teamIds") as string).split(",").filter(Boolean);

    if (ids.length === 0) return;

    await db
      .update(teams)
      .set({
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: adminUser.email,
        updatedAt: new Date(),
      })
      .where(inArray(teams.id, ids));

    // Send magic link to each approved team's coordinator
    for (const teamId of ids) {
      const [team] = await db
        .select({ email: teams.coordinatorEmail, name: teams.name })
        .from(teams)
        .where(eq(teams.id, teamId));

      if (team?.email) {
        // Approval emails get 7-day expiry — coordinator may not check email immediately
        const magicLink = await createMagicLink(team.email, APPROVAL_TOKEN_EXPIRY_MINUTES);
        if (magicLink) {
          const expiryDays = Math.round(APPROVAL_TOKEN_EXPIRY_MINUTES / (60 * 24));
          await sendTeamApprovedEmail(team.email, magicLink, team.name, expiryDays);
        }

        // Audit trail: notify OTHER admins (not the one who approved)
        await notifyOtherAdminsTeamApproved({
          actorEmail: adminUser.email,
          actorName: adminUser.name,
          actorRole: adminUser.role,
          teamName: team.name,
          coordinatorEmail: team.email,
        });
      }

      await logAudit({
        actorType: adminUser.role === "super_admin" ? "super_admin" : "moderator",
        actorEmail: adminUser.email,
        action: "team_approved",
        teamId,
      });
    }

    redirect("/admin?pendentes=1");
  }

  async function rejectTeams(formData: FormData) {
    "use server";
    await requireCsrf(formData);
    const adminUser = await requireAdmin();
    const ids = (formData.get("teamIds") as string).split(",").filter(Boolean);

    if (ids.length === 0) return;

    // Fetch team names BEFORE inativating (for notification)
    const rejectedTeams = await db
      .select({ name: teams.name })
      .from(teams)
      .where(inArray(teams.id, ids));

    await db
      .update(teams)
      .set({ isActive: false, updatedAt: new Date() })
      .where(inArray(teams.id, ids));

    for (const teamId of ids) {
      await logAudit({
        actorType: adminUser.role === "super_admin" ? "super_admin" : "moderator",
        actorEmail: adminUser.email,
        action: "team_rejected",
        teamId,
      });
    }

    // Audit trail: notify OTHER admins
    if (rejectedTeams.length > 0) {
      await notifyOtherAdminsTeamRejected({
        actorEmail: adminUser.email,
        actorName: adminUser.name,
        actorRole: adminUser.role,
        teamNames: rejectedTeams.map((t) => t.name),
      });
    }

    redirect("/admin?pendentes=1");
  }

  const { page: pageParam, q: rawQ, inativos, pendentes, ordem } = await searchParams;
  const q = rawQ?.replace(/\s+/g, " ").trim() || undefined;
  const showInactive = inativos === "1";
  const showPending = pendentes === "1";
  const sortBy = ordem || "nome"; // "nome" | "data" | "data_asc"
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Build search conditions — unaccent for accent-insensitive search
  const searchConditions = [];
  if (q) {
    const pattern = `%${q}%`;
    searchConditions.push(
      or(
        sql`unaccent(${teams.name}) ilike unaccent(${pattern})`,
        sql`unaccent(${teams.coordinatorName}) ilike unaccent(${pattern})`,
        sql`unaccent(${teams.coordinatorEmail}) ilike unaccent(${pattern})`,
        sql`unaccent(coalesce(${teams.location}, '')) ilike unaccent(${pattern})`,
        sql`unaccent(coalesce(${teams.concelho}, '')) ilike unaccent(${pattern})`,
        sql`unaccent(coalesce(${teams.distrito}, '')) ilike unaccent(${pattern})`,
      )!,
    );
  }
  if (showPending) {
    searchConditions.push(eq(teams.isApproved, false));
    searchConditions.push(eq(teams.isActive, true));
  } else {
    // Filter by active/inactive
    searchConditions.push(eq(teams.isActive, !showInactive));
  }
  const conditions = searchConditions;

  // Build where clause
  const whereClause =
    conditions.length > 1
      ? and(...conditions)
      : conditions.length === 1
        ? conditions[0]
        : undefined;

  // Sort order
  const orderClause =
    sortBy === "data" ? desc(teams.createdAt) :
    sortBy === "data_asc" ? asc(teams.createdAt) :
    asc(teams.name);

  // Get paginated teams
  const allTeams = await db
    .select()
    .from(teams)
    .where(whereClause)
    .orderBy(orderClause)
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

  const [{ pendingApproval }] = await db
    .select({ pendingApproval: count() })
    .from(teams)
    .where(and(eq(teams.isApproved, false), eq(teams.isActive, true)));

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
    if (showInactive) params.set("inativos", "1");
    if (showPending) params.set("pendentes", "1");
    if (sortBy !== "nome") params.set("ordem", sortBy);
    params.set("page", page.toString());
    return `/admin?${params.toString()}`;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono text-primary">
              {totalActive}
            </p>
            <p className="text-sm text-muted-foreground">Equipas Ativas</p>
          </CardContent>
        </Card>
        <Link href="/admin?pendentes=1">
          <Card className={pendingApproval > 0 ? "border-orange-500/50 bg-orange-500/5" : ""}>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold font-mono text-orange-500">
                {pendingApproval}
              </p>
              <p className="text-sm text-muted-foreground">Aguardam Aprovação</p>
            </CardContent>
          </Card>
        </Link>
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
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle>Todas as Equipas</CardTitle>
              <form action="/admin" method="GET" className="w-full sm:w-auto">
                {showPending && <input type="hidden" name="pendentes" value="1" />}
                {showInactive && <input type="hidden" name="inativos" value="1" />}
                {sortBy !== "nome" && <input type="hidden" name="ordem" value={sortBy} />}
                <Input
                  name="q"
                  placeholder="Pesquisar equipa, coordenador, email..."
                  defaultValue={q || ""}
                  className="w-full sm:w-[300px]"
                />
              </form>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
              <Link href={showPending ? "/admin" : "/admin?pendentes=1"}>
                <Button
                  variant={showPending ? "default" : "outline"}
                  size="sm"
                  className={`whitespace-nowrap ${!showPending && pendingApproval > 0 ? "border-orange-500/50 text-orange-500" : ""}`}
                >
                  {showPending ? "Todos" : `Pendentes${pendingApproval > 0 ? ` (${pendingApproval})` : ""}`}
                </Button>
              </Link>
              <Link href="/admin/duplicados">
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  Duplicados
                </Button>
              </Link>
              <Link href={showInactive ? "/admin" : "/admin?inativos=1"}>
                <Button
                  variant={showInactive ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {showInactive ? "Ativas" : "Inativos"}
                </Button>
              </Link>
              <Link href={sortBy === "nome" ? "/admin?ordem=data" : sortBy === "data" ? "/admin?ordem=data_asc" : "/admin"}>
                <Button
                  variant={sortBy !== "nome" ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {sortBy === "data" ? "Mais recentes" : sortBy === "data_asc" ? "Mais antigas" : "Por data"}
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {q && (
            <p className="text-sm text-muted-foreground mb-4">
              {totalFiltered} resultado{totalFiltered !== 1 ? "s" : ""} para &quot;{q}&quot;
              {" · "}
              <Link href="/admin" className="text-primary hover:underline">
                Limpar pesquisa
              </Link>
            </p>
          )}
          <AdminTeamTable
            teams={allTeams}
            deleteAction={deleteTeam}
            bulkDeleteAction={bulkDeleteTeams}
            reactivateAction={reactivateTeams}
            permanentDeleteAction={permanentDeleteTeams}
            approveAction={approveTeams}
            rejectAction={rejectTeams}
            isInactiveView={showInactive}
            isDuplicatesView={false}
            isPendingView={showPending}
            isSuperAdmin={adminUser.role === "super_admin"}
            csrfToken={csrf}
          />

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
