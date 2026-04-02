import Link from "next/link";
import { LocaleSwitcher } from "./locale-switcher";
import { t, type Locale } from "@/lib/i18n/translations";

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-border/40 py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Veteranos Futebol</p>
        <nav className="flex gap-4 items-center">
          <Link
            href="/privacidade"
            className="hover:text-foreground transition-colors"
          >
            {t("common", "privacyPolicy", locale)}
          </Link>
          <Link
            href="/admin-login"
            className="hover:text-foreground transition-colors"
          >
            {t("common", "admin", locale)}
          </Link>
          <LocaleSwitcher current={locale} />
        </nav>
        <p className="text-xs">
          {t("common", "developedBy", locale)}{" "}
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
