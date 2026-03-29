import { db } from "@/lib/db";
import { suggestions, teams } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { notifyCoordinatorReply } from "@/lib/email/send-notification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const admin = await requireAdmin();

  const allSuggestions = await db
    .select({
      suggestion: suggestions,
      teamName: teams.name,
    })
    .from(suggestions)
    .leftJoin(teams, eq(suggestions.teamId, teams.id))
    .orderBy(desc(suggestions.createdAt));

  const pending = allSuggestions.filter(
    (s) => s.suggestion.status === "pending"
  ).length;

  async function updateSuggestion(formData: FormData) {
    "use server";
    await requireAdmin();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sugestões</h1>
          <p className="text-muted-foreground text-sm">
            {allSuggestions.length} sugestões · {pending} pendentes
          </p>
        </div>
      </div>

      {allSuggestions.length === 0 ? (
        <p className="text-muted-foreground">Ainda não há sugestões.</p>
      ) : (
        <div className="space-y-8">
          {(["pending", "read", "resolved"] as const).map((status) => {
            const group = allSuggestions.filter(
              (s) => s.suggestion.status === status
            );
            if (group.length === 0) return null;
            return (
              <div key={status}>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={STATUS_LABELS[status]?.className || ""}
                  >
                    {STATUS_LABELS[status]?.label}
                  </Badge>
                  <span className="text-sm font-normal text-muted-foreground">
                    ({group.length})
                  </span>
                </h2>
                <div className="space-y-4">
                  {group.map(({ suggestion: s, teamName }) => (
            <Card key={s.id}>
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
                </div>

                <p className="text-sm mb-4">{s.message}</p>

                <form action={updateSuggestion} className="space-y-3">
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
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
