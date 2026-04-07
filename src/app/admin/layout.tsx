import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { duplicatePairs } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  // Count pending duplicate pairs for badge
  const [{ pendingCount }] = await db
    .select({ pendingCount: count() })
    .from(duplicatePairs)
    .where(eq(duplicatePairs.status, "pending"));

  return (
    <div>
      <nav className="border-b border-border/40 bg-muted/30 px-4 py-2">
        <div className="container mx-auto flex items-center gap-4">
          <span className="font-semibold text-sm">Admin</span>
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Equipas
          </Link>
          <Link
            href="/admin/sugestoes"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sugestoes
          </Link>
          <Link
            href="/admin/duplicados"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            Duplicados
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white min-w-[18px]">
                {pendingCount}
              </span>
            )}
          </Link>
          {admin.role === "super_admin" && (
            <Link
              href="/admin/moderadores"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Moderadores
            </Link>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {admin.name} (
            {admin.role === "super_admin" ? "Super Admin" : "Moderador"})
          </span>
        </div>
      </nav>
      {children}
    </div>
  );
}
