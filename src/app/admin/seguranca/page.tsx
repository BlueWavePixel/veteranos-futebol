import { db } from "@/lib/db";
import { securityLog } from "@/lib/db/schema";
import { desc, eq, count, sql, isNull, isNotNull, and, inArray } from "drizzle-orm";
import { requireSuperAdmin } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  honeypot_triggered: { label: "Honeypot", color: "bg-red-500/20 text-red-400" },
  suspicious_registration: { label: "Registo Suspeito", color: "bg-orange-500/20 text-orange-400" },
  captcha_failed: { label: "CAPTCHA Falhou", color: "bg-yellow-500/20 text-yellow-400" },
  rate_limit_hit: { label: "Rate Limit", color: "bg-purple-500/20 text-purple-400" },
  login_success: { label: "Login", color: "bg-green-500/20 text-green-400" },
  login_failed: { label: "Login Falhou", color: "bg-red-500/20 text-red-400" },
  magic_link_sent: { label: "Magic Link", color: "bg-blue-500/20 text-blue-400" },
  team_approved: { label: "Equipa Aprovada", color: "bg-green-500/20 text-green-400" },
  team_rejected: { label: "Equipa Rejeitada", color: "bg-red-500/20 text-red-400" },
};

const THREAT_TYPES = new Set([
  "honeypot_triggered", "suspicious_registration", "captcha_failed",
  "login_failed", "rate_limit_hit", "token_invalid",
]);

export default async function SegurancaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tipo?: string; resolvidos?: string }>;
}) {
  const adminUser = await requireSuperAdmin();

  async function resolveEvent(formData: FormData) {
    "use server";
    const admin = await requireSuperAdmin();
    const eventId = formData.get("eventId") as string;
    if (eventId) {
      await db.update(securityLog)
        .set({ resolvedAt: new Date(), resolvedBy: admin.email })
        .where(eq(securityLog.id, eventId));
    }
    redirect("/admin/seguranca");
  }

  async function resolveAllThreats(formData: FormData) {
    "use server";
    const admin = await requireSuperAdmin();
    const ids = (formData.get("eventIds") as string).split(",").filter(Boolean);
    if (ids.length > 0) {
      await db.update(securityLog)
        .set({ resolvedAt: new Date(), resolvedBy: admin.email })
        .where(inArray(securityLog.id, ids));
    }
    redirect("/admin/seguranca");
  }

  const { page: pageParam, tipo, resolvidos } = await searchParams;
  const showResolved = resolvidos === "1";
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const conditions = [];
  if (tipo) conditions.push(eq(securityLog.eventType, tipo));
  if (showResolved) {
    conditions.push(isNotNull(securityLog.resolvedAt));
  } else {
    conditions.push(isNull(securityLog.resolvedAt));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Count unresolved threats
  const [{ unresolvedThreats }] = await db
    .select({ unresolvedThreats: count() })
    .from(securityLog)
    .where(
      and(
        isNull(securityLog.resolvedAt),
        sql`${securityLog.eventType} IN ('honeypot_triggered', 'suspicious_registration', 'captcha_failed', 'login_failed', 'rate_limit_hit', 'token_invalid')`,
      ),
    );

  const logs = await db
    .select()
    .from(securityLog)
    .where(whereClause)
    .orderBy(desc(securityLog.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(securityLog)
    .where(whereClause);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Stats by event type (respect resolved filter)
  const statsWhere = showResolved ? isNotNull(securityLog.resolvedAt) : isNull(securityLog.resolvedAt);
  const stats = await db
    .select({
      eventType: securityLog.eventType,
      total: count(),
    })
    .from(securityLog)
    .where(statsWhere)
    .groupBy(securityLog.eventType)
    .orderBy(desc(count()));

  // Daily activity for chart (last 30 days)
  const dailyRaw = await db.execute(sql`
    SELECT
      date_trunc('day', created_at)::date as day,
      count(*) filter (where event_type = 'login_success') as logins,
      count(*) filter (where event_type = 'magic_link_sent') as magic_links,
      count(*) filter (where event_type IN ('captcha_failed', 'honeypot_triggered', 'suspicious_registration', 'login_failed')) as threats
    FROM security_log
    WHERE created_at > now() - interval '30 days'
    GROUP BY day
    ORDER BY day ASC
  `);

  const dailyData = (dailyRaw.rows as Array<{ day: string; logins: string; magic_links: string; threats: string }>).map((r) => ({
    day: new Date(r.day).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }),
    logins: parseInt(r.logins) || 0,
    magicLinks: parseInt(r.magic_links) || 0,
    threats: parseInt(r.threats) || 0,
  }));

  const maxValue = Math.max(1, ...dailyData.map((d) => d.logins + d.magicLinks + d.threats));

  // Summary stats
  const totalLogins = dailyData.reduce((sum, d) => sum + d.logins, 0);
  const totalMagicLinks = dailyData.reduce((sum, d) => sum + d.magicLinks, 0);
  const totalThreats = dailyData.reduce((sum, d) => sum + d.threats, 0);
  const todayData = dailyData[dailyData.length - 1];

  function pageUrl(page: number) {
    const params = new URLSearchParams();
    if (tipo) params.set("tipo", tipo);
    params.set("page", page.toString());
    return `/admin/seguranca?${params.toString()}`;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Registo de Segurança</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono text-green-500">{todayData?.logins ?? 0}</p>
            <p className="text-xs text-muted-foreground">Logins hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono text-primary">{totalLogins}</p>
            <p className="text-xs text-muted-foreground">Logins (30 dias)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono text-blue-500">{totalMagicLinks}</p>
            <p className="text-xs text-muted-foreground">Magic Links (30 dias)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className={`text-3xl font-bold font-mono ${totalThreats > 0 ? "text-red-500" : "text-muted-foreground"}`}>{totalThreats}</p>
            <p className="text-xs text-muted-foreground">Ameaças (30 dias)</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily activity chart */}
      {dailyData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Atividade diária (últimos 30 dias)</CardTitle>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-green-500" /> Logins
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" /> Magic Links
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-red-500" /> Ameaças
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-[3px] h-40 overflow-x-auto pb-6 relative">
              {dailyData.map((d, i) => {
                const loginH = (d.logins / maxValue) * 100;
                const mlH = (d.magicLinks / maxValue) * 100;
                const threatH = (d.threats / maxValue) * 100;
                const totalDay = d.logins + d.magicLinks + d.threats;
                return (
                  <div key={i} className="flex flex-col items-center gap-0 flex-1 min-w-[18px] group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap z-10 shadow-lg">
                      <p className="font-semibold">{d.day}</p>
                      {d.logins > 0 && <p className="text-green-400">{d.logins} logins</p>}
                      {d.magicLinks > 0 && <p className="text-blue-400">{d.magicLinks} magic links</p>}
                      {d.threats > 0 && <p className="text-red-400">{d.threats} ameaças</p>}
                    </div>
                    {/* Stacked bar */}
                    <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${Math.max(2, ((loginH + mlH + threatH) / 100) * 144)}px` }}>
                      {d.logins > 0 && (
                        <div className="w-full bg-green-500/80 hover:bg-green-500 transition-colors" style={{ height: `${(d.logins / totalDay) * 100}%` }} />
                      )}
                      {d.magicLinks > 0 && (
                        <div className="w-full bg-blue-500/80 hover:bg-blue-500 transition-colors" style={{ height: `${(d.magicLinks / totalDay) * 100}%` }} />
                      )}
                      {d.threats > 0 && (
                        <div className="w-full bg-red-500/80 hover:bg-red-500 transition-colors" style={{ height: `${(d.threats / totalDay) * 100}%` }} />
                      )}
                    </div>
                    {/* Day label */}
                    <span className="text-[9px] text-muted-foreground mt-1 rotate-[-45deg] origin-top-left absolute -bottom-5 left-1/2">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unresolved threats alert */}
      {unresolvedThreats > 0 && (
        <Card className="mb-6 border-red-500/50 bg-red-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-400">
                {unresolvedThreats} ameaça{unresolvedThreats !== 1 ? "s" : ""} por resolver
              </p>
              <p className="text-xs text-muted-foreground">
                Revê cada evento e marca como resolvido.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event type filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/admin/seguranca">
          <Badge variant={!tipo ? "default" : "outline"} className="cursor-pointer">
            Todos ({total})
          </Badge>
        </Link>
        {stats.map((s) => {
          const info = EVENT_LABELS[s.eventType] || { label: s.eventType, color: "" };
          return (
            <Link key={s.eventType} href={`/admin/seguranca?tipo=${s.eventType}${showResolved ? "&resolvidos=1" : ""}`}>
              <Badge
                variant="secondary"
                className={`cursor-pointer ${tipo === s.eventType ? "ring-2 ring-primary" : ""} ${info.color}`}
              >
                {info.label} ({s.total})
              </Badge>
            </Link>
          );
        })}
        <Link href={showResolved ? "/admin/seguranca" : "/admin/seguranca?resolvidos=1"}>
          <Badge variant="outline" className={`cursor-pointer ${showResolved ? "ring-2 ring-primary" : ""}`}>
            {showResolved ? "Esconder resolvidos" : "Mostrar resolvidos"}
          </Badge>
        </Link>
      </div>

      {/* Log entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {tipo ? (EVENT_LABELS[tipo]?.label || tipo) : "Todos os eventos"}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({total} registos)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum evento registado.
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const info = EVENT_LABELS[log.eventType] || {
                  label: log.eventType,
                  color: "bg-muted text-muted-foreground",
                };
                const details = log.details as Record<string, unknown> | null;
                const isThreat = THREAT_TYPES.has(log.eventType);
                const isResolved = !!log.resolvedAt;

                return (
                  <div
                    key={log.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border ${
                      isThreat && !isResolved
                        ? "border-red-500/30 bg-red-500/5"
                        : isResolved
                          ? "border-border/20 bg-muted/10 opacity-60"
                          : "border-border/40 bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="secondary" className={`shrink-0 ${info.color}`}>
                        {info.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString("pt-PT", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </span>
                      {isResolved && (
                        <Badge variant="outline" className="text-[10px] shrink-0 opacity-70">
                          Resolvido
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {log.email && (
                        <span className="text-sm font-medium mr-2">{log.email}</span>
                      )}
                      {log.ip && (
                        <span className="text-xs text-muted-foreground mr-2">
                          IP: {log.ip}
                        </span>
                      )}
                      {details && (
                        <span className="text-xs text-muted-foreground break-all">
                          {Object.entries(details)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </span>
                      )}
                    </div>
                    {isThreat && !isResolved && (
                      <form action={resolveEvent} className="shrink-0">
                        <input type="hidden" name="eventId" value={log.id} />
                        <Button type="submit" variant="outline" size="sm" className="text-xs">
                          Resolvido
                        </Button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
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
