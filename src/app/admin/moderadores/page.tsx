import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireSuperAdmin } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ModeradoresPage() {
  const superAdmin = await requireSuperAdmin();

  const allAdmins = await db.select().from(admins).orderBy(admins.name);

  async function addModerator(formData: FormData) {
    "use server";

    const email = (formData.get("email") as string).toLowerCase().trim();
    const name = (formData.get("name") as string).trim();
    if (!email || !name) return;

    await db.insert(admins).values({ email, name, role: "moderator" });

    await logAudit({
      actorType: "super_admin",
      actorEmail: superAdmin.email,
      action: "moderator_added",
      details: { email, name },
    });

    redirect("/admin/moderadores");
  }

  async function removeModerator(formData: FormData) {
    "use server";

    const id = formData.get("id") as string;
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    if (!admin || admin.role === "super_admin") return;

    await db.delete(admins).where(eq(admins.id, id));

    await logAudit({
      actorType: "super_admin",
      actorEmail: superAdmin.email,
      action: "moderator_removed",
      details: { email: admin.email, name: admin.name },
    });

    redirect("/admin/moderadores");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Moderadores</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Moderadores Atuais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {admin.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        admin.role === "super_admin" ? "default" : "secondary"
                      }
                    >
                      {admin.role === "super_admin"
                        ? "Super Admin"
                        : "Moderador"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {admin.role !== "super_admin" && (
                      <form action={removeModerator}>
                        <input type="hidden" name="id" value={admin.id} />
                        <Button variant="destructive" size="sm" type="submit">
                          Remover
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Moderador</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addModerator} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="email">Email Google *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <Button type="submit">Adicionar Moderador</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
