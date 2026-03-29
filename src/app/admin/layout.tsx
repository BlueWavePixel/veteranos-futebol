import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

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
            Sugestões
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
