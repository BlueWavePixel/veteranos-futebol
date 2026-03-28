import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default async function AdminPage() {
  await requireAdmin();

  const allTeams = await db.select().from(teams).orderBy(teams.name);

  const [{ total }] = await db
    .select({ total: count() })
    .from(teams)
    .where(eq(teams.isActive, true));

  const [{ pending }] = await db
    .select({ pending: count() })
    .from(teams)
    .where(eq(teams.rgpdConsent, false));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono text-primary">{total}</p>
            <p className="text-sm text-muted-foreground">Equipas Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono text-yellow-500">
              {pending}
            </p>
            <p className="text-sm text-muted-foreground">RGPD Pendente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono">{allTeams.length}</p>
            <p className="text-sm text-muted-foreground">
              Total (incl. inativas)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Equipas</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipa</TableHead>
                <TableHead>Coordenador</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>RGPD</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>
                    <div>{team.coordinatorName}</div>
                    <div className="text-xs text-muted-foreground">
                      {team.coordinatorEmail}
                    </div>
                  </TableCell>
                  <TableCell>{team.location}</TableCell>
                  <TableCell>
                    {team.rgpdConsent ? (
                      <Badge
                        variant="secondary"
                        className="bg-primary/20 text-primary"
                      >
                        OK
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-500/20 text-yellow-400"
                      >
                        Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link href={`/admin/equipas/${team.id}`}>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <Link href={`/admin/transferir/${team.id}`}>
                        <Button variant="ghost" size="sm">
                          Transferir
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
