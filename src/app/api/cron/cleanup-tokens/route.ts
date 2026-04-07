import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authTokens } from "@/lib/db/schema";
import { lt } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db
      .delete(authTokens)
      .where(lt(authTokens.expiresAt, new Date()));

    return NextResponse.json({
      ok: true,
      deleted: result.rowCount ?? 0,
    });
  } catch (error) {
    console.error("Token cleanup cron failed:", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
