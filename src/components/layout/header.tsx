import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";

export function Header() {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <img src="/images/logo.png" alt="Logo" className="h-8" />
          Veteranos Futebol
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/equipas"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Equipas
          </Link>
          <Link
            href="/sugestoes"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sugestões
          </Link>
          <Link href="/registar">
            <Button variant="outline" size="sm">
              Registar Equipa
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Aceder</Button>
          </Link>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
