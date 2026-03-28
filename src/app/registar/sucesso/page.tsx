import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function RegistoSucessoPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-5xl mb-4">&#9989;</div>
          <h1 className="text-2xl font-bold mb-2">Equipa Registada!</h1>
          <p className="text-muted-foreground mb-6">
            Enviámos um email com um link de acesso. Clique no link para
            confirmar o seu email e aceder ao painel da sua equipa.
          </p>
          <Link href="/equipas">
            <Button variant="outline">Ver Todas as Equipas</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
