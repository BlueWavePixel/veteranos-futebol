import { db } from "@/lib/db";
import { securityLog } from "@/lib/db/schema";
import { NextRequest } from "next/server";

export async function logSecurityEvent(params: {
  eventType: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(securityLog).values({
      eventType: params.eventType,
      email: params.email,
      ip: params.ip,
      userAgent: params.userAgent,
      details: params.details,
    });
  } catch (error) {
    // Never fail the request — log silently
    console.error("Failed to log security event:", error);
  }
}

/** Extract the client IP from request headers (Vercel, Cloudflare, standard) */
export function getClientIp(request: NextRequest | Request): string {
  const headers = request.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
