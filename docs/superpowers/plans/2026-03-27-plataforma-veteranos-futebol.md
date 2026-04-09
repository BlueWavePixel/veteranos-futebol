# Plataforma Veteranos Futebol — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web platform replacing Google Forms + Excel + WhatsApp for managing ~314 veteran football team contacts, with role-based access, magic link auth, interactive map, and RGPD compliance.

**Architecture:** Next.js 16 App Router full-stack app with Neon Postgres (via Drizzle ORM), magic link auth for coordinators (Resend), Google OAuth for admins, Leaflet map, and shadcn/ui. Server Components by default, Client Components only for interactive elements (map, forms, search).

**Tech Stack:** Next.js 16, TypeScript, Neon Postgres, Drizzle ORM, Resend, NextAuth.js (credentials + Google), Leaflet/react-leaflet, shadcn/ui, Tailwind CSS, Vercel hosting.

---

## File Structure

```
veteranos-futebol/
├── drizzle.config.ts                    # Drizzle ORM config
├── next.config.ts                       # Next.js config
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── .env.local.example                   # Template for env vars
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout (dark theme, fonts, providers)
│   │   ├── page.tsx                     # Homepage (map + search + CTAs)
│   │   ├── equipas/
│   │   │   ├── page.tsx                 # Team listing with filters
│   │   │   └── [slug]/
│   │   │       └── page.tsx             # Individual team page
│   │   ├── registar/
│   │   │   └── page.tsx                 # Registration form
│   │   ├── login/
│   │   │   └── page.tsx                 # Coordinator login (email input)
│   │   ├── auth/
│   │   │   └── verify/
│   │   │       └── page.tsx             # Magic link verification
│   │   ├── dashboard/
│   │   │   ├── page.tsx                 # Coordinator dashboard
│   │   │   ├── [teamId]/
│   │   │   │   ├── page.tsx             # Edit team
│   │   │   │   ├── transferir/
│   │   │   │   │   └── page.tsx         # Transfer coordinator
│   │   │   │   └── eliminar/
│   │   │   │       └── page.tsx         # Delete team (RGPD)
│   │   │   └── layout.tsx               # Dashboard layout (auth guard)
│   │   ├── admin/
│   │   │   ├── page.tsx                 # Admin dashboard (stats + team list)
│   │   │   ├── layout.tsx               # Admin layout (auth guard)
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # Google OAuth login
│   │   │   ├── equipas/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Admin edit team
│   │   │   ├── transferir/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Admin transfer coordinator
│   │   │   ├── moderadores/
│   │   │   │   └── page.tsx             # Manage moderators (super admin)
│   │   │   └── importar/
│   │   │       └── page.tsx             # Excel import
│   │   ├── privacidade/
│   │   │   └── page.tsx                 # Privacy policy
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/
│   │       │   │   └── route.ts         # NextAuth route handler
│   │       │   └── magic-link/
│   │       │       └── route.ts         # Send magic link endpoint
│   │       ├── teams/
│   │       │   └── route.ts             # Teams API (search, filter)
│   │       └── import/
│   │           └── route.ts             # Excel import endpoint
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                 # Drizzle client instance
│   │   │   ├── schema.ts               # All table schemas
│   │   │   └── migrate.ts              # Migration runner
│   │   ├── auth/
│   │   │   ├── config.ts               # NextAuth config
│   │   │   ├── magic-link.ts           # Magic link create/verify logic
│   │   │   └── session.ts              # Session helpers (getSession, requireAuth, requireAdmin)
│   │   ├── email/
│   │   │   └── send-magic-link.ts      # Resend email sender
│   │   ├── geo.ts                       # Google Maps URL → lat/lng parser
│   │   ├── slug.ts                      # Team name → slug generator
│   │   └── audit.ts                     # Audit log helper
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components (auto-generated)
│   │   ├── map/
│   │   │   ├── portugal-map.tsx         # Main map component (client)
│   │   │   └── team-marker.tsx          # Map pin with popup
│   │   ├── teams/
│   │   │   ├── team-card.tsx            # Team card for listing
│   │   │   ├── team-filters.tsx         # Search + district/county filters (client)
│   │   │   ├── team-form.tsx            # Registration/edit form (client)
│   │   │   └── team-contact.tsx         # Contact info (conditional on auth)
│   │   ├── layout/
│   │   │   ├── header.tsx               # Site header with nav
│   │   │   ├── footer.tsx               # Site footer
│   │   │   └── mobile-nav.tsx           # Mobile navigation (client)
│   │   └── auth/
│   │       ├── login-form.tsx           # Email input for magic link (client)
│   │       └── rgpd-consent.tsx         # RGPD checkbox with text
│   └── scripts/
│       └── import-excel.ts             # One-time Excel import script
├── drizzle/
│   └── migrations/                      # SQL migration files (auto-generated)
└── tests/
    ├── lib/
    │   ├── geo.test.ts
    │   ├── slug.test.ts
    │   ├── magic-link.test.ts
    │   └── audit.test.ts
    └── scripts/
        └── import-excel.test.ts
```

---

### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `veteranos-futebol/package.json`
- Create: `veteranos-futebol/.env.local.example`
- Create: `veteranos-futebol/.gitignore`

- [ ] **Step 1: Create Next.js project**

```bash
cd /home/pestanislau/Mixed-Projects
npx create-next-app@latest veteranos-futebol --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Project scaffolded with `src/app` structure.

- [ ] **Step 2: Install core dependencies**

```bash
cd /home/pestanislau/Mixed-Projects/veteranos-futebol
npm install drizzle-orm @neondatabase/serverless next-auth@beta resend
npm install -D drizzle-kit
```

- [ ] **Step 3: Install UI dependencies**

```bash
cd /home/pestanislau/Mixed-Projects/veteranos-futebol
npx shadcn@latest init --defaults
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

- [ ] **Step 4: Install test dependencies**

```bash
cd /home/pestanislau/Mixed-Projects/veteranos-futebol
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 5: Create .env.local.example**

Create `veteranos-futebol/.env.local.example`:
```env
# Neon Postgres
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Google OAuth (for admin login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Resend (magic links)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 6: Add vitest config**

Create `veteranos-futebol/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Verify setup**

```bash
cd /home/pestanislau/Mixed-Projects/veteranos-futebol
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 8: Commit**

```bash
cd /home/pestanislau/Mixed-Projects/veteranos-futebol
git init
git add .
git commit -m "chore: scaffold Next.js project with dependencies"
```

---

### Task 2: Database Schema & Drizzle Setup

**Files:**
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/index.ts`
- Create: `drizzle.config.ts`

- [ ] **Step 1: Write Drizzle config**

Create `veteranos-futebol/drizzle.config.ts`:
```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 2: Write database schema**

Create `src/lib/db/schema.ts`:
```ts
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  decimal,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("admin_role", [
  "super_admin",
  "moderator",
]);

export const actorTypeEnum = pgEnum("actor_type", [
  "coordinator",
  "moderator",
  "super_admin",
]);

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  coordinatorName: text("coordinator_name").notNull(),
  coordinatorAltName: text("coordinator_alt_name"),
  coordinatorEmail: text("coordinator_email").notNull(),
  coordinatorPhone: text("coordinator_phone"),
  coordinatorAltPhone: text("coordinator_alt_phone"),
  dinnerThirdParty: boolean("dinner_third_party"),
  kitPrimary: text("kit_primary"),
  kitSecondary: text("kit_secondary"),
  fieldName: text("field_name"),
  fieldAddress: text("field_address"),
  location: text("location"),
  mapsUrl: text("maps_url"),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  notes: text("notes"),
  rgpdConsent: boolean("rgpd_consent").notNull().default(false),
  rgpdConsentAt: timestamp("rgpd_consent_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: adminRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const authTokens = pgTable("auth_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorType: actorTypeEnum("actor_type").notNull(),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type Admin = typeof admins.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;
```

- [ ] **Step 3: Write database client**

Create `src/lib/db/index.ts`:
```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 4: Generate and review migration**

```bash
cd /home/pestanislau/Mixed-Projects/veteranos-futebol
npx drizzle-kit generate
```

Expected: Migration SQL file created in `drizzle/migrations/`. Review it to ensure tables match the spec.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add database schema with Drizzle ORM (teams, admins, auth_tokens, audit_log)"
```

---

### Task 3: Utility Functions (slug, geo, audit)

**Files:**
- Create: `src/lib/slug.ts`
- Create: `src/lib/geo.ts`
- Create: `src/lib/audit.ts`
- Create: `tests/lib/slug.test.ts`
- Create: `tests/lib/geo.test.ts`

- [ ] **Step 1: Write slug tests**

Create `tests/lib/slug.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { generateSlug } from "@/lib/slug";

describe("generateSlug", () => {
  it("converts team name to URL-friendly slug", () => {
    expect(generateSlug("CCDBA - Centro Cultural Desportivo Brejos de Azeitão"))
      .toBe("ccdba-centro-cultural-desportivo-brejos-de-azeitao");
  });

  it("handles Portuguese characters", () => {
    expect(generateSlug("Veteranos São João da Madeira"))
      .toBe("veteranos-sao-joao-da-madeira");
  });

  it("removes extra spaces and special characters", () => {
    expect(generateSlug("  FC Porto (Veteranos)  "))
      .toBe("fc-porto-veteranos");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/pestanislau/Mixed-Projects/veteranos-futebol
npx vitest run tests/lib/slug.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement slug generator**

Create `src/lib/slug.ts`:
```ts
export function generateSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Trim hyphens
}
```

- [ ] **Step 4: Run slug tests**

```bash
npx vitest run tests/lib/slug.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Write geo tests**

Create `tests/lib/geo.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { extractCoordinates } from "@/lib/geo";

describe("extractCoordinates", () => {
  it("extracts coords from goo.gl maps URL with @", () => {
    const url = "https://www.google.com/maps/place/Campo+da+Ordem/@39.7446206,-8.9383465,15z";
    const result = extractCoordinates(url);
    expect(result).toEqual({ latitude: 39.7446206, longitude: -8.9383465 });
  });

  it("extracts coords from goo.gl short link with !3d and !4d", () => {
    const url = "https://www.google.com/maps/place/Some+Place/data=!3m1!4b1!4m5!3m4!1s0x0:0xabc!8m2!3d38.7223!4d-9.1393";
    const result = extractCoordinates(url);
    expect(result).toEqual({ latitude: 38.7223, longitude: -9.1393 });
  });

  it("returns null for non-maps URL", () => {
    expect(extractCoordinates("https://example.com")).toBeNull();
  });

  it("returns null for null/undefined input", () => {
    expect(extractCoordinates(null)).toBeNull();
    expect(extractCoordinates(undefined)).toBeNull();
  });

  it("extracts from shortened goo.gl/maps URLs with @ format", () => {
    const url = "https://goo.gl/maps/KCvkSTfR6xgvkjfq6";
    // Short URLs cannot be parsed without HTTP redirect — return null
    expect(extractCoordinates(url)).toBeNull();
  });
});
```

- [ ] **Step 6: Run geo tests to verify they fail**

```bash
npx vitest run tests/lib/geo.test.ts
```

Expected: FAIL.

- [ ] **Step 7: Implement geo parser**

Create `src/lib/geo.ts`:
```ts
type Coordinates = { latitude: number; longitude: number };

export function extractCoordinates(
  url: string | null | undefined
): Coordinates | null {
  if (!url) return null;

  // Try @lat,lng format (most common in full Google Maps URLs)
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return {
      latitude: parseFloat(atMatch[1]),
      longitude: parseFloat(atMatch[2]),
    };
  }

  // Try !3d{lat}!4d{lng} format (data URLs)
  const dataMatch = url.match(/!3d(-?\d+\.?\d*).*!4d(-?\d+\.?\d*)/);
  if (dataMatch) {
    return {
      latitude: parseFloat(dataMatch[1]),
      longitude: parseFloat(dataMatch[2]),
    };
  }

  // Short URLs (goo.gl/maps/*) need HTTP resolution — cannot parse statically
  return null;
}
```

- [ ] **Step 8: Run geo tests**

```bash
npx vitest run tests/lib/geo.test.ts
```

Expected: All PASS.

- [ ] **Step 9: Implement audit logger**

Create `src/lib/audit.ts`:
```ts
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";

type ActorType = "coordinator" | "moderator" | "super_admin";

export async function logAudit(params: {
  actorType: ActorType;
  actorEmail: string;
  action: string;
  teamId?: string;
  details?: Record<string, unknown>;
}) {
  await db.insert(auditLog).values({
    actorType: params.actorType,
    actorEmail: params.actorEmail,
    action: params.action,
    teamId: params.teamId,
    details: params.details,
  });
}
```

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: add slug generator, geo parser, and audit logger with tests"
```

---

### Task 4: Auth — Magic Link System

**Files:**
- Create: `src/lib/auth/magic-link.ts`
- Create: `src/lib/email/send-magic-link.ts`
- Create: `src/app/api/auth/magic-link/route.ts`
- Create: `src/app/auth/verify/page.tsx`
- Create: `tests/lib/magic-link.test.ts`

- [ ] **Step 1: Write magic link tests**

Create `tests/lib/magic-link.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { createTokenHash, isTokenExpired } from "@/lib/auth/magic-link";

describe("createTokenHash", () => {
  it("creates a SHA-256 hash of the token", () => {
    const hash = createTokenHash("test-token-123");
    expect(hash).toHaveLength(64); // SHA-256 hex length
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it("produces different hashes for different tokens", () => {
    const hash1 = createTokenHash("token-a");
    const hash2 = createTokenHash("token-b");
    expect(hash1).not.toBe(hash2);
  });

  it("produces same hash for same token", () => {
    const hash1 = createTokenHash("same-token");
    const hash2 = createTokenHash("same-token");
    expect(hash1).toBe(hash2);
  });
});

describe("isTokenExpired", () => {
  it("returns false for future expiry", () => {
    const future = new Date(Date.now() + 60_000);
    expect(isTokenExpired(future)).toBe(false);
  });

  it("returns true for past expiry", () => {
    const past = new Date(Date.now() - 60_000);
    expect(isTokenExpired(past)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/lib/magic-link.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement magic link utilities**

Create `src/lib/auth/magic-link.ts`:
```ts
import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";
import { authTokens, teams } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

const TOKEN_EXPIRY_HOURS = 24;

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function createTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export async function createMagicLink(email: string): Promise<string | null> {
  // Find teams with this email
  const teamList = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.coordinatorEmail, email.toLowerCase().trim()));

  if (teamList.length === 0) return null;

  const token = generateToken();
  const hash = createTokenHash(token);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Store token (email-based, not team-specific — covers multi-team coordinators)
  await db.insert(authTokens).values({
    email: email.toLowerCase().trim(),
    tokenHash: hash,
    expiresAt,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl}/auth/verify?token=${token}`;
}

export async function verifyMagicLink(
  token: string
): Promise<{ email: string } | null> {
  const hash = createTokenHash(token);

  const [record] = await db
    .select()
    .from(authTokens)
    .where(and(eq(authTokens.tokenHash, hash), isNull(authTokens.usedAt)));

  if (!record) return null;
  if (isTokenExpired(record.expiresAt)) return null;

  // Mark token as used
  await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(eq(authTokens.id, record.id));

  return { email: record.email };
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/lib/magic-link.test.ts
```

Expected: All PASS (only pure functions tested, DB-dependent functions tested via integration).

- [ ] **Step 5: Implement email sender**

Create `src/lib/email/send-magic-link.ts`:
```ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLinkEmail(
  email: string,
  magicLink: string
): Promise<boolean> {
  const { error } = await resend.emails.send({
    from: "Veteranos Futebol <noreply@resend.dev>",
    to: email,
    subject: "Aceda à sua equipa — Veteranos Futebol",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Veteranos Futebol</h2>
        <p>Clique no link abaixo para aceder à sua equipa:</p>
        <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Aceder à Minha Equipa
        </a>
        <p style="color: #666; font-size: 14px;">Este link expira em 24 horas.</p>
        <p style="color: #666; font-size: 14px;">Se não solicitou este acesso, ignore este email.</p>
      </div>
    `,
  });

  return !error;
}
```

- [ ] **Step 6: Implement magic link API route**

Create `src/app/api/auth/magic-link/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { createMagicLink } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email/send-magic-link";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Email é obrigatório" },
      { status: 400 }
    );
  }

  const magicLink = await createMagicLink(email.trim());

  // Always return success to prevent email enumeration
  if (magicLink) {
    await sendMagicLinkEmail(email.trim(), magicLink);
  }

  return NextResponse.json({
    message: "Se o email estiver registado, receberá um link de acesso.",
  });
}
```

- [ ] **Step 7: Implement verify page**

Create `src/app/auth/verify/page.tsx`:
```tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyMagicLink } from "@/lib/auth/magic-link";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/login?error=invalid");
  }

  const result = await verifyMagicLink(token);

  if (!result) {
    redirect("/login?error=expired");
  }

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set("coordinator_email", result.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  redirect("/dashboard");
}
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: implement magic link auth system (create, verify, email)"
```

---

### Task 5: Auth — Session Helpers & Admin Google OAuth

**Files:**
- Create: `src/lib/auth/session.ts`
- Create: `src/lib/auth/config.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Implement session helpers**

Create `src/lib/auth/session.ts`:
```ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "./config";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCoordinatorEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("coordinator_email")?.value || null;
}

export async function requireCoordinator(): Promise<string> {
  const email = await getCoordinatorEmail();
  if (!email) redirect("/login");
  return email;
}

export async function getAdminSession() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) return null;

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, session.user.email));

  return admin || null;
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function requireSuperAdmin() {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") redirect("/admin");
  return admin;
}
```

- [ ] **Step 2: Implement NextAuth config**

Create `src/lib/auth/config.ts`:
```ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async signIn({ user }) {
      // Only allow sign-in if email is in admins table
      // This is checked in the session helper, but we allow sign-in
      // so we can show a "not authorized" message
      return true;
    },
  },
};
```

- [ ] **Step 3: Implement NextAuth route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:
```ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add session helpers and Google OAuth for admin login"
```

---

### Task 6: Root Layout & shadcn/ui Theme

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/globals.css` (modify existing)
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/footer.tsx`

- [ ] **Step 1: Install shadcn/ui components needed for layout**

```bash
cd /home/pestanislau/Mixed-Projects/veteranos-futebol
npx shadcn@latest add button card input label separator sheet navigation-menu badge
```

- [ ] **Step 2: Update globals.css for dark green theme**

Modify `src/app/globals.css` — replace the `:root` and `.dark` CSS variable blocks with a dark-green football theme using oklch values. Keep all Tailwind directives. Set dark mode as default.

- [ ] **Step 3: Update root layout**

Modify `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Veteranos Futebol — Contactos de Equipas",
  description:
    "Plataforma de contactos de equipas de veteranos de futebol. Encontre equipas, marque jogos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Implement Header**

Create `src/components/layout/header.tsx`:
```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-green-500">&#9917;</span>
          Veteranos Futebol
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/equipas"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Equipas
          </Link>
          <Link href="/registar">
            <Button variant="outline" size="sm">
              Registar Equipa
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" variant="default">
              Aceder
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Implement Footer**

Create `src/components/layout/footer.tsx`:
```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Veteranos Futebol</p>
        <nav className="flex gap-4">
          <Link href="/privacidade" className="hover:text-foreground transition-colors">
            Política de Privacidade
          </Link>
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Verify layout renders**

```bash
npm run dev
```

Visit `http://localhost:3000` — verify dark theme, header with nav, footer.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add root layout with dark green theme, header, and footer"
```

---

### Task 7: Homepage — Map & Search

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/map/portugal-map.tsx`
- Create: `src/components/map/team-marker.tsx`
- Create: `src/app/api/teams/route.ts`

- [ ] **Step 1: Implement Teams API route**

Create `src/app/api/teams/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, ilike, and, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const location = searchParams.get("location");

  const conditions = [eq(teams.isActive, true)];

  if (query) {
    conditions.push(
      or(
        ilike(teams.name, `%${query}%`),
        ilike(teams.location, `%${query}%`)
      )!
    );
  }

  if (location) {
    conditions.push(ilike(teams.location, `%${location}%`));
  }

  const result = await db
    .select({
      id: teams.id,
      slug: teams.slug,
      name: teams.name,
      logoUrl: teams.logoUrl,
      location: teams.location,
      kitPrimary: teams.kitPrimary,
      kitSecondary: teams.kitSecondary,
      latitude: teams.latitude,
      longitude: teams.longitude,
      fieldName: teams.fieldName,
      dinnerThirdParty: teams.dinnerThirdParty,
    })
    .from(teams)
    .where(and(...conditions))
    .orderBy(teams.name);

  return NextResponse.json(result);
}
```

- [ ] **Step 2: Implement map component**

Create `src/components/map/portugal-map.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon in Next.js
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type TeamMapData = {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  latitude: string | null;
  longitude: string | null;
};

export function PortugalMap({ teams }: { teams: TeamMapData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-lg animate-pulse" />
    );
  }

  const teamsWithCoords = teams.filter(
    (t) => t.latitude && t.longitude
  );

  // Center of Portugal
  const center: [number, number] = [39.5, -8.0];

  return (
    <MapContainer
      center={center}
      zoom={7}
      className="w-full h-[500px] rounded-lg z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {teamsWithCoords.map((team) => (
        <Marker
          key={team.id}
          position={[parseFloat(team.latitude!), parseFloat(team.longitude!)]}
          icon={markerIcon}
        >
          <Popup>
            <Link
              href={`/equipas/${team.slug}`}
              className="font-semibold text-green-700 hover:underline"
            >
              {team.name}
            </Link>
            {team.location && (
              <p className="text-sm text-gray-600">{team.location}</p>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

- [ ] **Step 3: Implement homepage**

Modify `src/app/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { PortugalMap } from "@/components/map/portugal-map";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  const allTeams = await db
    .select({
      id: teams.id,
      slug: teams.slug,
      name: teams.name,
      location: teams.location,
      latitude: teams.latitude,
      longitude: teams.longitude,
    })
    .from(teams)
    .where(eq(teams.isActive, true))
    .orderBy(teams.name);

  const [{ total }] = await db
    .select({ total: count() })
    .from(teams)
    .where(eq(teams.isActive, true));

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Veteranos Futebol</h1>
        <p className="text-muted-foreground text-lg mb-4">
          Contactos de equipas de veteranos de futebol
        </p>
        <p className="text-2xl font-mono font-bold text-green-500">
          {total} equipas registadas
        </p>
      </section>

      <section className="mb-8">
        <PortugalMap teams={allTeams} />
      </section>

      <section className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/equipas">
          <Button size="lg" variant="outline">
            Ver Todas as Equipas
          </Button>
        </Link>
        <Link href="/registar">
          <Button size="lg">Registar a Minha Equipa</Button>
        </Link>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Verify homepage renders**

```bash
npm run dev
```

Visit `http://localhost:3000` — verify map loads centered on Portugal, counter shows, CTAs work.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add homepage with interactive Portugal map and team counters"
```

---

### Task 8: Team Listing Page with Filters

**Files:**
- Create: `src/app/equipas/page.tsx`
- Create: `src/components/teams/team-card.tsx`
- Create: `src/components/teams/team-filters.tsx`

- [ ] **Step 1: Install additional shadcn components**

```bash
npx shadcn@latest add select avatar table
```

- [ ] **Step 2: Implement team card**

Create `src/components/teams/team-card.tsx`:
```tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Team } from "@/lib/db/schema";

type TeamCardProps = {
  team: Pick<
    Team,
    "slug" | "name" | "logoUrl" | "location" | "kitPrimary" | "kitSecondary" | "fieldName" | "dinnerThirdParty"
  >;
};

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/equipas/${team.slug}`}>
      <Card className="hover:border-green-500/50 transition-colors h-full">
        <CardContent className="p-4 flex gap-4">
          {team.logoUrl ? (
            <img
              src={team.logoUrl.replace(
                /\/open\?id=/,
                "/uc?export=view&id="
              )}
              alt={`Logotipo ${team.name}`}
              className="w-16 h-16 rounded-md object-contain bg-muted"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-2xl">
              &#9917;
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{team.name}</h3>
            {team.location && (
              <p className="text-sm text-muted-foreground">{team.location}</p>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              {team.kitPrimary && (
                <Badge variant="secondary" className="text-xs">
                  {team.kitPrimary}
                </Badge>
              )}
              {team.dinnerThirdParty && (
                <Badge variant="outline" className="text-xs">
                  Jantar 3&ordf; Parte
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 3: Implement team filters (client component)**

Create `src/components/teams/team-filters.tsx`:
```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransition } from "react";

export function TeamFilters({ locations }: { locations: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`/equipas?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <Input
        placeholder="Pesquisar equipa..."
        defaultValue={searchParams.get("q") || ""}
        onChange={(e) => updateFilter("q", e.target.value)}
        className="flex-1"
      />
      <Select
        defaultValue={searchParams.get("location") || "all"}
        onValueChange={(value) => updateFilter("location", value)}
      >
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="Distrito / Concelho" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os locais</SelectItem>
          {locations.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {loc}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 4: Implement team listing page**

Create `src/app/equipas/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, ilike, and, or, asc } from "drizzle-orm";
import { TeamCard } from "@/components/teams/team-card";
import { TeamFilters } from "@/components/teams/team-filters";

export default async function EquipasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string }>;
}) {
  const { q, location } = await searchParams;

  const conditions = [eq(teams.isActive, true)];

  if (q) {
    conditions.push(
      or(ilike(teams.name, `%${q}%`), ilike(teams.location, `%${q}%`))!
    );
  }

  if (location) {
    conditions.push(ilike(teams.location, `%${location}%`));
  }

  const teamList = await db
    .select()
    .from(teams)
    .where(and(...conditions))
    .orderBy(asc(teams.name));

  // Get unique locations for filter dropdown
  const allLocations = await db
    .selectDistinct({ location: teams.location })
    .from(teams)
    .where(eq(teams.isActive, true))
    .orderBy(asc(teams.location));

  const locations = allLocations
    .map((l) => l.location)
    .filter((l): l is string => l !== null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Equipas de Veteranos</h1>
      <TeamFilters locations={locations} />
      <p className="text-sm text-muted-foreground mb-4">
        {teamList.length} equipa{teamList.length !== 1 ? "s" : ""} encontrada
        {teamList.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamList.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify listing page**

```bash
npm run dev
```

Visit `http://localhost:3000/equipas` — verify grid renders, search works, filter dropdown populated.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add team listing page with search and location filters"
```

---

### Task 9: Individual Team Page

**Files:**
- Create: `src/app/equipas/[slug]/page.tsx`
- Create: `src/components/teams/team-contact.tsx`

- [ ] **Step 1: Implement contact component (auth-conditional)**

Create `src/components/teams/team-contact.tsx`:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Team } from "@/lib/db/schema";

type Props = {
  team: Pick<
    Team,
    | "coordinatorName"
    | "coordinatorAltName"
    | "coordinatorPhone"
    | "coordinatorAltPhone"
    | "coordinatorEmail"
  >;
  isAuthenticated: boolean;
};

export function TeamContact({ team, isAuthenticated }: Props) {
  if (!isAuthenticated) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Regista a tua equipa para ver os contactos
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/registar">
              <Button variant="outline" size="sm">
                Registar Equipa
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Já tenho equipa</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Contactos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Responsável</p>
          <p className="font-medium">{team.coordinatorName}</p>
          {team.coordinatorPhone && (
            <a
              href={`tel:${team.coordinatorPhone}`}
              className="text-green-500 hover:underline text-sm"
            >
              {team.coordinatorPhone}
            </a>
          )}
        </div>
        {team.coordinatorAltName && (
          <div>
            <p className="text-sm text-muted-foreground">
              Responsável Alternativo
            </p>
            <p className="font-medium">{team.coordinatorAltName}</p>
            {team.coordinatorAltPhone && (
              <a
                href={`tel:${team.coordinatorAltPhone}`}
                className="text-green-500 hover:underline text-sm"
              >
                {team.coordinatorAltPhone}
              </a>
            )}
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <a
            href={`mailto:${team.coordinatorEmail}`}
            className="text-green-500 hover:underline text-sm"
          >
            {team.coordinatorEmail}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Implement individual team page**

Create `src/app/equipas/[slug]/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getCoordinatorEmail } from "@/lib/auth/session";
import { TeamContact } from "@/components/teams/team-contact";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [team] = await db
    .select({ name: teams.name })
    .from(teams)
    .where(eq(teams.slug, slug));

  return {
    title: team ? `${team.name} — Veteranos Futebol` : "Equipa não encontrada",
  };
}

export default async function TeamPage({ params }: Props) {
  const { slug } = await params;

  const [team] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.slug, slug), eq(teams.isActive, true)));

  if (!team) notFound();

  const coordinatorEmail = await getCoordinatorEmail();
  const isAuthenticated = !!coordinatorEmail;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        {team.logoUrl ? (
          <img
            src={team.logoUrl.replace(/\/open\?id=/, "/uc?export=view&id=")}
            alt={`Logotipo ${team.name}`}
            className="w-24 h-24 rounded-lg object-contain bg-muted"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center text-4xl">
            &#9917;
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          {team.location && (
            <p className="text-muted-foreground mt-1">{team.location}</p>
          )}
          <div className="flex gap-2 mt-3 flex-wrap">
            {team.kitPrimary && (
              <Badge variant="secondary">Eq. Principal: {team.kitPrimary}</Badge>
            )}
            {team.kitSecondary && (
              <Badge variant="outline">Eq. Alternativo: {team.kitSecondary}</Badge>
            )}
            {team.dinnerThirdParty && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Jantar 3&ordf; Parte
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Campo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {team.fieldName && <p className="font-medium">{team.fieldName}</p>}
            {team.fieldAddress && (
              <p className="text-sm text-muted-foreground">{team.fieldAddress}</p>
            )}
            {team.mapsUrl && (
              <a
                href={team.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:underline text-sm inline-block mt-2"
              >
                Ver no Google Maps &rarr;
              </a>
            )}
          </CardContent>
        </Card>

        {/* Contactos — condicional */}
        <TeamContact team={team} isAuthenticated={isAuthenticated} />
      </div>

      {/* Observações */}
      {team.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{team.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify team page**

```bash
npm run dev
```

Navigate to a team page — verify layout, conditional contacts, Google Maps link.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add individual team page with conditional contact visibility"
```

---

### Task 10: Registration Form

**Files:**
- Create: `src/app/registar/page.tsx`
- Create: `src/components/teams/team-form.tsx`
- Create: `src/components/auth/rgpd-consent.tsx`

- [ ] **Step 1: Install additional shadcn components**

```bash
npx shadcn@latest add checkbox textarea switch form
```

- [ ] **Step 2: Implement RGPD consent checkbox**

Create `src/components/auth/rgpd-consent.tsx`:
```tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export function RgpdConsent({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-4">
      <Checkbox
        id="rgpd"
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        required
      />
      <label htmlFor="rgpd" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
        Ao submeter este formulário, consinto que os meus dados pessoais (nome,
        email, telefone) sejam armazenados e partilhados com outras equipas de
        veteranos registadas na plataforma, com a finalidade exclusiva de
        facilitar o contacto para marcação de jogos. Posso a qualquer momento
        editar ou eliminar os meus dados. Consulte a nossa{" "}
        <Link href="/privacidade" className="text-green-500 hover:underline" target="_blank">
          Política de Privacidade
        </Link>
        .
      </label>
    </div>
  );
}
```

- [ ] **Step 3: Implement team form (client component)**

Create `src/components/teams/team-form.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RgpdConsent } from "@/components/auth/rgpd-consent";
import type { Team } from "@/lib/db/schema";

type TeamFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  defaultValues?: Partial<Team>;
  submitLabel?: string;
  showRgpd?: boolean;
};

export function TeamForm({
  action,
  defaultValues,
  submitLabel = "Registar Equipa",
  showRgpd = true,
}: TeamFormProps) {
  const [rgpdConsent, setRgpdConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    if (showRgpd && !rgpdConsent) {
      setError("É necessário aceitar a Política de Privacidade.");
      return;
    }
    setError(null);
    setLoading(true);
    formData.set("rgpdConsent", rgpdConsent ? "true" : "false");
    const result = await action(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Dados da Equipa */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Dados da Equipa</legend>

        <div>
          <Label htmlFor="name">Nome da Equipa *</Label>
          <Input id="name" name="name" required defaultValue={defaultValues?.name || ""} />
        </div>

        <div>
          <Label htmlFor="logoUrl">Link do Logotipo (Google Drive)</Label>
          <Input id="logoUrl" name="logoUrl" type="url" defaultValue={defaultValues?.logoUrl || ""} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="kitPrimary">Equipamento Principal</Label>
            <Input id="kitPrimary" name="kitPrimary" defaultValue={defaultValues?.kitPrimary || ""} />
          </div>
          <div>
            <Label htmlFor="kitSecondary">Equipamento Alternativo</Label>
            <Input id="kitSecondary" name="kitSecondary" defaultValue={defaultValues?.kitSecondary || ""} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="dinnerThirdParty"
            name="dinnerThirdParty"
            defaultChecked={defaultValues?.dinnerThirdParty || false}
          />
          <Label htmlFor="dinnerThirdParty">Disponível para Jantar (3ª Parte)</Label>
        </div>
      </fieldset>

      {/* Responsável */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Responsável</legend>

        <div>
          <Label htmlFor="coordinatorEmail">Email do Responsável *</Label>
          <Input id="coordinatorEmail" name="coordinatorEmail" type="email" required defaultValue={defaultValues?.coordinatorEmail || ""} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="coordinatorName">Nome do Responsável *</Label>
            <Input id="coordinatorName" name="coordinatorName" required defaultValue={defaultValues?.coordinatorName || ""} />
          </div>
          <div>
            <Label htmlFor="coordinatorPhone">Contacto do Responsável</Label>
            <Input id="coordinatorPhone" name="coordinatorPhone" type="tel" defaultValue={defaultValues?.coordinatorPhone || ""} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="coordinatorAltName">Nome Responsável Alternativo</Label>
            <Input id="coordinatorAltName" name="coordinatorAltName" defaultValue={defaultValues?.coordinatorAltName || ""} />
          </div>
          <div>
            <Label htmlFor="coordinatorAltPhone">Contacto Alternativo</Label>
            <Input id="coordinatorAltPhone" name="coordinatorAltPhone" type="tel" defaultValue={defaultValues?.coordinatorAltPhone || ""} />
          </div>
        </div>
      </fieldset>

      {/* Campo */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Campo</legend>

        <div>
          <Label htmlFor="fieldName">Nome do Campo</Label>
          <Input id="fieldName" name="fieldName" defaultValue={defaultValues?.fieldName || ""} />
        </div>

        <div>
          <Label htmlFor="fieldAddress">Morada do Campo</Label>
          <Input id="fieldAddress" name="fieldAddress" defaultValue={defaultValues?.fieldAddress || ""} />
        </div>

        <div>
          <Label htmlFor="location">Concelho / Distrito *</Label>
          <Input id="location" name="location" required defaultValue={defaultValues?.location || ""} />
        </div>

        <div>
          <Label htmlFor="mapsUrl">Link Google Maps</Label>
          <Input id="mapsUrl" name="mapsUrl" type="url" defaultValue={defaultValues?.mapsUrl || ""} />
        </div>
      </fieldset>

      {/* Observações */}
      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={defaultValues?.notes || ""} />
      </div>

      {/* RGPD */}
      {showRgpd && (
        <RgpdConsent checked={rgpdConsent} onCheckedChange={setRgpdConsent} />
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "A submeter..." : submitLabel}
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Implement registration page with Server Action**

Create `src/app/registar/page.tsx`:
```tsx
import { TeamForm } from "@/components/teams/team-form";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { generateSlug } from "@/lib/slug";
import { extractCoordinates } from "@/lib/geo";
import { createMagicLink } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email/send-magic-link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

async function registerTeam(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  "use server";

  const name = formData.get("name") as string;
  const coordinatorEmail = (formData.get("coordinatorEmail") as string)
    .toLowerCase()
    .trim();
  const rgpdConsent = formData.get("rgpdConsent") === "true";

  if (!name || !coordinatorEmail) {
    return { error: "Nome da equipa e email são obrigatórios." };
  }

  if (!rgpdConsent) {
    return { error: "É necessário aceitar a Política de Privacidade." };
  }

  // Generate unique slug
  let slug = generateSlug(name);
  const existing = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.slug, slug));
  if (existing.length > 0) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const mapsUrl = formData.get("mapsUrl") as string;
  const coords = extractCoordinates(mapsUrl);

  await db.insert(teams).values({
    slug,
    name: name.trim(),
    logoUrl: (formData.get("logoUrl") as string) || null,
    coordinatorName: (formData.get("coordinatorName") as string).trim(),
    coordinatorAltName: (formData.get("coordinatorAltName") as string) || null,
    coordinatorEmail,
    coordinatorPhone: (formData.get("coordinatorPhone") as string) || null,
    coordinatorAltPhone: (formData.get("coordinatorAltPhone") as string) || null,
    dinnerThirdParty: formData.get("dinnerThirdParty") === "on",
    kitPrimary: (formData.get("kitPrimary") as string) || null,
    kitSecondary: (formData.get("kitSecondary") as string) || null,
    fieldName: (formData.get("fieldName") as string) || null,
    fieldAddress: (formData.get("fieldAddress") as string) || null,
    location: (formData.get("location") as string).trim(),
    mapsUrl: mapsUrl || null,
    latitude: coords?.latitude?.toString() || null,
    longitude: coords?.longitude?.toString() || null,
    notes: (formData.get("notes") as string) || null,
    rgpdConsent: true,
    rgpdConsentAt: new Date(),
  });

  // Send magic link for immediate access
  const magicLink = await createMagicLink(coordinatorEmail);
  if (magicLink) {
    await sendMagicLinkEmail(coordinatorEmail, magicLink);
  }

  redirect("/registar/sucesso");
}

export default function RegistarPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Registar Equipa</h1>
      <p className="text-muted-foreground mb-8">
        Preencha os dados da sua equipa de veteranos. Após o registo, receberá
        um email com um link para aceder e editar os seus dados a qualquer
        momento.
      </p>
      <TeamForm action={registerTeam} />
    </div>
  );
}
```

- [ ] **Step 5: Create success page**

Create `src/app/registar/sucesso/page.tsx`:
```tsx
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
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add team registration form with RGPD consent and magic link"
```

---

### Task 11: Coordinator Login & Dashboard

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/app/dashboard/page.tsx`
- Create: `src/app/dashboard/[teamId]/page.tsx`

- [ ] **Step 1: Implement login form**

Create `src/components/auth/login-form.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

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

  if (sent) {
    return (
      <div className="text-center p-8">
        <div className="text-4xl mb-4">&#9993;</div>
        <h2 className="text-xl font-bold mb-2">Email Enviado!</h2>
        <p className="text-muted-foreground">
          Se o email estiver registado, receberá um link de acesso. Verifique a
          sua caixa de entrada (e spam).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email do Responsável</Label>
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
        {loading ? "A enviar..." : "Enviar Link de Acesso"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Implement login page**

Create `src/app/login/page.tsx`:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Aceder à Minha Equipa</CardTitle>
        </CardHeader>
        <CardContent>
          {error === "expired" && (
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-400 mb-4">
              O link expirou. Peça um novo abaixo.
            </div>
          )}
          {error === "invalid" && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400 mb-4">
              Link inválido. Peça um novo abaixo.
            </div>
          )}
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Implement dashboard layout (auth guard)**

Create `src/app/dashboard/layout.tsx`:
```tsx
import { requireCoordinator } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCoordinator();
  return <>{children}</>;
}
```

- [ ] **Step 4: Implement dashboard page (lists coordinator's teams)**

Create `src/app/dashboard/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const email = await requireCoordinator();

  const myTeams = await db
    .select()
    .from(teams)
    .where(and(eq(teams.coordinatorEmail, email), eq(teams.isActive, true)));

  // If only one team, redirect directly to edit
  if (myTeams.length === 1) {
    redirect(`/dashboard/${myTeams[0].id}`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">As Minhas Equipas</h1>
      <div className="space-y-4">
        {myTeams.map((team) => (
          <Link key={team.id} href={`/dashboard/${team.id}`}>
            <Card className="hover:border-green-500/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{team.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {team.location}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Implement team edit page**

Create `src/app/dashboard/[teamId]/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { TeamForm } from "@/components/teams/team-form";
import { generateSlug } from "@/lib/slug";
import { extractCoordinates } from "@/lib/geo";
import { logAudit } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = { params: Promise<{ teamId: string }> };

export default async function EditTeamPage({ params }: Props) {
  const { teamId } = await params;
  const email = await requireCoordinator();

  const [team] = await db
    .select()
    .from(teams)
    .where(
      and(
        eq(teams.id, teamId),
        eq(teams.coordinatorEmail, email),
        eq(teams.isActive, true)
      )
    );

  if (!team) notFound();

  async function updateTeam(
    formData: FormData
  ): Promise<{ error?: string; success?: boolean }> {
    "use server";

    const mapsUrl = formData.get("mapsUrl") as string;
    const coords = extractCoordinates(mapsUrl);

    await db
      .update(teams)
      .set({
        name: (formData.get("name") as string).trim(),
        logoUrl: (formData.get("logoUrl") as string) || null,
        coordinatorName: (formData.get("coordinatorName") as string).trim(),
        coordinatorAltName:
          (formData.get("coordinatorAltName") as string) || null,
        coordinatorPhone:
          (formData.get("coordinatorPhone") as string) || null,
        coordinatorAltPhone:
          (formData.get("coordinatorAltPhone") as string) || null,
        dinnerThirdParty: formData.get("dinnerThirdParty") === "on",
        kitPrimary: (formData.get("kitPrimary") as string) || null,
        kitSecondary: (formData.get("kitSecondary") as string) || null,
        fieldName: (formData.get("fieldName") as string) || null,
        fieldAddress: (formData.get("fieldAddress") as string) || null,
        location: (formData.get("location") as string).trim(),
        mapsUrl: mapsUrl || null,
        latitude: coords?.latitude?.toString() || null,
        longitude: coords?.longitude?.toString() || null,
        notes: (formData.get("notes") as string) || null,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, teamId));

    await logAudit({
      actorType: "coordinator",
      actorEmail: email,
      action: "team_updated",
      teamId,
    });

    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Editar Equipa</h1>
        <div className="flex gap-2">
          <Link href={`/dashboard/${teamId}/transferir`}>
            <Button variant="outline" size="sm">
              Transferir
            </Button>
          </Link>
          <Link href={`/dashboard/${teamId}/eliminar`}>
            <Button variant="destructive" size="sm">
              Eliminar
            </Button>
          </Link>
        </div>
      </div>
      <TeamForm
        action={updateTeam}
        defaultValues={team}
        submitLabel="Guardar Alterações"
        showRgpd={false}
      />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add coordinator login, dashboard, and team editing"
```

---

### Task 12: Coordinator Transfer & Team Deletion

**Files:**
- Create: `src/app/dashboard/[teamId]/transferir/page.tsx`
- Create: `src/app/dashboard/[teamId]/eliminar/page.tsx`

- [ ] **Step 1: Implement transfer page**

Create `src/app/dashboard/[teamId]/transferir/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ teamId: string }> };

export default async function TransferPage({ params }: Props) {
  const { teamId } = await params;
  const email = await requireCoordinator();

  const [team] = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(
      and(
        eq(teams.id, teamId),
        eq(teams.coordinatorEmail, email),
        eq(teams.isActive, true)
      )
    );

  if (!team) notFound();

  async function transferTeam(formData: FormData) {
    "use server";

    const newEmail = (formData.get("newEmail") as string).toLowerCase().trim();
    const newName = (formData.get("newName") as string).trim();

    if (!newEmail || !newName) return;

    await db
      .update(teams)
      .set({
        coordinatorEmail: newEmail,
        coordinatorName: newName,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, teamId));

    await logAudit({
      actorType: "coordinator",
      actorEmail: email,
      action: "coordinator_transferred",
      teamId,
      details: { from: email, to: newEmail, newName },
    });

    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Transferir Equipa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Transferir a gestão de <strong>{team.name}</strong> para outro
            responsável. Após a transferência, perderá o acesso de edição.
          </p>
          <form action={transferTeam} className="space-y-4">
            <div>
              <Label htmlFor="newName">Nome do Novo Responsável *</Label>
              <Input id="newName" name="newName" required />
            </div>
            <div>
              <Label htmlFor="newEmail">Email do Novo Responsável *</Label>
              <Input id="newEmail" name="newEmail" type="email" required />
            </div>
            <Button type="submit" className="w-full">
              Confirmar Transferência
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Implement delete page (RGPD right to erasure)**

Create `src/app/dashboard/[teamId]/eliminar/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ teamId: string }> };

export default async function DeletePage({ params }: Props) {
  const { teamId } = await params;
  const email = await requireCoordinator();

  const [team] = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(
      and(
        eq(teams.id, teamId),
        eq(teams.coordinatorEmail, email),
        eq(teams.isActive, true)
      )
    );

  if (!team) notFound();

  async function deleteTeam() {
    "use server";

    await db.delete(teams).where(eq(teams.id, teamId));

    await logAudit({
      actorType: "coordinator",
      actorEmail: email,
      action: "team_deleted",
      teamId,
      details: { teamName: team.name },
    });

    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-400">Eliminar Equipa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Tem a certeza que deseja eliminar <strong>{team.name}</strong>?
            Todos os dados serão permanentemente apagados. Esta ação não pode
            ser revertida.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            (Direito ao apagamento — Artigo 17.º do RGPD)
          </p>
          <form action={deleteTeam}>
            <Button type="submit" variant="destructive" className="w-full">
              Eliminar Permanentemente
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add coordinator transfer and RGPD team deletion"
```

---

### Task 13: Admin Panel

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/equipas/[id]/page.tsx`
- Create: `src/app/admin/transferir/[id]/page.tsx`
- Create: `src/app/admin/moderadores/page.tsx`

- [ ] **Step 1: Install shadcn dialog and alert-dialog**

```bash
npx shadcn@latest add dialog alert-dialog
```

- [ ] **Step 2: Implement admin layout**

Create `src/app/admin/layout.tsx`:
```tsx
import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div>
      <nav className="border-b border-border/40 bg-muted/30 px-4 py-2">
        <div className="container mx-auto flex items-center gap-4">
          <span className="font-semibold text-sm">Admin</span>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            Equipas
          </Link>
          {admin.role === "super_admin" && (
            <Link href="/admin/moderadores" className="text-sm text-muted-foreground hover:text-foreground">
              Moderadores
            </Link>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {admin.name} ({admin.role === "super_admin" ? "Super Admin" : "Moderador"})
          </span>
        </div>
      </nav>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Implement admin login page**

Create `src/app/admin/login/page.tsx`:
```tsx
"use client";

import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Administração</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Acesso restrito a moderadores. Entre com a sua conta Google
            autorizada.
          </p>
          <Button onClick={() => signIn("google", { callbackUrl: "/admin" })} className="w-full">
            Entrar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Implement admin dashboard**

Create `src/app/admin/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono text-green-500">{total}</p>
            <p className="text-sm text-muted-foreground">Equipas Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono text-yellow-500">{pending}</p>
            <p className="text-sm text-muted-foreground">RGPD Pendente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-mono">{allTeams.length}</p>
            <p className="text-sm text-muted-foreground">Total (incl. inativas)</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Equipas</CardTitle>
        </CardHeader>
        <CardContent>
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
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        OK
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
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
```

- [ ] **Step 5: Implement admin edit team page**

Create `src/app/admin/equipas/[id]/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { TeamForm } from "@/components/teams/team-form";
import { extractCoordinates } from "@/lib/geo";
import { logAudit } from "@/lib/audit";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditTeamPage({ params }: Props) {
  const { id } = await params;
  const admin = await requireAdmin();

  const [team] = await db.select().from(teams).where(eq(teams.id, id));
  if (!team) notFound();

  async function updateTeam(
    formData: FormData
  ): Promise<{ error?: string; success?: boolean }> {
    "use server";

    const mapsUrl = formData.get("mapsUrl") as string;
    const coords = extractCoordinates(mapsUrl);

    await db
      .update(teams)
      .set({
        name: (formData.get("name") as string).trim(),
        logoUrl: (formData.get("logoUrl") as string) || null,
        coordinatorName: (formData.get("coordinatorName") as string).trim(),
        coordinatorAltName: (formData.get("coordinatorAltName") as string) || null,
        coordinatorEmail: (formData.get("coordinatorEmail") as string).toLowerCase().trim(),
        coordinatorPhone: (formData.get("coordinatorPhone") as string) || null,
        coordinatorAltPhone: (formData.get("coordinatorAltPhone") as string) || null,
        dinnerThirdParty: formData.get("dinnerThirdParty") === "on",
        kitPrimary: (formData.get("kitPrimary") as string) || null,
        kitSecondary: (formData.get("kitSecondary") as string) || null,
        fieldName: (formData.get("fieldName") as string) || null,
        fieldAddress: (formData.get("fieldAddress") as string) || null,
        location: (formData.get("location") as string).trim(),
        mapsUrl: mapsUrl || null,
        latitude: coords?.latitude?.toString() || null,
        longitude: coords?.longitude?.toString() || null,
        notes: (formData.get("notes") as string) || null,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, id));

    await logAudit({
      actorType: admin.role === "super_admin" ? "super_admin" : "moderator",
      actorEmail: admin.email,
      action: "team_updated_by_admin",
      teamId: id,
    });

    redirect("/admin");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Editar: {team.name}</h1>
      <TeamForm
        action={updateTeam}
        defaultValues={team}
        submitLabel="Guardar Alterações"
        showRgpd={false}
      />
    </div>
  );
}
```

- [ ] **Step 6: Implement admin transfer page**

Create `src/app/admin/transferir/[id]/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ id: string }> };

export default async function AdminTransferPage({ params }: Props) {
  const { id } = await params;
  const admin = await requireAdmin();

  const [team] = await db
    .select({ id: teams.id, name: teams.name, coordinatorEmail: teams.coordinatorEmail })
    .from(teams)
    .where(eq(teams.id, id));

  if (!team) notFound();

  async function transferTeam(formData: FormData) {
    "use server";

    const newEmail = (formData.get("newEmail") as string).toLowerCase().trim();
    const newName = (formData.get("newName") as string).trim();

    await db
      .update(teams)
      .set({
        coordinatorEmail: newEmail,
        coordinatorName: newName,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, id));

    await logAudit({
      actorType: admin.role === "super_admin" ? "super_admin" : "moderator",
      actorEmail: admin.email,
      action: "coordinator_transferred_by_admin",
      teamId: id,
      details: { from: team.coordinatorEmail, to: newEmail },
    });

    redirect("/admin");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Transferir Coordenador</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Transferir <strong>{team.name}</strong> para um novo coordenador.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Coordenador atual: {team.coordinatorEmail}
          </p>
          <form action={transferTeam} className="space-y-4">
            <div>
              <Label htmlFor="newName">Nome do Novo Responsável *</Label>
              <Input id="newName" name="newName" required />
            </div>
            <div>
              <Label htmlFor="newEmail">Email do Novo Responsável *</Label>
              <Input id="newEmail" name="newEmail" type="email" required />
            </div>
            <Button type="submit" className="w-full">
              Transferir
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 7: Implement moderators management (super admin only)**

Create `src/app/admin/moderadores/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireSuperAdmin } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default async function ModeradoresPage() {
  const superAdmin = await requireSuperAdmin();

  const allAdmins = await db.select().from(admins).orderBy(admins.name);

  async function addModerator(formData: FormData) {
    "use server";

    const email = (formData.get("email") as string).toLowerCase().trim();
    const name = (formData.get("name") as string).trim();

    if (!email || !name) return;

    await db.insert(admins).values({
      email,
      name,
      role: "moderator",
    });

    await logAudit({
      actorType: "super_admin",
      actorEmail: superAdmin.email,
      action: "moderator_added",
      details: { email, name },
    });

    redirect("/admin/moderadores");
  }

  async function removeModerator(formData: FormData) {
    "use server";

    const id = formData.get("id") as string;

    // Cannot remove super_admin
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    if (!admin || admin.role === "super_admin") return;

    await db.delete(admins).where(eq(admins.id, id));

    await logAudit({
      actorType: "super_admin",
      actorEmail: superAdmin.email,
      action: "moderator_removed",
      details: { email: admin.email, name: admin.name },
    });

    redirect("/admin/moderadores");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Moderadores</h1>

      {/* Current moderators */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Moderadores Atuais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell className="font-mono text-sm">{admin.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        admin.role === "super_admin" ? "default" : "secondary"
                      }
                    >
                      {admin.role === "super_admin"
                        ? "Super Admin"
                        : "Moderador"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {admin.role !== "super_admin" && (
                      <form action={removeModerator}>
                        <input type="hidden" name="id" value={admin.id} />
                        <Button variant="destructive" size="sm" type="submit">
                          Remover
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add moderator */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Moderador</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addModerator} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="email">Email Google *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <Button type="submit">Adicionar Moderador</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add admin panel with team management, transfer, and moderator management"
```

---

### Task 14: Privacy Policy Page

**Files:**
- Create: `src/app/privacidade/page.tsx`

- [ ] **Step 1: Implement privacy policy page**

Create `src/app/privacidade/page.tsx`:
```tsx
export default function PrivacidadePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl prose prose-invert">
      <h1>Política de Privacidade</h1>
      <p>Última atualização: {new Date().toLocaleDateString("pt-PT")}</p>

      <h2>1. Responsável pelo Tratamento</h2>
      <p>
        A plataforma Veteranos Futebol é gerida pelos moderadores do grupo de
        veteranos. Para questões sobre proteção de dados, contacte:{" "}
        <strong>Pedro Estanislau</strong> (Super Administrador).
      </p>

      <h2>2. Finalidade do Tratamento</h2>
      <p>
        Os dados pessoais recolhidos destinam-se exclusivamente a facilitar o
        contacto entre equipas de veteranos de futebol para marcação de jogos e
        eventos desportivos.
      </p>

      <h2>3. Dados Recolhidos</h2>
      <ul>
        <li>Nome do responsável/coordenador da equipa</li>
        <li>Endereço de email</li>
        <li>Número de telefone</li>
        <li>Nome e localização da equipa e campo</li>
        <li>Logotipo da equipa (opcional)</li>
      </ul>

      <h2>4. Base Legal</h2>
      <p>
        O tratamento é baseado no consentimento explícito do titular dos dados
        (Artigo 6.º, n.º 1, alínea a) do RGPD), dado no momento do registo na
        plataforma.
      </p>

      <h2>5. Acesso aos Dados</h2>
      <p>
        Os dados de contacto (nome, telefone, email do coordenador) são
        acessíveis apenas a outras equipas registadas na plataforma. Informações
        gerais (nome da equipa, localização, cores do equipamento) são
        publicamente visíveis.
      </p>

      <h2>6. Direitos do Titular</h2>
      <p>Nos termos do RGPD, tem direito a:</p>
      <ul>
        <li>
          <strong>Acesso</strong> — Consultar todos os seus dados no painel da
          equipa
        </li>
        <li>
          <strong>Retificação</strong> — Editar os seus dados a qualquer momento
        </li>
        <li>
          <strong>Apagamento</strong> — Eliminar a sua equipa e todos os dados
          associados
        </li>
        <li>
          <strong>Portabilidade</strong> — Solicitar os seus dados em formato
          digital
        </li>
        <li>
          <strong>Retirar consentimento</strong> — A qualquer momento, sem
          prejudicar a licitude do tratamento anterior
        </li>
      </ul>

      <h2>7. Conservação dos Dados</h2>
      <p>
        Os dados são mantidos enquanto a equipa estiver ativa na plataforma. Após
        eliminação pelo coordenador ou moderador, os dados são permanentemente
        apagados.
      </p>

      <h2>8. Segurança</h2>
      <p>
        Os dados são armazenados em servidores seguros com encriptação em
        trânsito (HTTPS) e em repouso. O acesso é protegido por autenticação.
      </p>

      <h2>9. Cookies</h2>
      <p>
        A plataforma utiliza apenas cookies técnicos essenciais para
        autenticação (sessão do coordenador). Não são utilizados cookies de
        rastreamento ou publicidade.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Para exercer os seus direitos ou para qualquer questão sobre esta
        política, contacte os moderadores da plataforma através do grupo de
        WhatsApp dos Veteranos ou diretamente o Super Administrador.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add RGPD privacy policy page"
```

---

### Task 15: Excel Import Script

**Files:**
- Create: `src/scripts/import-excel.ts`
- Create: `tests/scripts/import-excel.test.ts`

- [ ] **Step 1: Install xlsx dependency**

```bash
npm install xlsx
```

- [ ] **Step 2: Write import test**

Create `tests/scripts/import-excel.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseExcelRow, cleanPhone } from "@/scripts/import-excel";

describe("cleanPhone", () => {
  it("converts float phone to string", () => {
    expect(cleanPhone(934151187.0)).toBe("934151187");
  });

  it("handles string phone", () => {
    expect(cleanPhone("934151187")).toBe("934151187");
  });

  it("handles null", () => {
    expect(cleanPhone(null)).toBeNull();
  });
});

describe("parseExcelRow", () => {
  it("maps Excel columns to team data", () => {
    const row = [
      "2022-12-08 14:40:04",
      "test@gmail.com",
      "https://drive.google.com/open?id=abc",
      "Test Team FC",
      "John Doe",
      null,
      934151187.0,
      null,
      "Sim",
      "Red",
      "Blue",
      "Campo Test",
      "Rua Test",
      "Lisboa",
      "https://www.google.com/maps/place/Test/@38.7,-9.1,15z",
      "Notes here",
    ];
    const result = parseExcelRow(row);
    expect(result.name).toBe("Test Team FC");
    expect(result.coordinatorEmail).toBe("test@gmail.com");
    expect(result.coordinatorPhone).toBe("934151187");
    expect(result.dinnerThirdParty).toBe(true);
    expect(result.latitude).toBe("38.7");
    expect(result.longitude).toBe("-9.1");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx vitest run tests/scripts/import-excel.test.ts
```

Expected: FAIL.

- [ ] **Step 4: Implement import script**

Create `src/scripts/import-excel.ts`:
```ts
import * as XLSX from "xlsx";
import { generateSlug } from "@/lib/slug";
import { extractCoordinates } from "@/lib/geo";

export function cleanPhone(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).replace(/\.0$/, "").trim();
  return str || null;
}

export function parseExcelRow(row: unknown[]) {
  const mapsUrl = row[14] as string | null;
  const coords = extractCoordinates(mapsUrl);

  return {
    name: (row[3] as string)?.trim() || "",
    coordinatorEmail: ((row[1] as string) || "").toLowerCase().trim(),
    logoUrl: (row[2] as string) || null,
    coordinatorName: ((row[4] as string) || "").trim(),
    coordinatorAltName: (row[5] as string) || null,
    coordinatorPhone: cleanPhone(row[6]),
    coordinatorAltPhone: cleanPhone(row[7]),
    dinnerThirdParty: (row[8] as string)?.toLowerCase() === "sim",
    kitPrimary: (row[9] as string) || null,
    kitSecondary: (row[10] as string) || null,
    fieldName: (row[11] as string) || null,
    fieldAddress: (row[12] as string) || null,
    location: ((row[13] as string) || "").trim(),
    mapsUrl: mapsUrl || null,
    latitude: coords?.latitude?.toString() || null,
    longitude: coords?.longitude?.toString() || null,
    notes: (row[15] as string) || null,
  };
}

export function parseExcelFile(filePath: string) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

  // Skip header row
  const dataRows = rows.slice(1).filter((row) => row[3]); // Must have team name

  const teamsData = dataRows.map((row) => {
    const parsed = parseExcelRow(row);
    const slug = generateSlug(parsed.name);
    return {
      ...parsed,
      slug,
      rgpdConsent: false, // Imported teams need to re-consent
      isActive: true,
    };
  });

  // Handle duplicate slugs
  const slugCounts = new Map<string, number>();
  for (const team of teamsData) {
    const count = slugCounts.get(team.slug) || 0;
    if (count > 0) {
      team.slug = `${team.slug}-${count + 1}`;
    }
    slugCounts.set(team.slug, count + 1);
  }

  return teamsData;
}
```

- [ ] **Step 5: Run tests**

```bash
npx vitest run tests/scripts/import-excel.test.ts
```

Expected: All PASS.

- [ ] **Step 6: Implement admin import page**

Create `src/app/admin/importar/page.tsx`:
```tsx
import { requireSuperAdmin } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
            Esta funcionalidade importa os dados do ficheiro Excel existente para
            a base de dados. As equipas importadas ficam com RGPD pendente —
            quando o coordenador aceder pela primeira vez, será pedido o
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
```

- [ ] **Step 7: Implement import API route**

Create `src/app/api/import/route.ts`:
```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { parseExcelFile } from "@/scripts/import-excel";
import { getAdminSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import path from "path";

export async function POST() {
  const admin = await getAdminSession();
  if (!admin || admin.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const filePath = path.join(
    process.cwd(),
    "..",
    "Docs_general",
    "Contactos dos Clubes Veteranos (Respostas) (1).xlsx"
  );

  const teamsData = parseExcelFile(filePath);

  let imported = 0;
  for (const teamData of teamsData) {
    await db.insert(teams).values(teamData);
    imported++;
  }

  await logAudit({
    actorType: "super_admin",
    actorEmail: admin.email,
    action: "excel_imported",
    details: { count: imported },
  });

  return NextResponse.json({ imported });
}
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add Excel import script with admin UI and API endpoint"
```

---

### Task 16: RGPD Consent Banner for Imported Teams

**Files:**
- Modify: `src/app/auth/verify/page.tsx`
- Create: `src/app/dashboard/consentimento/page.tsx`

- [ ] **Step 1: Update verify page to check RGPD consent**

Modify `src/app/auth/verify/page.tsx` — after setting the session cookie, check if any of the coordinator's teams have `rgpdConsent = false`. If so, redirect to `/dashboard/consentimento` instead of `/dashboard`.

Add after the cookie is set:
```tsx
// Check if any teams need RGPD consent
const pendingTeams = await db
  .select({ id: teams.id })
  .from(teams)
  .where(and(eq(teams.coordinatorEmail, result.email), eq(teams.rgpdConsent, false)));

if (pendingTeams.length > 0) {
  redirect("/dashboard/consentimento");
}

redirect("/dashboard");
```

- [ ] **Step 2: Implement consent page**

Create `src/app/dashboard/consentimento/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCoordinator } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ConsentPage() {
  const email = await requireCoordinator();

  const pendingTeams = await db
    .select()
    .from(teams)
    .where(
      and(eq(teams.coordinatorEmail, email), eq(teams.rgpdConsent, false))
    );

  if (pendingTeams.length === 0) {
    redirect("/dashboard");
  }

  async function acceptConsent() {
    "use server";

    await db
      .update(teams)
      .set({ rgpdConsent: true, rgpdConsentAt: new Date() })
      .where(
        and(eq(teams.coordinatorEmail, email), eq(teams.rgpdConsent, false))
      );

    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Consentimento de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Os dados da(s) sua(s) equipa(s) foram migrados do formulário
            anterior. Para continuar a utilizá-los na nova plataforma,
            precisamos do seu consentimento.
          </p>
          <div className="rounded-lg border border-border p-4 mb-6 text-sm text-muted-foreground leading-relaxed">
            Ao aceitar, consinto que os meus dados pessoais (nome, email,
            telefone) sejam armazenados e partilhados com outras equipas de
            veteranos registadas na plataforma, com a finalidade exclusiva de
            facilitar o contacto para marcação de jogos. Posso a qualquer
            momento editar ou eliminar os meus dados. Consulte a nossa{" "}
            <Link
              href="/privacidade"
              className="text-green-500 hover:underline"
              target="_blank"
            >
              Política de Privacidade
            </Link>
            .
          </div>
          <p className="text-sm mb-4">
            Equipa(s) afetada(s):{" "}
            {pendingTeams.map((t) => t.name).join(", ")}
          </p>
          <form action={acceptConsent}>
            <Button type="submit" className="w-full">
              Aceitar e Continuar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add RGPD consent flow for imported teams"
```

---

### Task 17: Mobile Navigation & Final Polish

**Files:**
- Create: `src/components/layout/mobile-nav.tsx`
- Modify: `src/components/layout/header.tsx`

- [ ] **Step 1: Implement mobile navigation**

Create `src/components/layout/mobile-nav.tsx`:
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px]">
        <nav className="flex flex-col gap-4 mt-8">
          <Link
            href="/equipas"
            onClick={() => setOpen(false)}
            className="text-lg hover:text-green-500 transition-colors"
          >
            Equipas
          </Link>
          <Link
            href="/registar"
            onClick={() => setOpen(false)}
            className="text-lg hover:text-green-500 transition-colors"
          >
            Registar Equipa
          </Link>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="text-lg hover:text-green-500 transition-colors"
          >
            Aceder
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Update header to include mobile nav**

Modify `src/components/layout/header.tsx` — add `<MobileNav />` next to the desktop nav, import it from `./mobile-nav`.

- [ ] **Step 3: Verify mobile layout**

```bash
npm run dev
```

Open Chrome DevTools, toggle mobile view. Verify hamburger menu works, navigation flows.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add mobile-responsive navigation with sheet menu"
```

---

### Task 18: Seed Admins & Database Migration

**Files:**
- Create: `src/scripts/seed-admins.ts`

- [ ] **Step 1: Create admin seed script**

Create `src/scripts/seed-admins.ts`:
```ts
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";

async function seed() {
  await db.insert(admins).values([
    {
      email: "SUPER_ADMIN_EMAIL_HERE", // Replace with actual Google email
      name: "Pedro Estanislau",
      role: "super_admin",
    },
    {
      email: "CARLOS_EMAIL_HERE", // Replace with actual Google email
      name: "Carlos Pereira",
      role: "moderator",
    },
    {
      email: "FILIPE_EMAIL_HERE", // Replace with actual Google email
      name: "Filipe Neves",
      role: "moderator",
    },
  ]);

  console.log("Admins seeded successfully");
}

seed().catch(console.error);
```

- [ ] **Step 2: Add seed script to package.json**

Add to `package.json` scripts:
```json
"db:migrate": "drizzle-kit migrate",
"db:seed": "tsx src/scripts/seed-admins.ts",
"db:import": "tsx src/scripts/import-excel.ts"
```

- [ ] **Step 3: Install tsx for script execution**

```bash
npm install -D tsx
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add admin seed script and database migration commands"
```

---

### Task 19: End-to-End Verification

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

```bash
npm run test
```

Expected: All tests pass.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Run dev server and verify all pages**

```bash
npm run dev
```

Manually verify:
- `/` — Homepage with map placeholder (no data yet)
- `/equipas` — Empty listing with filters
- `/registar` — Form renders, RGPD checkbox works
- `/login` — Email input form
- `/privacidade` — Full privacy policy

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: verify build and all pages render correctly"
```

---

## Deployment Checklist (Post-Implementation)

After all tasks are done, deploy:

1. Create Vercel account with the Google Veteranos account
2. `npx vercel link` — connect project
3. Add Neon Postgres via Vercel Marketplace (`vercel integration add neon`)
4. `vercel env pull` — get DATABASE_URL
5. Set up Google OAuth credentials (Google Cloud Console)
6. Set up Resend API key (resend.com)
7. Add all env vars to Vercel: `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`
8. Run `npm run db:migrate` — create tables
9. Update `src/scripts/seed-admins.ts` with real emails, run `npm run db:seed`
10. Deploy: `npx vercel --prod`
11. Import Excel data via admin panel (`/admin/importar`)
12. Test magic link flow with real email
13. Share new URL in WhatsApp group description
