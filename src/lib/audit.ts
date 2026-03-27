import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";

type ActorType = "coordinator" | "moderator" | "super_admin";

export async function logAudit(params: {
  actorType: ActorType;
  actorEmail: string;
  action: string;
  teamId?: string;
  details?: Record<string, unknown>;
}) {
  await db.insert(auditLog).values({
    actorType: params.actorType,
    actorEmail: params.actorEmail,
    action: params.action,
    teamId: params.teamId,
    details: params.details,
  });
}
