import { db } from "@/lib/db";
import { securityLog } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { requireSuperAdmin } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

export default async function SegurancaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tipo?: string }>;
}) {
  await requireSuperAdmin();

  const { page: pageParam, tipo } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const whereClause = tipo ? eq(securityLog.eventType, tipo) : undefined;

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

  // Stats by event type
  const stats = await db
    .select({
      eventType: securityLog.eventType,
      total: count(),
    })
    .from(securityLog)
    .groupBy(securityLog.eventType)
    .orderBy(desc(count()));

  function pageUrl(page: number) {
    const params = new URLSearchParams();
    if (tipo) params.set("tipo", tipo);
    params.set("page", page.toString());
    return `/admin/seguranca?${params.toString()}`;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Registo de Segurança</h1>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/admin/seguranca">
          <Badge variant={!tipo ? "default" : "outline"} className="cursor-pointer">
            Todos ({total})
          </Badge>
        </Link>
        {stats.map((s) => {
          const info = EVENT_LABELS[s.eventType] || { label: s.eventType, color: "" };
          return (
            <Link key={s.eventType} href={`/admin/seguranca?tipo=${s.eventType}`}>
              <Badge
                variant="secondary"
                className={`cursor-pointer ${tipo === s.eventType ? "ring-2 ring-primary" : ""} ${info.color}`}
              >
                {info.label} ({s.total})
              </Badge>
            </Link>
          );
        })}
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

                return (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-border/40 bg-muted/20"
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
