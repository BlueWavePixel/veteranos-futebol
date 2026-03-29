import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Veteranos Futebol</p>
        <nav className="flex gap-4">
          <Link
            href="/privacidade"
            className="hover:text-foreground transition-colors"
          >
            Política de Privacidade
          </Link>
          <Link
            href="/admin-login"
            className="hover:text-foreground transition-colors"
          >
            Administração
          </Link>
        </nav>
        <p className="text-xs">
          Desenvolvido e patrocinado por{" "}
          <a
            href="https://bluewavepixel.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            BlueWavePixel
          </a>
        </p>
      </div>
    </footer>
  );
}
