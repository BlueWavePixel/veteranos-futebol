import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCoordinatorEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("coordinator_email")?.value || null;
}

export async function requireCoordinator(): Promise<string> {
  const email = await getCoordinatorEmail();
  if (!email) redirect("/login");
  return email;
}

export async function getAdminSession() {
  const email = await getCoordinatorEmail();
  if (!email) return null;

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email));

  return admin || null;
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) redirect("/login");
  return admin;
}

export async function requireSuperAdmin() {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") redirect("/admin");
  return admin;
}
