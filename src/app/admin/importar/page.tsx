import { requireSuperAdmin } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  await requireSuperAdmin();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Importar Dados do Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Esta funcionalidade importa os dados do ficheiro Excel existente
            para a base de dados. As equipas importadas ficam com RGPD pendente
            : quando o coordenador aceder pela primeira vez, será pedido o
            consentimento.
          </p>
          <p className="text-sm text-yellow-400 mb-6">
            Atenção: esta ação só deve ser executada uma vez, na configuração
            inicial da plataforma.
          </p>
          <form action="/api/import" method="POST">
            <Button type="submit">Importar Excel</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
