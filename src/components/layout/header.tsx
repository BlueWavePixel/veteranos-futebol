import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { t, type Locale } from "@/lib/i18n/translations";

export function Header({ locale }: { locale: Locale }) {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Image src="/images/logo.png" alt="Logo" width={32} height={32} className="h-8 w-auto" />
          Veteranos - Clubes de Futebol
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/equipas"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("common", "teams", locale)}
          </Link>
          <Link
            href="/sugestoes"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("common", "suggestions", locale)}
          </Link>
          <Link href="/registar">
            <Button variant="outline" size="sm">
              {t("header", "registerTeam", locale)}
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm">{t("header", "access", locale)}</Button>
          </Link>
        </nav>
        <MobileNav locale={locale} />
      </div>
    </header>
  );
}
