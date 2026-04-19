import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getLocale } from "@/lib/i18n/get-locale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://veteranos-futebol.vercel.app").trim();

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Veteranos - Clubes de Futebol · Contactos de Equipas",
  description:
    "Plataforma de contactos de equipas de veteranos de futebol. Encontre equipas, marque jogos.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Veteranos - Clubes de Futebol",
    description:
      "Plataforma de contactos de equipas de veteranos de futebol em Portugal. Mais de 300 equipas registadas.",
    url: APP_URL,
    siteName: "Veteranos - Clubes de Futebol",
    images: [
      {
        url: "/images/logo-og.png",
        width: 1200,
        height: 630,
        alt: "Veteranos - Clubes de Futebol",
      },
    ],
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veteranos - Clubes de Futebol",
    description:
      "Plataforma de contactos de equipas de veteranos de futebol em Portugal.",
    images: ["/images/logo-og.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale === "es" ? "es" : "pt"}
      translate="no"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased notranslate`}
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-full flex flex-col">
        <Header locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
