# i18n + Auth UX + Maps + Anti-Translate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PT-PT/PT-BR/ES translations, fix auth cookie issues, resolve Google Maps short URLs, prevent Chrome auto-translate, and redesign login page with clear register vs login guidance.

**Architecture:** Lightweight i18n via a translations dictionary + locale cookie set by middleware from Vercel geo headers. Maps URL resolution via server-side fetch. Auth callback page already implemented. Login page redesigned with two clear sections.

**Tech Stack:** Next.js 16 App Router, Vercel geo headers (`x-vercel-ip-country`), cookies API, server-side fetch for URL resolution.

---

### Task 1: Create i18n translations dictionary

**Files:**
- Create: `src/lib/i18n/translations.ts`

- [ ] **Step 1: Create the translations file**

```typescript
export type Locale = "pt" | "br" | "es";

const translations = {
  // === COMMON ===
  "common.teams": { pt: "Equipas", br: "Equipes", es: "Equipos" },
  "common.suggestions": { pt: "Sugestoes", br: "Sugestoes", es: "Sugerencias" },
  "common.register": { pt: "Registar Equipa", br: "Registrar Equipe", es: "Registrar Equipo" },
  "common.access": { pt: "Aceder", br: "Acessar", es: "Acceder" },
  "common.submit": { pt: "A submeter...", br: "Enviando...", es: "Enviando..." },
  "common.email": { pt: "Email do Responsavel", br: "Email do Responsavel", es: "Email del Coordinador" },
  "common.privacyPolicy": { pt: "Politica de Privacidade", br: "Politica de Privacidade", es: "Politica de Privacidad" },
  "common.admin": { pt: "Administracao", br: "Administracao", es: "Administracion" },
  "common.developedBy": { pt: "Desenvolvido e patrocinado por", br: "Desenvolvido e patrocinado por", es: "Desarrollado y patrocinado por" },

  // === HEADER ===
  "header.registerTeam": { pt: "Registar Equipa", br: "Registrar Equipe", es: "Registrar Equipo" },
  "header.access": { pt: "Aceder", br: "Acessar", es: "Acceder" },

  // === HOMEPAGE ===
  "home.title": { pt: "Veteranos Futebol", br: "Veteranos Futebol", es: "Veteranos Futbol" },
  "home.subtitle": { pt: "Contactos de equipas de veteranos de futebol", br: "Contatos de equipes de veteranos de futebol", es: "Contactos de equipos de veteranos de futbol" },
  "home.teamsRegistered": { pt: "equipas registadas", br: "equipes registradas", es: "equipos registrados" },
  "home.howItWorks": { pt: "Como funciona?", br: "Como funciona?", es: "Como funciona?" },
  "home.forNewUsers": { pt: "(para quem ainda nao se registou)", br: "(para quem ainda nao se registrou)", es: "(para quien aun no se ha registrado)" },
  "home.step1Title": { pt: "1. Registe a sua equipa", br: "1. Registre a sua equipe", es: "1. Registre su equipo" },
  "home.step1Desc": {
    pt: "Preencha o formulario com os dados da equipa -- nome, localizacao, equipamentos, campo e contactos do coordenador.",
    br: "Preencha o formulario com os dados da equipe -- nome, localizacao, equipamentos, campo e contatos do coordenador.",
    es: "Rellene el formulario con los datos del equipo -- nombre, ubicacion, equipaciones, campo y contactos del coordinador.",
  },
  "home.step2Title": { pt: "2. Encontre adversarios", br: "2. Encontre adversarios", es: "2. Encuentre rivales" },
  "home.step2Desc": {
    pt: "Pesquise equipas por nome, concelho ou distrito. Consulte o mapa para encontrar clubes perto de si e combine jogos.",
    br: "Pesquise equipes por nome, municipio ou distrito. Consulte o mapa para encontrar clubes perto de voce e combine jogos.",
    es: "Busque equipos por nombre, municipio o provincia. Consulte el mapa para encontrar clubes cerca de usted y concerte partidos.",
  },
  "home.step3Title": { pt: "3. Organize os seus jogos", br: "3. Organize os seus jogos", es: "3. Organice sus partidos" },
  "home.step3Desc": {
    pt: "Cada equipa tem o seu calendario de jogos. Adicione partidas, registe resultados e partilhe o calendario com a equipa.",
    br: "Cada equipe tem o seu calendario de jogos. Adicione partidas, registre resultados e compartilhe o calendario com a equipe.",
    es: "Cada equipo tiene su calendario de partidos. Anade partidos, registre resultados y comparta el calendario con el equipo.",
  },
  "home.aboutPlatform": {
    pt: "Veteranos Futebol e uma plataforma gratuita de contactos para equipas de veteranos em Portugal. O objetivo e simples: facilitar a comunicacao entre clubes e ajudar a marcar jogos amigaveis ou torneios.",
    br: "Veteranos Futebol e uma plataforma gratuita de contatos para equipes de veteranos em Portugal. O objetivo e simples: facilitar a comunicacao entre clubes e ajudar a marcar jogos amistosos ou torneios.",
    es: "Veteranos Futbol es una plataforma gratuita de contactos para equipos de veteranos en la Peninsula Iberica. El objetivo es simple: facilitar la comunicacion entre clubes y ayudar a organizar partidos amistosos o torneos.",
  },
  "home.afterRegister": {
    pt: "Apos o registo, recebera um link de acesso por email para gerir a ficha da sua equipa -- atualizar dados, adicionar jogos ao calendario, registar resultados e exportar o calendario para o Google Calendar ou telemovel.",
    br: "Apos o registro, recebera um link de acesso por email para gerir a ficha da sua equipe -- atualizar dados, adicionar jogos ao calendario, registrar resultados e exportar o calendario para o Google Calendar ou celular.",
    es: "Tras el registro, recibira un enlace de acceso por email para gestionar la ficha de su equipo -- actualizar datos, anadir partidos al calendario, registrar resultados y exportar el calendario a Google Calendar o movil.",
  },
  "home.questionsHint": {
    pt: "Tem uma ideia ou duvida? Use a pagina de",
    br: "Tem uma ideia ou duvida? Use a pagina de",
    es: "Tiene una idea o duda? Use la pagina de",
  },
  "home.viewAllTeams": { pt: "Ver Todas as Equipas", br: "Ver Todas as Equipes", es: "Ver Todos los Equipos" },
  "home.registerMyTeam": { pt: "Registar a Minha Equipa", br: "Registrar a Minha Equipe", es: "Registrar Mi Equipo" },
  "home.teamsOnMap": {
    pt: (onMap: number, total: number) => `${onMap} de ${total} equipas visiveis no mapa`,
    br: (onMap: number, total: number) => `${onMap} de ${total} equipes visiveis no mapa`,
    es: (onMap: number, total: number) => `${onMap} de ${total} equipos visibles en el mapa`,
  },

  // === LOGIN PAGE ===
  "login.title": { pt: "Aceder a Minha Equipa", br: "Acessar Minha Equipe", es: "Acceder a Mi Equipo" },
  "login.expiredError": { pt: "O link expirou. Peca um novo abaixo.", br: "O link expirou. Peca um novo abaixo.", es: "El enlace ha expirado. Solicite uno nuevo abajo." },
  "login.invalidError": { pt: "Link invalido. Peca um novo abaixo.", br: "Link invalido. Peca um novo abaixo.", es: "Enlace invalido. Solicite uno nuevo abajo." },
  "login.existingTeamTitle": { pt: "Ja tenho equipa registada", br: "Ja tenho equipe registrada", es: "Ya tengo equipo registrado" },
  "login.existingTeamDesc": {
    pt: "Use o email com que registou a sua equipa (ou o email que constava na lista original). Se nao receber o email em poucos minutos, a sua equipa pode nao estar registada -- use a opcao abaixo.",
    br: "Use o email com que registrou a sua equipe (ou o email que constava na lista original). Se nao receber o email em poucos minutos, a sua equipe pode nao estar registrada -- use a opcao abaixo.",
    es: "Use el email con el que registro su equipo (o el email que figuraba en la lista original). Si no recibe el email en unos minutos, es posible que su equipo no este registrado -- use la opcion de abajo.",
  },
  "login.sendAccessLink": { pt: "Enviar Link de Acesso", br: "Enviar Link de Acesso", es: "Enviar Enlace de Acceso" },
  "login.sending": { pt: "A enviar...", br: "Enviando...", es: "Enviando..." },
  "login.emailSent": { pt: "Email Enviado!", br: "Email Enviado!", es: "Email Enviado!" },
  "login.emailSentDesc": {
    pt: "Se o email estiver registado, recebera um link de acesso. Verifique a sua caixa de entrada (e spam).",
    br: "Se o email estiver registrado, recebera um link de acesso. Verifique a sua caixa de entrada (e spam).",
    es: "Si el email esta registrado, recibira un enlace de acceso. Revise su bandeja de entrada (y spam).",
  },
  "login.changeEmailLink": { pt: "Preciso de alterar o meu email", br: "Preciso de alterar o meu email", es: "Necesito cambiar mi email" },
  "login.changeEmailCurrentLabel": { pt: "Email atual (registado)", br: "Email atual (registrado)", es: "Email actual (registrado)" },
  "login.changeEmailNewLabel": { pt: "Novo email pretendido", br: "Novo email pretendido", es: "Nuevo email deseado" },
  "login.changeEmailSubmit": { pt: "Enviar Pedido de Alteracao", br: "Enviar Pedido de Alteracao", es: "Enviar Solicitud de Cambio" },
  "login.changeEmailSent": {
    pt: "Pedido enviado! A equipa de moderacao ira processar a alteracao em breve.",
    br: "Pedido enviado! A equipa de moderacao ira processar a alteracao em breve.",
    es: "Solicitud enviada! El equipo de moderacion procesara el cambio en breve.",
  },
  "login.newTeamTitle": { pt: "Registar equipa nova", br: "Registrar equipe nova", es: "Registrar equipo nuevo" },
  "login.newTeamDesc": {
    pt: "Se a sua equipa ainda nao esta na plataforma, registe-a aqui. Nao use esta opcao se a sua equipa ja foi importada da lista original.",
    br: "Se a sua equipe ainda nao esta na plataforma, registre-a aqui. Nao use esta opcao se a sua equipe ja foi importada da lista original.",
    es: "Si su equipo aun no esta en la plataforma, registrelo aqui. No use esta opcion si su equipo ya fue importado de la lista original.",
  },
  "login.registerNewTeam": { pt: "Registar Nova Equipa", br: "Registrar Nova Equipe", es: "Registrar Nuevo Equipo" },

  // === REGISTER PAGE ===
  "register.title": { pt: "Registar Equipa", br: "Registrar Equipe", es: "Registrar Equipo" },
  "register.subtitle": {
    pt: "Preencha os dados da sua equipa de veteranos. Apos o registo, recebera um email com um link para aceder e editar os seus dados a qualquer momento.",
    br: "Preencha os dados da sua equipe de veteranos. Apos o registro, recebera um email com um link para acessar e editar os seus dados a qualquer momento.",
    es: "Rellene los datos de su equipo de veteranos. Tras el registro, recibira un email con un enlace para acceder y editar sus datos en cualquier momento.",
  },
  "register.submitButton": { pt: "Registar Equipa", br: "Registrar Equipe", es: "Registrar Equipo" },
  "register.alreadyRegistered": {
    pt: "A sua equipa ja esta registada?",
    br: "A sua equipe ja esta registrada?",
    es: "Su equipo ya esta registrado?",
  },
  "register.goToLogin": {
    pt: "Aceda aqui com o email que usou no registo",
    br: "Acesse aqui com o email que usou no registro",
    es: "Acceda aqui con el email que uso en el registro",
  },

  // === REGISTER SUCCESS ===
  "registerSuccess.title": { pt: "Equipa Registada!", br: "Equipe Registrada!", es: "Equipo Registrado!" },
  "registerSuccess.desc": {
    pt: "Enviamos um email com um link de acesso. Clique no link para confirmar o seu email e aceder ao painel da sua equipa.",
    br: "Enviamos um email com um link de acesso. Clique no link para confirmar o seu email e acessar o painel da sua equipe.",
    es: "Hemos enviado un email con un enlace de acceso. Haga clic en el enlace para confirmar su email y acceder al panel de su equipo.",
  },
  "registerSuccess.viewAll": { pt: "Ver Todas as Equipas", br: "Ver Todas as Equipes", es: "Ver Todos los Equipos" },

  // === AUTH CALLBACK ===
  "auth.authenticating": { pt: "A autenticar... por favor aguarde.", br: "Autenticando... por favor aguarde.", es: "Autenticando... por favor espere." },

  // === TEAM FORM LABELS ===
  "form.teamData": { pt: "Dados da Equipa", br: "Dados da Equipe", es: "Datos del Equipo" },
  "form.teamName": { pt: "Nome da Equipa", br: "Nome da Equipe", es: "Nombre del Equipo" },
  "form.teamLogo": { pt: "Logotipo da Equipa", br: "Logotipo da Equipe", es: "Logotipo del Equipo" },
  "form.teamPhoto": { pt: "Foto de Equipa", br: "Foto de Equipe", es: "Foto del Equipo" },
  "form.foundedYear": { pt: "Ano de Fundacao", br: "Ano de Fundacao", es: "Ano de Fundacion" },
  "form.playerCount": { pt: "N.o de Jogadores", br: "N.o de Jogadores", es: "N.o de Jugadores" },
  "form.ageGroup": { pt: "Escalao Etario", br: "Faixa Etaria", es: "Grupo de Edad" },
  "form.mixed": { pt: "Misto", br: "Misto", es: "Mixto" },
  "form.teamType": { pt: "Tipo de Equipa", br: "Tipo de Equipe", es: "Tipo de Equipo" },
  "form.dinner": { pt: "Disponivel para Jantar (3a Parte)", br: "Disponivel para Jantar (3a Parte)", es: "Disponible para Cena (3a Parte)" },
  "form.primaryKit": { pt: "Equipamento Principal", br: "Equipamento Principal", es: "Equipacion Principal" },
  "form.secondaryKit": { pt: "Equipamento Alternativo", br: "Equipamento Alternativo", es: "Equipacion Alternativa" },
  "form.shirt": { pt: "Camisola", br: "Camisa", es: "Camiseta" },
  "form.shorts": { pt: "Calcoes", br: "Calcoes", es: "Pantalones" },
  "form.socks": { pt: "Meias", br: "Meias", es: "Medias" },
  "form.coordinator": { pt: "Responsavel", br: "Responsavel", es: "Coordinador" },
  "form.coordinatorEmail": { pt: "Email do Responsavel", br: "Email do Responsavel", es: "Email del Coordinador" },
  "form.coordinatorName": { pt: "Nome do Responsavel", br: "Nome do Responsavel", es: "Nombre del Coordinador" },
  "form.coordinatorPhone": { pt: "Contacto do Responsavel", br: "Contato do Responsavel", es: "Contacto del Coordinador" },
  "form.altCoordinatorName": { pt: "Nome Responsavel Alternativo", br: "Nome Responsavel Alternativo", es: "Nombre Coordinador Alternativo" },
  "form.altPhone": { pt: "Contacto Alternativo", br: "Contato Alternativo", es: "Contacto Alternativo" },
  "form.field": { pt: "Campo", br: "Campo", es: "Campo" },
  "form.fieldName": { pt: "Nome do Campo", br: "Nome do Campo", es: "Nombre del Campo" },
  "form.fieldType": { pt: "Tipo de Campo", br: "Tipo de Campo", es: "Tipo de Campo" },
  "form.synthetic": { pt: "Sintetico", br: "Sintetico", es: "Sintetico" },
  "form.naturalGrass": { pt: "Relva Natural", br: "Grama Natural", es: "Cesped Natural" },
  "form.dirt": { pt: "Pelado", br: "Pelado", es: "Tierra" },
  "form.futsalCourt": { pt: "Futsal (pavilhao)", br: "Futsal (ginasio)", es: "Futsal (pabellon)" },
  "form.other": { pt: "Outro", br: "Outro", es: "Otro" },
  "form.fieldAddress": { pt: "Morada do Campo", br: "Endereco do Campo", es: "Direccion del Campo" },
  "form.parish": { pt: "Localidade / Freguesia", br: "Localidade / Freguesia", es: "Localidad / Parroquia" },
  "form.municipality": { pt: "Concelho", br: "Municipio", es: "Municipio" },
  "form.district": { pt: "Distrito", br: "Distrito", es: "Provincia" },
  "form.selectDistrict": { pt: "Selecionar distrito", br: "Selecionar distrito", es: "Seleccionar provincia" },
  "form.international": { pt: "Internacional", br: "Internacional", es: "Internacional" },
  "form.mapsLink": { pt: "Link Google Maps", br: "Link Google Maps", es: "Enlace Google Maps" },
  "form.mapsHint": {
    pt: "Cole o link completo do Google Maps (aceita tambem links curtos e coordenadas)",
    br: "Cole o link completo do Google Maps (aceita tambem links curtos e coordenadas)",
    es: "Pegue el enlace completo de Google Maps (acepta tambien enlaces cortos y coordenadas)",
  },
  "form.additionalInfo": { pt: "Informacao Adicional", br: "Informacao Adicional", es: "Informacion Adicional" },
  "form.trainingSchedule": { pt: "Horario de Treino / Jogo", br: "Horario de Treino / Jogo", es: "Horario de Entrenamiento / Partido" },
  "form.notes": { pt: "Observacoes", br: "Observacoes", es: "Observaciones" },
  "form.requiredFields": {
    pt: "Nome da equipa, nome e email do responsavel sao obrigatorios.",
    br: "Nome da equipe, nome e email do responsavel sao obrigatorios.",
    es: "Nombre del equipo, nombre y email del coordinador son obligatorios.",
  },
  "form.rgpdRequired": {
    pt: "E necessario aceitar a Politica de Privacidade.",
    br: "E necessario aceitar a Politica de Privacidade.",
    es: "Es necesario aceptar la Politica de Privacidad.",
  },

  // === EMAIL ===
  "email.subject": { pt: "Aceda a sua equipa -- Veteranos Futebol", br: "Acesse sua equipe -- Veteranos Futebol", es: "Acceda a su equipo -- Veteranos Futbol" },
  "email.body": { pt: "Clique no link abaixo para aceder a sua equipa:", br: "Clique no link abaixo para acessar sua equipe:", es: "Haga clic en el enlace de abajo para acceder a su equipo:" },
  "email.buttonText": { pt: "Aceder a Minha Equipa", br: "Acessar Minha Equipe", es: "Acceder a Mi Equipo" },
  "email.expiry": { pt: "Este link expira em 24 horas.", br: "Este link expira em 24 horas.", es: "Este enlace expira en 24 horas." },
  "email.ignore": { pt: "Se nao solicitou este acesso, ignore este email.", br: "Se nao solicitou este acesso, ignore este email.", es: "Si no solicito este acceso, ignore este email." },
} as const;

type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  const entry = translations[key];
  if (!entry) return key;
  const val = entry[locale] ?? entry["pt"];
  if (typeof val === "function") return ""; // handled separately
  return val as string;
}

// For dynamic translations (functions)
export function tFn<T extends (...args: never[]) => string>(
  key: TranslationKey,
  locale: Locale
): T {
  const entry = translations[key];
  return ((entry?.[locale] ?? entry?.["pt"]) as unknown) as T;
}

export const SUPPORTED_LOCALES: Locale[] = ["pt", "br", "es"];

export function countryToLocale(country: string | null): Locale {
  if (!country) return "pt";
  switch (country.toUpperCase()) {
    case "ES": return "es";
    case "BR": return "br";
    default: return "pt";
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/i18n/translations.ts
git commit -m "feat: add i18n translations dictionary (PT-PT, PT-BR, ES)"
```

---

### Task 2: Create locale middleware + helpers

**Files:**
- Create: `src/middleware.ts`
- Create: `src/lib/i18n/get-locale.ts`

- [ ] **Step 1: Create server-side locale helper**

```typescript
// src/lib/i18n/get-locale.ts
import { cookies } from "next/headers";
import type { Locale } from "./translations";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value;
  if (locale === "pt" || locale === "br" || locale === "es") return locale;
  return "pt";
}
```

- [ ] **Step 2: Create middleware for locale detection**

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only set locale cookie if not already set
  if (!request.cookies.get("locale")) {
    // x-vercel-ip-country is provided by Vercel's Edge Network
    const country = request.headers.get("x-vercel-ip-country") || "PT";
    let locale = "pt";
    if (country === "ES") locale = "es";
    else if (country === "BR") locale = "br";

    response.cookies.set("locale", locale, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  // Run on all pages except static files and API routes
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|images/|icon\\.png|api/).*)"],
};
```

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts src/lib/i18n/get-locale.ts
git commit -m "feat: add locale middleware (Vercel geo detection) and server-side helper"
```

---

### Task 3: Create locale switcher component

**Files:**
- Create: `src/components/layout/locale-switcher.tsx`
- Modify: `src/components/layout/footer.tsx`

- [ ] **Step 1: Create locale switcher component**

```tsx
// src/components/layout/locale-switcher.tsx
"use client";

import { useRouter } from "next/navigation";

const labels: Record<string, string> = {
  pt: "PT",
  br: "BR",
  es: "ES",
};

export function LocaleSwitcher({ current }: { current: string }) {
  const router = useRouter();

  function setLocale(locale: string) {
    document.cookie = `locale=${locale};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      {Object.entries(labels).map(([code, label]) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          className={`px-1.5 py-0.5 rounded transition-colors ${
            current === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Add locale switcher to footer**

Modify `src/components/layout/footer.tsx` to accept a `locale` prop and render the switcher. The root layout will pass the locale from server-side.

```tsx
// src/components/layout/footer.tsx
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
            {t("common.privacyPolicy", locale)}
          </Link>
          <Link
            href="/admin-login"
            className="hover:text-foreground transition-colors"
          >
            {t("common.admin", locale)}
          </Link>
          <LocaleSwitcher current={locale} />
        </nav>
        <p className="text-xs">
          {t("common.developedBy", locale)}{" "}
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
```

- [ ] **Step 3: Update root layout to pass locale**

Modify `src/app/layout.tsx`:
- Import `getLocale` and pass locale to `Footer`
- Add `<meta name="google" content="notranslate" />` (Task 5 combined)
- Add `translate="no"` and `notranslate` class to `<html>`

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getLocale } from "@/lib/i18n/get-locale";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Veteranos Futebol -- Contactos de Equipas",
  description: "Plataforma de contactos de equipas de veteranos de futebol. Encontre equipas, marque jogos.",
  icons: { icon: "/icon.png", shortcut: "/favicon.png" },
  other: { google: "notranslate" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/locale-switcher.tsx src/components/layout/footer.tsx src/app/layout.tsx
git commit -m "feat: add locale switcher, anti-translate meta tags, pass locale to layout"
```

---

### Task 4: Translate header and mobile nav

**Files:**
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/layout/mobile-nav.tsx`

- [ ] **Step 1: Update Header to use translations**

```tsx
// src/components/layout/header.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { t, type Locale } from "@/lib/i18n/translations";

export function Header({ locale }: { locale: Locale }) {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <img src="/images/logo.png" alt="Logo" className="h-8" />
          Veteranos Futebol
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/equipas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t("common.teams", locale)}
          </Link>
          <Link href="/sugestoes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t("common.suggestions", locale)}
          </Link>
          <Link href="/registar">
            <Button variant="outline" size="sm">{t("header.registerTeam", locale)}</Button>
          </Link>
          <Link href="/login">
            <Button size="sm">{t("header.access", locale)}</Button>
          </Link>
        </nav>
        <MobileNav locale={locale} />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Update MobileNav to use translations**

```tsx
// src/components/layout/mobile-nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { t, type Locale } from "@/lib/i18n/translations";

export function MobileNav({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-muted transition-colors">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px]">
        <nav className="flex flex-col gap-4 mt-8">
          <Link href="/equipas" onClick={() => setOpen(false)} className="text-lg hover:text-primary transition-colors">
            {t("common.teams", locale)}
          </Link>
          <Link href="/sugestoes" onClick={() => setOpen(false)} className="text-lg hover:text-primary transition-colors">
            {t("common.suggestions", locale)}
          </Link>
          <Link href="/registar" onClick={() => setOpen(false)} className="text-lg hover:text-primary transition-colors">
            {t("header.registerTeam", locale)}
          </Link>
          <Link href="/login" onClick={() => setOpen(false)} className="text-lg hover:text-primary transition-colors">
            {t("header.access", locale)}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/header.tsx src/components/layout/mobile-nav.tsx
git commit -m "feat: translate header and mobile nav"
```

---

### Task 5: Translate homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update homepage with translations**

Replace all hard-coded PT strings with `t()` calls. Import `getLocale` and `t`/`tFn`. The page is already a server component.

Key changes:
- Import `getLocale`, `t`, `tFn` from i18n
- Call `const locale = await getLocale()` at the top of the component
- Replace every string literal with the corresponding `t("key", locale)` call
- For the "teamsOnMap" string, use `tFn<(a: number, b: number) => string>("home.teamsOnMap", locale)(teamsOnMap, total)`
- For the suggestions link text, use `t("home.questionsHint", locale)` + keep the link

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: translate homepage"
```

---

### Task 6: Redesign login page with two clear sections

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/auth/login-form.tsx`

- [ ] **Step 1: Update login page with two sections**

```tsx
// src/app/login/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const locale = await getLocale();

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      {error === "expired" && (
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-400 mb-6">
          {t("login.expiredError", locale)}
        </div>
      )}
      {error === "invalid" && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-6">
          {t("login.invalidError", locale)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section A: Existing team */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("login.existingTeamTitle", locale)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t("login.existingTeamDesc", locale)}
            </p>
            <LoginForm locale={locale} />
          </CardContent>
        </Card>

        {/* Section B: New team */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">{t("login.newTeamTitle", locale)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              {t("login.newTeamDesc", locale)}
            </p>
            <Link href="/registar">
              <Button variant="outline" className="w-full" size="lg">
                {t("login.registerNewTeam", locale)}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update LoginForm with translations and email change feature**

```tsx
// src/components/auth/login-form.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { t, type Locale } from "@/lib/i18n/translations";

export function LoginForm({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [oldEmail, setOldEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [changeSubmitted, setChangeSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/auth/request-email-change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldEmail, newEmail }),
    });
    setChangeSubmitted(true);
  }

  if (sent) {
    return (
      <div className="text-center p-4">
        <div className="text-4xl mb-4">&#9993;</div>
        <h2 className="text-xl font-bold mb-2">{t("login.emailSent", locale)}</h2>
        <p className="text-sm text-muted-foreground">{t("login.emailSentDesc", locale)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">{t("form.coordinatorEmail", locale)}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("login.sending", locale) : t("login.sendAccessLink", locale)}
        </Button>
      </form>

      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setShowEmailChange(!showEmailChange)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
        >
          {t("login.changeEmailLink", locale)}
        </button>

        {showEmailChange && !changeSubmitted && (
          <form onSubmit={handleEmailChange} className="space-y-3 mt-3">
            <div>
              <Label htmlFor="oldEmail" className="text-xs">{t("login.changeEmailCurrentLabel", locale)}</Label>
              <Input
                id="oldEmail"
                type="email"
                value={oldEmail}
                onChange={(e) => setOldEmail(e.target.value)}
                required
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="newEmail" className="text-xs">{t("login.changeEmailNewLabel", locale)}</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="h-8 text-sm"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              {t("login.changeEmailSubmit", locale)}
            </Button>
          </form>
        )}

        {changeSubmitted && (
          <p className="text-sm text-green-400 mt-3">{t("login.changeEmailSent", locale)}</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create email change request API**

```typescript
// src/app/api/auth/request-email-change/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { suggestions } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const { oldEmail, newEmail } = await request.json();

    if (!oldEmail || !newEmail) {
      return NextResponse.json({ error: "Emails obrigatorios" }, { status: 400 });
    }

    // Create a suggestion for admins to process
    await db.insert(suggestions).values({
      authorName: "Pedido Automatico",
      authorEmail: oldEmail,
      subject: "Pedido de alteracao de email",
      message: `Pedido de alteracao de email do coordenador.\n\nEmail atual: ${oldEmail}\nNovo email: ${newEmail}`,
      status: "pending",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Don't reveal errors
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/login/page.tsx src/components/auth/login-form.tsx src/app/api/auth/request-email-change/route.ts
git commit -m "feat: redesign login page with two sections + email change request"
```

---

### Task 7: Translate register page and success page

**Files:**
- Modify: `src/app/registar/page.tsx`
- Modify: `src/app/registar/sucesso/page.tsx`

- [ ] **Step 1: Update register page**

Add link back to login for users who already have a team. Import locale and use `t()` for strings. Add a banner at the top:

```tsx
// Key changes to src/app/registar/page.tsx:
// 1. Import getLocale and t
// 2. Get locale in RegistarPage
// 3. Replace hard-coded strings with t() calls
// 4. Add banner: "A sua equipa ja esta registada? Aceda aqui..." linking to /login
// 5. Pass locale and translated submitLabel to TeamForm
```

The register page becomes async (it's a server component, already fine):
- Add `const locale = await getLocale()` in `RegistarPage()`
- Replace title with `t("register.title", locale)`
- Replace subtitle with `t("register.subtitle", locale)`
- Add after subtitle: a link to /login with `t("register.alreadyRegistered", locale)` + `t("register.goToLogin", locale)`
- Pass `submitLabel={t("register.submitButton", locale)}` to TeamForm

- [ ] **Step 2: Update success page**

```tsx
// src/app/registar/sucesso/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";

export default async function RegistoSucessoPage() {
  const locale = await getLocale();

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-5xl mb-4">&#9989;</div>
          <h1 className="text-2xl font-bold mb-2">{t("registerSuccess.title", locale)}</h1>
          <p className="text-muted-foreground mb-6">{t("registerSuccess.desc", locale)}</p>
          <Link href="/equipas">
            <Button variant="outline">{t("registerSuccess.viewAll", locale)}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/registar/page.tsx src/app/registar/sucesso/page.tsx
git commit -m "feat: translate register page and success page, add link to login"
```

---

### Task 8: Resolve Google Maps short URLs

**Files:**
- Modify: `src/lib/geo.ts`
- Modify: `src/lib/form-helpers.ts`
- Modify: `src/app/registar/page.tsx` (extractTeamFields is called in server action)
- Modify: `src/app/dashboard/[teamId]/page.tsx` (extractTeamFields is called in server action)

- [ ] **Step 1: Make extractCoordinates async and resolve short URLs**

```typescript
// src/lib/geo.ts
type Coordinates = { latitude: number; longitude: number };

function extractFromFullUrl(url: string): Coordinates | null {
  // Try @lat,lng format
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return { latitude: parseFloat(atMatch[1]), longitude: parseFloat(atMatch[2]) };
  }

  // Try !3d{lat}!4d{lng} format
  const dataMatch = url.match(/!3d(-?\d+\.?\d*).*!4d(-?\d+\.?\d*)/);
  if (dataMatch) {
    return { latitude: parseFloat(dataMatch[1]), longitude: parseFloat(dataMatch[2]) };
  }

  // Try q=lat,lng format
  const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) {
    return { latitude: parseFloat(qMatch[1]), longitude: parseFloat(qMatch[2]) };
  }

  return null;
}

export async function extractCoordinates(
  url: string | null | undefined
): Promise<Coordinates | null> {
  if (!url) return null;

  // Try raw coordinates: "38.821488,-9.292596"
  const rawMatch = url.trim().match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { latitude: lat, longitude: lng };
    }
  }

  // Try full URL first
  const fromFull = extractFromFullUrl(url);
  if (fromFull) return fromFull;

  // Try resolving short URLs (goo.gl, maps.app.goo.gl)
  if (url.includes("goo.gl") || url.includes("maps.app")) {
    try {
      const response = await fetch(url, { method: "HEAD", redirect: "follow" });
      const resolved = response.url;
      if (resolved !== url) {
        const fromResolved = extractFromFullUrl(resolved);
        if (fromResolved) return fromResolved;
      }
    } catch {
      // Network error - return null
    }
  }

  return null;
}
```

- [ ] **Step 2: Make extractTeamFields async**

```typescript
// src/lib/form-helpers.ts
import { extractCoordinates } from "@/lib/geo";

export async function extractTeamFields(formData: FormData) {
  let mapsUrl = (formData.get("mapsUrl") as string)?.trim() || null;
  const coords = await extractCoordinates(mapsUrl);

  // If user entered raw coordinates, convert to a Google Maps link
  if (mapsUrl && coords && /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(mapsUrl)) {
    mapsUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
  }
  // ... rest unchanged
```

- [ ] **Step 3: Update callers to await extractTeamFields**

In `src/app/registar/page.tsx` the server action `registerTeam` already calls `extractTeamFields(formData)` -- add `await`:
```typescript
const fields = await extractTeamFields(formData);
```

In `src/app/dashboard/[teamId]/page.tsx` the server action `updateTeam` -- add `await`:
```typescript
const fields = await extractTeamFields(formData);
```

In `src/app/admin/equipas/[id]/page.tsx` if it also calls `extractTeamFields` -- add `await`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/geo.ts src/lib/form-helpers.ts src/app/registar/page.tsx src/app/dashboard/[teamId]/page.tsx
git commit -m "feat: resolve Google Maps short URLs, make extractCoordinates async"
```

---

### Task 9: Translate auth callback and magic link email

**Files:**
- Modify: `src/app/auth/callback/route.ts`
- Modify: `src/lib/email/send-magic-link.ts`
- Modify: `src/app/api/auth/verify/route.ts`

- [ ] **Step 1: Update auth callback page text**

In `src/app/auth/callback/route.ts`, the HTML body text should be translated. Read the locale cookie from the request:

```typescript
// In the GET handler, after consuming the callback token:
const localeCookie = request.cookies.get("locale")?.value;
const locale = (localeCookie === "es" || localeCookie === "br") ? localeCookie : "pt";

// Use the translations object inline for the simple HTML string:
const authText: Record<string, string> = {
  pt: "A autenticar... por favor aguarde.",
  br: "Autenticando... por favor aguarde.",
  es: "Autenticando... por favor espere.",
};
// Use authText[locale] in the HTML body
```

- [ ] **Step 2: Translate magic link email**

```typescript
// src/lib/email/send-magic-link.ts
// Add locale parameter and translate subject + body
import type { Locale } from "@/lib/i18n/translations";

export async function sendMagicLinkEmail(
  email: string,
  magicLink: string,
  locale: Locale = "pt"
): Promise<boolean> {
  const subjects: Record<Locale, string> = {
    pt: "Aceda a sua equipa -- Veteranos Futebol",
    br: "Acesse sua equipe -- Veteranos Futebol",
    es: "Acceda a su equipo -- Veteranos Futbol",
  };
  const bodyTexts: Record<Locale, { intro: string; button: string; expiry: string; ignore: string }> = {
    pt: { intro: "Clique no link abaixo para aceder a sua equipa:", button: "Aceder a Minha Equipa", expiry: "Este link expira em 24 horas.", ignore: "Se nao solicitou este acesso, ignore este email." },
    br: { intro: "Clique no link abaixo para acessar sua equipe:", button: "Acessar Minha Equipe", expiry: "Este link expira em 24 horas.", ignore: "Se nao solicitou este acesso, ignore este email." },
    es: { intro: "Haga clic en el enlace de abajo para acceder a su equipo:", button: "Acceder a Mi Equipo", expiry: "Este enlace expira en 24 horas.", ignore: "Si no solicito este acceso, ignore este email." },
  };
  const txt = bodyTexts[locale];
  // Use txt.intro, txt.button, txt.expiry, txt.ignore in the HTML template
```

- [ ] **Step 3: Pass locale through verify flow**

In `src/app/api/auth/verify/route.ts`, read the locale cookie and include it in the callback token so the callback route can use it. Alternatively, just read the cookie directly in each route (simpler).

In `src/app/api/auth/magic-link/route.ts` and `src/app/registar/page.tsx`, pass locale to `sendMagicLinkEmail`.

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/callback/route.ts src/lib/email/send-magic-link.ts src/app/api/auth/magic-link/route.ts src/app/api/auth/verify/route.ts src/app/registar/page.tsx
git commit -m "feat: translate auth callback, magic link email, and verification flow"
```

---

### Task 10: Update maps hint in team form

**Files:**
- Modify: `src/components/teams/team-form.tsx`

- [ ] **Step 1: Update maps URL hint text**

The team form is a client component, so we need to pass locale as a prop. However, changing the entire form to use translations is a large change. For now, update the maps hint to be more helpful and accept the locale prop for the hint text.

The maps hint should change from:
```
Cole o link completo do Google Maps (nao apenas as coordenadas)
```
to the translated version from `form.mapsHint` which now says it accepts short links too.

Since TeamForm is used from multiple server components that now have locale available, pass `locale` as an optional prop and use it for the maps hint. Full form translation can be a follow-up.

- [ ] **Step 2: Commit**

```bash
git add src/components/teams/team-form.tsx
git commit -m "feat: update maps URL hint to mention short links support"
```

---

### Task 11: Build and verify

- [ ] **Step 1: Run build**

```bash
cd ~/Mixed-Projects/veteranos-futebol && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Fix any TypeScript or build errors**

Address any issues found during build.

- [ ] **Step 3: Final commit and push**

```bash
git add -A
git commit -m "fix: resolve build issues"
git push
```
