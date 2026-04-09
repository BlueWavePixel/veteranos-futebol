import { db } from "@/lib/db";
import { suggestions, teams } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { notifyCoordinatorReply } from "@/lib/email/send-notification";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-yellow-500/20 text-yellow-400" },
  read: { label: "Lida", className: "bg-blue-500/20 text-blue-400" },
  resolved: { label: "Resolvida", className: "bg-primary/20 text-primary" },
};

export default async function AdminSugestoesPage() {
  await requireAdmin();

  const allSuggestions = await db
    .select({
      suggestion: suggestions,
      teamName: teams.name,
    })
    .from(suggestions)
    .leftJoin(teams, eq(suggestions.teamId, teams.id))
    .orderBy(desc(suggestions.createdAt));

  async function updateSuggestion(formData: FormData) {
    "use server";
    const adminUser = await requireAdmin();

    const id = formData.get("id") as string;
    const status = formData.get("status") as string;
    const adminReply = (formData.get("adminReply") as string) || null;

    // Get suggestion details before updating (for email)
    const [suggestion] = await db
      .select()
      .from(suggestions)
      .where(eq(suggestions.id, id));

    await db
      .update(suggestions)
      .set({
        status: status as "pending" | "read" | "resolved",
        adminReply,
        lastModifiedBy: adminUser.name,
        updatedAt: new Date(),
      })
      .where(eq(suggestions.id, id));

    // Notify coordinator if there's a reply
    if (adminReply && suggestion) {
      await notifyCoordinatorReply({
        coordinatorEmail: suggestion.authorEmail,
        coordinatorName: suggestion.authorName,
        subject: suggestion.subject,
        originalMessage: suggestion.message,
        adminReply,
        status,
      });
    }

    redirect("/admin/sugestoes");
  }

  const active = allSuggestions.filter(
    (s) => s.suggestion.status === "pending" || s.suggestion.status === "read"
  );
  const resolved = allSuggestions.filter(
    (s) => s.suggestion.status === "resolved"
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sugestões</h1>
          <p className="text-muted-foreground text-sm">
            {active.length} por resolver · {resolved.length} resolvidas
          </p>
        </div>
      </div>

      {/* Pendentes + Lidas */}
      {active.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-8 text-center mb-8">
          <p className="text-muted-foreground">
            Não há sugestões pendentes. Tudo em dia!
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {active.map(({ suggestion: s, teamName }) => (
            <SuggestionCard
              key={s.id}
              s={s}
              teamName={teamName}
              updateAction={updateSuggestion}
            />
          ))}
        </div>
      )}

      {/* Resolvidas */}
      {resolved.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            Ver resolvidas ({resolved.length})
          </summary>
          <div className="space-y-4">
            {resolved.map(({ suggestion: s, teamName }) => (
              <SuggestionCard
                key={s.id}
                s={s}
                teamName={teamName}
                updateAction={updateSuggestion}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function SuggestionCard({
  s,
  teamName,
  updateAction,
}: {
  s: typeof import("@/lib/db/schema").suggestions.$inferSelect;
  teamName: string | null;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{s.subject}</span>
              <Badge
                variant="secondary"
                className={STATUS_LABELS[s.status]?.className || ""}
              >
                {STATUS_LABELS[s.status]?.label || s.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {s.authorName} ({s.authorEmail})
              {teamName && ` · ${teamName}`}
              {" · "}
              {new Date(s.createdAt).toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {s.lastModifiedBy && (
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
              Última ação: {s.lastModifiedBy}
            </span>
          )}
        </div>

        <p className="text-sm mb-4">{s.message}</p>

        <form action={updateAction} className="space-y-3">
          <input type="hidden" name="id" value={s.id} />
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                name="adminReply"
                placeholder="Responder ao coordenador..."
                rows={2}
                defaultValue={s.adminReply || ""}
              />
            </div>
            <div className="w-[140px]">
              <Select name="status" defaultValue={s.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="read">Lida</SelectItem>
                  <SelectItem value="resolved">Resolvida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="sm">
              Guardar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
