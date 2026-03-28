import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-8 py-16">
        <h1 className="text-4xl font-bold mb-2">Veteranos Futebol</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Contactos de equipas de veteranos de futebol
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/equipas">
            <Button size="lg" variant="outline">
              Ver Todas as Equipas
            </Button>
          </Link>
          <Link href="/registar">
            <Button size="lg">Registar a Minha Equipa</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
