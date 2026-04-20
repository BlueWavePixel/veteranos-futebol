import { NextRequest, NextResponse } from "next/server";
import { recalculateDuplicateFlags } from "@/lib/recalculate-flags";
import { notifyAdminsNewDuplicates } from "@/lib/email/send-notification";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { totalPending, newlyDetected } = await recalculateDuplicateFlags();

    if (newlyDetected.length > 0) {
      await notifyAdminsNewDuplicates({ newlyDetected, totalPending });
    }

    return NextResponse.json({
      ok: true,
      totalPending,
      newlyDetected: newlyDetected.length,
      notified: newlyDetected.length > 0,
    });
  } catch (error) {
    console.error("Duplicates cron failed:", error);
    return NextResponse.json(
      { error: "Duplicates check failed" },
      { status: 500 },
    );
  }
}
