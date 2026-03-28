import { requireCoordinator } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCoordinator();
  return <>{children}</>;
}
