# Map, Duplicates, i18n EN & Security — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden security with JWT sessions/rate limiting/CAPTCHA/CSP, add English language support, build smart duplicate detection with admin merge UI, and upgrade the map with clustering/filters/custom markers.

**Architecture:** Four sequential phases — Security (foundation) > i18n EN (touches all UI) > Duplicates (new backend + admin UI) > Map (self-contained component upgrade). Each phase produces a working commit.

**Tech Stack:** Next.js 16, Drizzle ORM, PostgreSQL (Neon), jose (JWT), Cloudflare Turnstile, react-leaflet-cluster, Leaflet

**Spec:** `docs/superpowers/specs/2026-04-07-map-duplicates-i18n-security-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/lib/security/rate-limiter.ts` | In-memory sliding window rate limiter |
| `src/lib/security/turnstile.ts` | Server-side Cloudflare Turnstile token verification |
| `src/lib/security/csrf.ts` | CSRF token generation (in JWT) and validation |
| `src/lib/security/audit.ts` | Security event logging to security_log table |
| `src/lib/security/headers.ts` | CSP and security header builder |
| `src/lib/duplicates/detect.ts` | Fuzzy name matching, phone normalization, geo proximity |
| `src/lib/duplicates/merge.ts` | Team merge logic (combine fields, transfer relations) |
| `src/app/admin/duplicados/page.tsx` | Admin duplicate management panel |
| `src/app/api/cron/cleanup-tokens/route.ts` | Vercel Cron endpoint for expired token cleanup |
| `src/components/map/map-filters.tsx` | Interactive filter bar for map |
| `src/components/map/custom-marker.tsx` | Logo and football icon markers via L.divIcon |
| `src/components/map/rich-popup.tsx` | Enhanced popup with team details |
| `src/components/admin/duplicate-compare.tsx` | Side-by-side team comparison |
| `src/components/admin/merge-modal.tsx` | Merge confirmation modal |
| `tests/lib/rate-limiter.test.ts` | Rate limiter tests |
| `tests/lib/turnstile.test.ts` | Turnstile verification tests |
| `tests/lib/csrf.test.ts` | CSRF tests |
| `tests/lib/duplicates.test.ts` | Duplicate detection tests |
| `tests/lib/merge.test.ts` | Team merge tests |

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/db/schema.ts` | Add security_log, duplicate_pairs tables + enums |
| `src/lib/auth/session.ts` | JWT sign/verify replacing plain cookie |
| `src/lib/auth/magic-link.ts` | 30min expiry, opportunistic token cleanup |
| `src/lib/auth/callback-token.ts` | Minor: use JWT session in callback |
| `src/proxy.ts` | Security headers, EN locale detection |
| `src/lib/i18n/translations.ts` | Add `en` to Locale type, all entries, country map |
| `src/lib/i18n/get-locale.ts` | Support `en` locale |
| `src/lib/recalculate-flags.ts` | Rewrite to use duplicate_pairs + smart detection |
| `src/app/api/auth/magic-link/route.ts` | Rate limiting, Turnstile, CSRF, security logging |
| `src/app/api/auth/verify/route.ts` | JWT session, security logging |
| `src/app/auth/callback/route.ts` | JWT session cookie |
| `src/app/registar/page.tsx` | Turnstile widget, CSRF token |
| `src/app/login/page.tsx` | Turnstile widget |
| `src/components/auth/login-form.tsx` | Turnstile + CSRF hidden field |
| `src/components/map/portugal-map.tsx` | Clustering, custom markers, filters, rich popups |
| `src/components/map/map-wrapper.tsx` | Pass extra team data for popups |
| `src/components/layout/locale-switcher.tsx` | Add EN option |
| `src/components/layout/header.tsx` | i18n EN |
| `src/components/layout/footer.tsx` | i18n EN |
| `src/components/layout/mobile-nav.tsx` | i18n EN |
| `src/app/page.tsx` | i18n EN, pass extra data to map |
| `src/app/equipas/page.tsx` | i18n EN |
| `src/app/equipas/[slug]/page.tsx` | i18n EN |
| `src/app/sugestoes/page.tsx` | i18n EN |
| `src/app/privacidade/page.tsx` | i18n EN |
| `src/app/dashboard/page.tsx` | i18n EN |
| `src/app/dashboard/[teamId]/page.tsx` | i18n EN |
| `src/app/dashboard/[teamId]/jogos/page.tsx` | i18n EN |
| `src/app/dashboard/[teamId]/jogos/[matchId]/page.tsx` | i18n EN |
| `src/app/dashboard/[teamId]/transferir/page.tsx` | i18n EN |
| `src/app/dashboard/[teamId]/eliminar/page.tsx` | i18n EN |
| `src/app/dashboard/consentimento/page.tsx` | i18n EN |
| `src/components/teams/team-form.tsx` | i18n EN |
| `src/components/teams/team-card.tsx` | i18n EN |
| `src/components/teams/team-filters.tsx` | i18n EN |
| `src/components/teams/team-contact.tsx` | i18n EN |
| `src/components/teams/match-calendar.tsx` | i18n EN |
| `src/components/teams/match-form.tsx` | i18n EN |
| `src/components/teams/match-list.tsx` | i18n EN |
| `src/components/teams/image-upload.tsx` | i18n EN |
| `src/components/auth/rgpd-consent.tsx` | i18n EN |
| `src/lib/email/send-magic-link.ts` | EN email template |
| `src/app/admin/layout.tsx` | Duplicate count badge in sidebar |
| `package.json` | Add jose, react-leaflet-cluster |

---

## PHASE 1: SECURITY

---

### Task 1: Install jose dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install jose**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npm install jose
```

- [ ] **Step 2: Verify installation**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && node -e "require('jose'); console.log('jose OK')"
```
Expected: `jose OK`

- [ ] **Step 3: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add package.json package-lock.json
git commit -m "chore: add jose for JWT session management"
```

---

### Task 2: Database migration — security_log table

**Files:**
- Modify: `src/lib/db/schema.ts`
- Create: migration via `drizzle-kit generate`

- [ ] **Step 1: Add security_log table to schema**

In `src/lib/db/schema.ts`, add after the existing `auditLog` table definition:

```typescript
export const securityLog = pgTable("security_log", {
  id: uuid().primaryKey().defaultRandom(),
  eventType: text("event_type").notNull(),
  email: text("email"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

- [ ] **Step 2: Generate migration**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx drizzle-kit generate
```
Expected: New migration file created in `drizzle/migrations/`

- [ ] **Step 3: Push migration to database**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx drizzle-kit push
```

- [ ] **Step 4: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/db/schema.ts drizzle/
git commit -m "feat: add security_log table for security event tracking"
```

---

### Task 3: JWT session management

**Files:**
- Modify: `src/lib/auth/session.ts`
- Create: `tests/lib/session.test.ts`

- [ ] **Step 1: Write failing tests for JWT session**

Create `tests/lib/session.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// We test the pure JWT functions, not the cookie-dependent ones
// Mock next/headers since it's server-only
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: { select: vi.fn().mockReturnThis(), from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([]) },
}));

describe("JWT session", () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = "test-secret-at-least-32-characters-long!!";
  });

  it("signSessionJwt creates a valid JWT string", async () => {
    const { signSessionJwt } = await import("@/lib/auth/session");
    const token = await signSessionJwt("test@example.com", "coordinator");
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // header.payload.signature
  });

  it("verifySessionJwt decodes a valid JWT", async () => {
    const { signSessionJwt, verifySessionJwt } = await import("@/lib/auth/session");
    const token = await signSessionJwt("test@example.com", "coordinator");
    const payload = await verifySessionJwt(token);
    expect(payload).not.toBeNull();
    expect(payload!.email).toBe("test@example.com");
    expect(payload!.role).toBe("coordinator");
  });

  it("verifySessionJwt returns null for invalid token", async () => {
    const { verifySessionJwt } = await import("@/lib/auth/session");
    const payload = await verifySessionJwt("invalid.token.here");
    expect(payload).toBeNull();
  });

  it("verifySessionJwt returns null for expired token", async () => {
    const { signSessionJwt, verifySessionJwt } = await import("@/lib/auth/session");
    // Sign with -1 hour expiry (already expired)
    const { SignJWT } = await import("jose");
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const token = await new SignJWT({ email: "test@example.com", role: "coordinator" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("-1h")
      .setIssuedAt()
      .sign(secret);
    const payload = await verifySessionJwt(token);
    expect(payload).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx vitest run tests/lib/session.test.ts
```
Expected: FAIL — `signSessionJwt` and `verifySessionJwt` not exported

- [ ] **Step 3: Rewrite session.ts with JWT**

Replace the full content of `src/lib/auth/session.ts`:

```typescript
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type SessionRole = "coordinator" | "moderator" | "super_admin";

interface SessionPayload {
  email: string;
  role: SessionRole;
  csrf?: string;
}

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET not set");
  return new TextEncoder().encode(secret);
}

export async function signSessionJwt(
  email: string,
  role: SessionRole,
  csrf?: string
): Promise<string> {
  const payload: Record<string, unknown> = { email, role };
  if (csrf) payload.csrf = csrf;

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionJwt(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionJwt(token);
}

export async function setSessionCookie(
  email: string,
  role: SessionRole,
  csrf?: string
) {
  const token = await signSessionJwt(email, role, csrf);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCoordinatorEmail(): Promise<string | null> {
  const session = await getSessionPayload();
  return session?.email || null;
}

export async function requireCoordinator(): Promise<string> {
  const email = await getCoordinatorEmail();
  if (!email) redirect("/login");
  return email;
}

export async function getAdminSession() {
  const session = await getSessionPayload();
  if (!session) return null;

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, session.email));

  return admin || null;
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) redirect("/login");
  return admin;
}

export async function requireSuperAdmin() {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") redirect("/admin");
  return admin;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx vitest run tests/lib/session.test.ts
```
Expected: 4 tests PASS

- [ ] **Step 5: Update auth verify route to use JWT session**

Read `src/app/api/auth/verify/route.ts` first. Then update it: where it currently creates a callback token and redirects, ensure the callback flow ultimately calls `setSessionCookie()` with the correct role. The verify route creates a callback token — the actual cookie is set in `/auth/callback/route.ts`.

Read `src/app/auth/callback/route.ts`. Find where it sets the `coordinator_email` cookie. Replace that with:

```typescript
// Instead of:
// cookieStore.set("coordinator_email", email, { ... })

// Import and use:
import { setSessionCookie } from "@/lib/auth/session";

// Determine role
const [admin] = await db.select().from(admins).where(eq(admins.email, email));
const role = admin ? admin.role : "coordinator";
await setSessionCookie(email, role as "coordinator" | "moderator" | "super_admin");
```

Remove the old `coordinator_email` cookie setting.

- [ ] **Step 6: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/auth/session.ts tests/lib/session.test.ts src/app/api/auth/verify/route.ts src/app/auth/callback/route.ts
git commit -m "feat: replace plain cookie with JWT signed session"
```

---

### Task 4: Reduce magic link expiry to 30 minutes + token cleanup

**Files:**
- Modify: `src/lib/auth/magic-link.ts`
- Create: `src/app/api/cron/cleanup-tokens/route.ts`

- [ ] **Step 1: Update magic-link.ts expiry**

In `src/lib/auth/magic-link.ts`, change:

```typescript
// OLD:
const TOKEN_EXPIRY_HOURS = 24;
// ...
const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

// NEW:
const TOKEN_EXPIRY_MINUTES = 30;
// ...
const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);
```

- [ ] **Step 2: Add opportunistic token cleanup to verifyMagicLink**

At the end of `verifyMagicLink()`, after the return statement, add cleanup. Actually, add it at the beginning as a fire-and-forget:

```typescript
import { lt } from "drizzle-orm";

// Add at the top of verifyMagicLink, before the hash lookup:
// Opportunistic cleanup: ~10% chance to clean expired tokens
if (Math.random() < 0.1) {
  db.delete(authTokens)
    .where(lt(authTokens.expiresAt, new Date()))
    .execute()
    .catch(() => {});
}
```

- [ ] **Step 3: Create cron cleanup route**

Create `src/app/api/cron/cleanup-tokens/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authTokens } from "@/lib/db/schema";
import { lt } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db
    .delete(authTokens)
    .where(lt(authTokens.expiresAt, new Date()));

  return NextResponse.json({ cleaned: true });
}
```

- [ ] **Step 4: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/auth/magic-link.ts src/app/api/cron/cleanup-tokens/route.ts
git commit -m "feat: reduce magic link expiry to 30min, add token cleanup cron"
```

---

### Task 5: Rate limiter module

**Files:**
- Create: `src/lib/security/rate-limiter.ts`
- Create: `tests/lib/rate-limiter.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/lib/rate-limiter.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimits } from "@/lib/security/rate-limiter";

describe("rate-limiter", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows requests under the limit", () => {
    const result = checkRateLimit("test-key", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests over the limit", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test-key", 5, 60_000);
    }
    const result = checkRateLimit("test-key", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks keys independently", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("key-a", 5, 60_000);
    }
    const resultA = checkRateLimit("key-a", 5, 60_000);
    const resultB = checkRateLimit("key-b", 5, 60_000);
    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });

  it("resets after window expires", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test-key", 5, 1); // 1ms window
    }
    // Wait for window to expire
    const start = Date.now();
    while (Date.now() - start < 5) {} // busy wait 5ms
    const result = checkRateLimit("test-key", 5, 1);
    expect(result.allowed).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx vitest run tests/lib/rate-limiter.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement rate limiter**

Create `src/lib/security/rate-limiter.ts`:

```typescript
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxAttempts - 1, resetAt };
  }

  entry.count++;

  if (entry.count > maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetAt: entry.resetAt,
  };
}

/** For testing only */
export function resetRateLimits() {
  store.clear();
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx vitest run tests/lib/rate-limiter.test.ts
```
Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/security/rate-limiter.ts tests/lib/rate-limiter.test.ts
git commit -m "feat: add in-memory rate limiter module"
```

---

### Task 6: Turnstile verification module

**Files:**
- Create: `src/lib/security/turnstile.ts`
- Create: `tests/lib/turnstile.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/lib/turnstile.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("turnstile", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
  });

  it("returns true for valid token", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });

    const { verifyTurnstile } = await import("@/lib/security/turnstile");
    const result = await verifyTurnstile("valid-token", "127.0.0.1");
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns false for invalid token", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: false }),
    });

    const { verifyTurnstile } = await import("@/lib/security/turnstile");
    const result = await verifyTurnstile("invalid-token", "127.0.0.1");
    expect(result).toBe(false);
  });

  it("returns false on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network error"));

    const { verifyTurnstile } = await import("@/lib/security/turnstile");
    const result = await verifyTurnstile("token", "127.0.0.1");
    expect(result).toBe(false);
  });

  it("skips verification in development when no secret key", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    process.env.NODE_ENV = "development";

    const { verifyTurnstile } = await import("@/lib/security/turnstile");
    const result = await verifyTurnstile("any-token", "127.0.0.1");
    expect(result).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx vitest run tests/lib/turnstile.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement Turnstile verification**

Create `src/lib/security/turnstile.ts`:

```typescript
const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  token: string,
  ip: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Skip in dev if no key configured
  if (!secret) {
    if (process.env.NODE_ENV === "development") return true;
    console.error("TURNSTILE_SECRET_KEY not set");
    return false;
  }

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return false;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx vitest run tests/lib/turnstile.test.ts
```
Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/security/turnstile.ts tests/lib/turnstile.test.ts
git commit -m "feat: add Cloudflare Turnstile server-side verification"
```

---

### Task 7: CSRF protection module

**Files:**
- Create: `src/lib/security/csrf.ts`
- Create: `tests/lib/csrf.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/lib/csrf.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  db: { select: vi.fn().mockReturnThis(), from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([]) },
}));

describe("csrf", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.AUTH_SECRET = "test-secret-at-least-32-characters-long!!";
  });

  it("generateCsrfToken returns a hex string", async () => {
    const { generateCsrfToken } = await import("@/lib/security/csrf");
    const token = generateCsrfToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("generates unique tokens", async () => {
    const { generateCsrfToken } = await import("@/lib/security/csrf");
    const a = generateCsrfToken();
    const b = generateCsrfToken();
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx vitest run tests/lib/csrf.test.ts
```

- [ ] **Step 3: Implement CSRF module**

Create `src/lib/security/csrf.ts`:

```typescript
import { randomBytes } from "crypto";
import { getSessionPayload } from "@/lib/auth/session";

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Validates a CSRF token against the one stored in the session JWT.
 * Returns true if valid, false otherwise.
 */
export async function validateCsrf(formToken: string | null): Promise<boolean> {
  if (!formToken) return false;
  const session = await getSessionPayload();
  if (!session?.csrf) return false;
  return session.csrf === formToken;
}

/**
 * Gets the CSRF token from the current session.
 */
export async function getSessionCsrf(): Promise<string | null> {
  const session = await getSessionPayload();
  return session?.csrf || null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx vitest run tests/lib/csrf.test.ts
```
Expected: 2 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/security/csrf.ts tests/lib/csrf.test.ts
git commit -m "feat: add CSRF token generation and validation"
```

---

### Task 8: Security event logging module

**Files:**
- Create: `src/lib/security/audit.ts`

- [ ] **Step 1: Create security audit logger**

Create `src/lib/security/audit.ts`:

```typescript
import { db } from "@/lib/db";
import { securityLog } from "@/lib/db/schema";

type SecurityEventType =
  | "magic_link_sent"
  | "magic_link_failed"
  | "token_invalid"
  | "token_expired"
  | "rate_limited"
  | "captcha_failed"
  | "login_success"
  | "login_failed";

interface SecurityEvent {
  eventType: SecurityEventType;
  email?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    await db.insert(securityLog).values({
      eventType: event.eventType,
      email: event.email || null,
      ip: event.ip || null,
      userAgent: event.userAgent || null,
      details: event.details || null,
    });
  } catch (error) {
    // Never fail the request because of logging
    console.error("Security log failed:", error);
  }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/security/audit.ts
git commit -m "feat: add security event logging module"
```

---

### Task 9: Security headers in proxy.ts

**Files:**
- Create: `src/lib/security/headers.ts`
- Modify: `src/proxy.ts`

- [ ] **Step 1: Create headers module**

Create `src/lib/security/headers.ts`:

```typescript
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://*.blob.vercel-storage.com https://*.tile.openstreetmap.org https://unpkg.com https://lh3.googleusercontent.com",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "font-src 'self'",
].join("; ");

export function applySecurityHeaders(headers: Headers): void {
  headers.set("Content-Security-Policy", CSP_DIRECTIVES);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
}
```

- [ ] **Step 2: Update proxy.ts**

In `src/proxy.ts`, import and apply the headers:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  applySecurityHeaders(response.headers);

  // Locale detection
  if (!request.cookies.get("locale")) {
    const country = request.headers.get("x-vercel-ip-country") || "PT";
    let locale = "pt";
    if (country === "BR") locale = "br";
    else if (country === "ES") locale = "es";
    else if (["US", "GB", "AU", "CA", "IE", "NZ", "ZA", "IN"].includes(country))
      locale = "en";

    response.cookies.set("locale", locale, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|images/|icon\\.png|api/).*)",
  ],
};
```

- [ ] **Step 3: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/security/headers.ts src/proxy.ts
git commit -m "feat: add CSP and security headers via proxy"
```

---

### Task 10: Apply rate limiting + Turnstile + logging to magic-link route

**Files:**
- Modify: `src/app/api/auth/magic-link/route.ts`

- [ ] **Step 1: Update magic-link route with all security layers**

Replace `src/app/api/auth/magic-link/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createMagicLink } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email/send-magic-link";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { logSecurityEvent, getClientIp } from "@/lib/security/audit";
import type { Locale } from "@/lib/i18n/translations";

const GENERIC_RESPONSE = {
  message: "Se o email estiver registado, receberá um link de acesso.",
};

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || undefined;

  try {
    const body = await request.json();
    const { email, turnstileToken } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limit by IP
    const ipLimit = checkRateLimit(`ml:ip:${ip}`, 20, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      await logSecurityEvent({
        eventType: "rate_limited",
        email: normalizedEmail,
        ip,
        userAgent,
        details: { limiter: "ip" },
      });
      return NextResponse.json(GENERIC_RESPONSE);
    }

    // Rate limit by email
    const emailLimit = checkRateLimit(
      `ml:email:${normalizedEmail}`,
      5,
      15 * 60 * 1000
    );
    if (!emailLimit.allowed) {
      await logSecurityEvent({
        eventType: "rate_limited",
        email: normalizedEmail,
        ip,
        userAgent,
        details: { limiter: "email" },
      });
      return NextResponse.json(GENERIC_RESPONSE);
    }

    // Turnstile CAPTCHA verification
    if (turnstileToken) {
      const captchaValid = await verifyTurnstile(turnstileToken, ip);
      if (!captchaValid) {
        await logSecurityEvent({
          eventType: "captcha_failed",
          email: normalizedEmail,
          ip,
          userAgent,
        });
        return NextResponse.json(GENERIC_RESPONSE);
      }
    }

    const localeCookie = request.cookies.get("locale")?.value;
    const locale: Locale =
      localeCookie === "es" || localeCookie === "br" || localeCookie === "en"
        ? (localeCookie as Locale)
        : "pt";

    const magicLink = await createMagicLink(normalizedEmail);

    if (magicLink) {
      try {
        await sendMagicLinkEmail(normalizedEmail, magicLink, locale);
        await logSecurityEvent({
          eventType: "magic_link_sent",
          email: normalizedEmail,
          ip,
          userAgent,
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    } else {
      await logSecurityEvent({
        eventType: "magic_link_failed",
        email: normalizedEmail,
        ip,
        userAgent,
        details: { reason: "email_not_found" },
      });
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/app/api/auth/magic-link/route.ts
git commit -m "feat: add rate limiting, Turnstile, and security logging to magic-link"
```

---

### Task 11: Add Turnstile widget to login and registration forms

**Files:**
- Modify: `src/components/auth/login-form.tsx`
- Modify: `src/app/registar/page.tsx`

- [ ] **Step 1: Read current login-form.tsx and registar/page.tsx**

Read both files to understand the current form structure.

- [ ] **Step 2: Update login-form.tsx**

Add Turnstile widget to the login form. At the top of the file, add:

```typescript
import Script from "next/script";
import { useRef, useCallback } from "react";
```

Add state for Turnstile token:

```typescript
const [turnstileToken, setTurnstileToken] = useState<string>("");
const turnstileRef = useRef<HTMLDivElement>(null);
```

Add the Turnstile Script and widget div before the submit button:

```tsx
<Script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  async
  defer
/>
{process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
  <div
    className="cf-turnstile"
    data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
    data-callback="onTurnstileSuccess"
    ref={turnstileRef}
  />
)}
```

Add a `useEffect` to set up the callback:

```typescript
useEffect(() => {
  (window as any).onTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
  };
}, []);
```

In the fetch call that sends the magic link request, include the token:

```typescript
body: JSON.stringify({ email, turnstileToken }),
```

- [ ] **Step 3: Update registar/page.tsx**

Read `src/app/registar/page.tsx`. Find the server action that handles registration. Add Turnstile verification at the top of the server action:

```typescript
import { verifyTurnstile } from "@/lib/security/turnstile";
import { getClientIp } from "@/lib/security/audit";
import { headers } from "next/headers";
```

In the server action, before processing:

```typescript
const turnstileToken = formData.get("cf-turnstile-response") as string;
const headersList = await headers();
const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

if (process.env.TURNSTILE_SECRET_KEY) {
  const captchaValid = await verifyTurnstile(turnstileToken || "", ip);
  if (!captchaValid) {
    return { error: "Verificação de segurança falhou. Tente novamente." };
  }
}
```

Add the Turnstile widget in the form JSX (before the submit button):

```tsx
<Script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  async
  defer
/>
{process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
  <div
    className="cf-turnstile"
    data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
  />
)}
```

Note: For server actions using FormData, Turnstile automatically adds `cf-turnstile-response` to the form data.

- [ ] **Step 4: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/components/auth/login-form.tsx src/app/registar/page.tsx
git commit -m "feat: add Turnstile CAPTCHA to login and registration forms"
```

---

### Task 12: Build and verify Phase 1

- [ ] **Step 1: Run all tests**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx vitest run
```
Expected: All new security tests pass. Note any pre-existing failures (geo.test.ts).

- [ ] **Step 2: Build the project**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 3: Fix any build issues found**

Address any TypeScript errors or import issues.

- [ ] **Step 4: Commit if fixes were needed**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add -A
git commit -m "fix: resolve build issues from security phase"
```

---

## PHASE 2: i18n — ENGLISH LANGUAGE

---

### Task 13: Update locale system for EN

**Files:**
- Modify: `src/lib/i18n/translations.ts`
- Modify: `src/lib/i18n/get-locale.ts`
- Modify: `src/components/layout/locale-switcher.tsx`

- [ ] **Step 1: Add EN to Locale type and SUPPORTED_LOCALES**

In `src/lib/i18n/translations.ts`:

```typescript
// OLD:
export type Locale = "pt" | "br" | "es";
export const SUPPORTED_LOCALES: Locale[] = ["pt", "br", "es"];

// NEW:
export type Locale = "pt" | "br" | "es" | "en";
export const SUPPORTED_LOCALES: Locale[] = ["pt", "br", "es", "en"];
```

- [ ] **Step 2: Add EN to COUNTRY_LOCALE_MAP**

In the `COUNTRY_LOCALE_MAP` object, add:

```typescript
// English-speaking countries
US: "en",
GB: "en",
AU: "en",
CA: "en",
IE: "en",
NZ: "en",
ZA: "en",
IN: "en",
PH: "en",
SG: "en",
HK: "en",
MY: "en",
```

- [ ] **Step 3: Update get-locale.ts**

In `src/lib/i18n/get-locale.ts`, ensure it accepts "en" as valid:

Read the file first. If it validates the cookie value, add "en" to the allowed values.

- [ ] **Step 4: Update locale-switcher.tsx**

Read `src/components/layout/locale-switcher.tsx`. Add the EN option. It currently has buttons for PT, BR, ES. Add:

```tsx
<button
  onClick={() => setLocale("en")}
  className={locale === "en" ? "font-bold" : "opacity-70 hover:opacity-100"}
>
  EN
</button>
```

- [ ] **Step 5: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/i18n/translations.ts src/lib/i18n/get-locale.ts src/components/layout/locale-switcher.tsx
git commit -m "feat(i18n): add EN locale to type system, country map, and switcher"
```

---

### Task 14: Add EN translations to all dictionary entries

**Files:**
- Modify: `src/lib/i18n/translations.ts`

This is the largest single task — add `en:` to every entry in the translations dictionary.

- [ ] **Step 1: Add EN to `common` section**

```typescript
common: {
  teams: { pt: "Equipas", br: "Times", es: "Equipos", en: "Teams" },
  suggestions: { pt: "Sugestões", br: "Sugestões", es: "Sugerencias", en: "Suggestions" },
  register: { pt: "Registar", br: "Registrar", es: "Registrar", en: "Register" },
  access: { pt: "Aceder", br: "Acessar", es: "Acceder", en: "Access" },
  submit: { pt: "Submeter", br: "Enviar", es: "Enviar", en: "Submit" },
  email: { pt: "Email", br: "E-mail", es: "Correo electrónico", en: "Email" },
  privacyPolicy: { pt: "Política de Privacidade", br: "Política de Privacidade", es: "Política de Privacidad", en: "Privacy Policy" },
  admin: { pt: "Administração", br: "Administração", es: "Administración", en: "Admin" },
  developedBy: { pt: "Desenvolvido por", br: "Desenvolvido por", es: "Desarrollado por", en: "Developed by" },
},
```

- [ ] **Step 2: Add EN to `header` section**

```typescript
header: {
  registerTeam: { pt: "Registar Equipa", br: "Registrar Time", es: "Registrar Equipo", en: "Register Team" },
  access: { pt: "Aceder", br: "Acessar", es: "Acceder", en: "Access" },
},
```

- [ ] **Step 3: Add EN to `home` section**

```typescript
home: {
  title: { ..., en: "Veteranos Football" },
  subtitle: { ..., en: "Contact directory for veteran football teams" },
  teamsRegistered: { ..., en: "teams registered" },
  howItWorks: { ..., en: "How does it work?" },
  forNewUsers: { ..., en: "for those who haven't registered yet" },
  step1Title: { ..., en: "1. Register your team" },
  step1Desc: { ..., en: "Fill in the form with your team's details — name, location, kit, field, and coordinator contacts." },
  step2Title: { ..., en: "2. Find opponents" },
  step2Desc: { ..., en: "Search teams by name, municipality, or district. Check the map to find clubs near you and arrange matches." },
  step3Title: { ..., en: "3. Organise your matches" },
  step3Desc: { ..., en: "Each team has its own match calendar. Add fixtures, record results, and share the calendar with your team." },
  aboutPlatform: { ..., en: "Veteranos Football is a free contact platform for veteran football teams in Portugal. The goal is simple: to make communication between clubs easier and help arrange friendly matches or tournaments." },
  afterRegister: { ..., en: "After registration, you'll receive an access link by email to manage your team's profile — update details, add matches to the calendar, record results, and export the calendar to Google Calendar or your phone." },
  questionsHint: { ..., en: "Have an idea or question? Use the Suggestions page to contact the moderation team." },
  viewAllTeams: { ..., en: "View All Teams" },
  registerMyTeam: { ..., en: "Register My Team" },
  teamsOnMap: { ..., en: (onMap: number, total: number) => `${onMap} of ${total} teams visible on map` },
},
```

- [ ] **Step 4: Add EN to `login` section**

```typescript
login: {
  title: { ..., en: "Access My Team" },
  expiredError: { ..., en: "The link has expired. Request a new one below." },
  invalidError: { ..., en: "Invalid link. Request a new one below." },
  existingTeamTitle: { ..., en: "I already have a registered team" },
  existingTeamDesc: { ..., en: "Use the email you registered your team with (or the email from the original list). If you don't receive the email within a few minutes, your team may not be registered — use the option below." },
  sendAccessLink: { ..., en: "Send Access Link" },
  sending: { ..., en: "Sending..." },
  emailSent: { ..., en: "Email Sent!" },
  emailSentDesc: { ..., en: "If the email is registered, you'll receive an access link. Check your inbox (and spam)." },
  changeEmailLink: { ..., en: "Change access email" },
  changeEmailCurrentLabel: { ..., en: "Current email" },
  changeEmailNewLabel: { ..., en: "New email" },
  changeEmailSubmit: { ..., en: "Change Email" },
  changeEmailSent: { ..., en: "Confirmation email sent to the new address." },
  newTeamTitle: { ..., en: "Register new team" },
  newTeamDesc: { ..., en: "If your team isn't on the platform yet, register it here. Don't use this option if your team was already imported from the original list." },
  registerNewTeam: { ..., en: "Register New Team" },
},
```

- [ ] **Step 5: Add EN to `register` and `registerSuccess` sections**

```typescript
register: {
  title: { ..., en: "Register Team" },
  subtitle: { ..., en: "Fill in your veteran team's details. After registration, you'll receive an email with a link to access and edit your data at any time." },
  submitButton: { ..., en: "Register Team" },
  alreadyRegistered: { ..., en: "I already have a registered team" },
  goToLogin: { ..., en: "Access my team" },
},
registerSuccess: {
  title: { ..., en: "Team Registered!" },
  desc: { ..., en: "We've sent an email with an access link. Click the link to confirm your email and access your team's dashboard." },
  viewAll: { ..., en: "View All Teams" },
},
```

- [ ] **Step 6: Add EN to `auth` and `email` sections**

```typescript
auth: {
  authenticating: { ..., en: "Authenticating... please wait." },
},
email: {
  subject: { ..., en: "Access your team — Veteranos Football" },
  body: { ..., en: "Click the link below to access your team:" },
  buttonText: { ..., en: "Access My Team" },
  expiry: { ..., en: "This link expires in 30 minutes." },
  ignore: { ..., en: "If you didn't request this access, please ignore this email." },
},
```

Note: also update the PT/BR/ES expiry text from "24 horas" to "30 minutos" since we changed the expiry in Phase 1.

- [ ] **Step 7: Add EN to `form` section**

Add `en:` key to ALL entries in the `form` section. Key translations:

```typescript
form: {
  teamData: { ..., en: "Team Details" },
  teamName: { ..., en: "Team Name" },
  teamLogo: { ..., en: "Team Logo" },
  teamPhoto: { ..., en: "Team Photo" },
  foundedYear: { ..., en: "Year Founded" },
  playerCount: { ..., en: "Number of Players" },
  ageGroup: { ..., en: "Age Group" },
  mixed: { ..., en: "Mixed" },
  teamType: { ..., en: "Team Type" },
  dinner: { ..., en: "Available for Dinner (Third Party)" },
  primaryKit: { ..., en: "Home Kit" },
  secondaryKit: { ..., en: "Away Kit" },
  shirt: { ..., en: "Shirt" },
  shorts: { ..., en: "Shorts" },
  socks: { ..., en: "Socks" },
  coordinator: { ..., en: "Coordinator" },
  coordinatorEmail: { ..., en: "Coordinator Email" },
  coordinatorName: { ..., en: "Coordinator Name" },
  coordinatorPhone: { ..., en: "Coordinator Phone" },
  altCoordinatorName: { ..., en: "Alternative Coordinator Name" },
  altPhone: { ..., en: "Alternative Phone" },
  field: { ..., en: "Field" },
  fieldName: { ..., en: "Field Name" },
  fieldType: { ..., en: "Field Type" },
  synthetic: { ..., en: "Synthetic" },
  naturalGrass: { ..., en: "Natural Grass" },
  dirt: { ..., en: "Dirt" },
  futsalCourt: { ..., en: "Futsal Court" },
  other: { ..., en: "Other" },
  fieldAddress: { ..., en: "Field Address" },
  parish: { ..., en: "Parish / Locality" },
  municipality: { ..., en: "Municipality" },
  district: { ..., en: "District" },
  selectDistrict: { ..., en: "Select district" },
  international: { ..., en: "International" },
  mapsLink: { ..., en: "Google Maps Link" },
  mapsHint: { ..., en: "Paste the full Google Maps link (also accepts short links and coordinates)" },
  additionalInfo: { ..., en: "Additional Information" },
  trainingSchedule: { ..., en: "Training / Match Schedule" },
  notes: { ..., en: "Notes" },
  requiredFields: { ..., en: "* Required fields" },
  rgpdRequired: { ..., en: "You must accept the Privacy Policy." },
},
```

- [ ] **Step 8: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/i18n/translations.ts
git commit -m "feat(i18n): add complete EN translations to dictionary"
```

---

### Task 15: Add new translation keys for dashboard and components

**Files:**
- Modify: `src/lib/i18n/translations.ts`

Many dashboard pages and components have hardcoded Portuguese text that isn't in the dictionary yet. These need new translation keys.

- [ ] **Step 1: Read all dashboard and component files**

Read each file listed in the spec's "Components needing translation" to identify hardcoded Portuguese strings not yet in the translations dictionary.

- [ ] **Step 2: Add new sections to translations.ts**

Add new sections for dashboard, suggestions, privacy, teams directory, team detail, matches, and any components with hardcoded text. Example new sections:

```typescript
dashboard: {
  title: { pt: "Painel do Coordenador", br: "Painel do Coordenador", es: "Panel del Coordinador", en: "Coordinator Dashboard" },
  myTeams: { pt: "As Minhas Equipas", br: "Os Meus Times", es: "Mis Equipos", en: "My Teams" },
  editTeam: { pt: "Editar Equipa", br: "Editar Time", es: "Editar Equipo", en: "Edit Team" },
  matches: { pt: "Jogos", br: "Jogos", es: "Partidos", en: "Matches" },
  transfer: { pt: "Transferir Coordenação", br: "Transferir Coordenação", es: "Transferir Coordinación", en: "Transfer Coordination" },
  deactivate: { pt: "Eliminar Equipa", br: "Eliminar Time", es: "Eliminar Equipo", en: "Delete Team" },
  save: { pt: "Guardar", br: "Salvar", es: "Guardar", en: "Save" },
  saving: { pt: "A guardar...", br: "Salvando...", es: "Guardando...", en: "Saving..." },
  saved: { pt: "Guardado!", br: "Salvo!", es: "¡Guardado!", en: "Saved!" },
  cancel: { pt: "Cancelar", br: "Cancelar", es: "Cancelar", en: "Cancel" },
  delete: { pt: "Eliminar", br: "Eliminar", es: "Eliminar", en: "Delete" },
  confirmDelete: { pt: "Tem a certeza?", br: "Tem certeza?", es: "¿Estás seguro?", en: "Are you sure?" },
  noTeams: { pt: "Nenhuma equipa registada.", br: "Nenhum time registrado.", es: "Ningún equipo registrado.", en: "No teams registered." },
},

suggestions: {
  title: { pt: "Sugestões", br: "Sugestões", es: "Sugerencias", en: "Suggestions" },
  subtitle: { pt: "Envie-nos uma sugestão ou reporte um problema.", br: "Envie-nos uma sugestão ou reporte um problema.", es: "Envíanos una sugerencia o reporta un problema.", en: "Send us a suggestion or report an issue." },
  name: { pt: "Nome", br: "Nome", es: "Nombre", en: "Name" },
  subject: { pt: "Assunto", br: "Assunto", es: "Asunto", en: "Subject" },
  message: { pt: "Mensagem", br: "Mensagem", es: "Mensaje", en: "Message" },
  send: { pt: "Enviar", br: "Enviar", es: "Enviar", en: "Send" },
  sent: { pt: "Sugestão enviada!", br: "Sugestão enviada!", es: "¡Sugerencia enviada!", en: "Suggestion sent!" },
},

matchForm: {
  opponent: { pt: "Adversário", br: "Adversário", es: "Rival", en: "Opponent" },
  date: { pt: "Data", br: "Data", es: "Fecha", en: "Date" },
  time: { pt: "Hora", br: "Hora", es: "Hora", en: "Time" },
  location: { pt: "Local", br: "Local", es: "Lugar", en: "Location" },
  home: { pt: "Casa", br: "Casa", es: "Local", en: "Home" },
  away: { pt: "Fora", br: "Fora", es: "Visitante", en: "Away" },
  goalsFor: { pt: "Golos marcados", br: "Gols marcados", es: "Goles a favor", en: "Goals scored" },
  goalsAgainst: { pt: "Golos sofridos", br: "Gols sofridos", es: "Goles en contra", en: "Goals conceded" },
  addMatch: { pt: "Adicionar Jogo", br: "Adicionar Jogo", es: "Añadir Partido", en: "Add Match" },
  editMatch: { pt: "Editar Jogo", br: "Editar Jogo", es: "Editar Partido", en: "Edit Match" },
  noMatches: { pt: "Sem jogos agendados.", br: "Sem jogos agendados.", es: "Sin partidos programados.", en: "No matches scheduled." },
  exportCalendar: { pt: "Exportar Calendário", br: "Exportar Calendário", es: "Exportar Calendario", en: "Export Calendar" },
},

teamsDirectory: {
  title: { pt: "Equipas", br: "Times", es: "Equipos", en: "Teams" },
  searchPlaceholder: { pt: "Pesquisar por nome, concelho...", br: "Pesquisar por nome, município...", es: "Buscar por nombre, municipio...", en: "Search by name, municipality..." },
  allDistricts: { pt: "Todos os distritos", br: "Todos os estados", es: "Todas las provincias", en: "All districts" },
  noResults: { pt: "Nenhuma equipa encontrada.", br: "Nenhum time encontrado.", es: "Ningún equipo encontrado.", en: "No teams found." },
  teamCount: {
    pt: (n: number) => `${n} equipa${n !== 1 ? "s" : ""}`,
    br: (n: number) => `${n} time${n !== 1 ? "s" : ""}`,
    es: (n: number) => `${n} equipo${n !== 1 ? "s" : ""}`,
    en: (n: number) => `${n} team${n !== 1 ? "s" : ""}`,
  },
},
```

Continue adding sections as needed for privacy page, transfer page, eliminate page, consent page, etc. Every hardcoded Portuguese string in a public/dashboard page must get a translation key.

- [ ] **Step 3: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/i18n/translations.ts
git commit -m "feat(i18n): add new translation sections for dashboard, suggestions, matches, directory"
```

---

### Task 16: Translate public pages

**Files:**
- Modify: All public page files listed in the spec

- [ ] **Step 1: Update each public page to use translations**

For each file, import `getLocale` and `t`/`tFn`, then replace hardcoded Portuguese text with translation calls.

Pattern for server components:

```typescript
import { getLocale } from "@/lib/i18n/get-locale";
import { t, tFn } from "@/lib/i18n/translations";

export default async function Page() {
  const locale = await getLocale();
  // Use t("section", "key", locale) for strings
  // Use tFn("section", "key", locale)(args) for functions
}
```

Pattern for client components:

```typescript
"use client";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/lib/i18n/translations";

function getLocaleFromCookie(): Locale {
  const match = document.cookie.match(/locale=(\w+)/);
  const val = match?.[1];
  if (val === "en" || val === "br" || val === "es") return val;
  return "pt";
}
```

Files to update (replace hardcoded PT text with `t()` calls):
- `src/app/page.tsx`
- `src/app/equipas/page.tsx`
- `src/app/equipas/[slug]/page.tsx`
- `src/app/sugestoes/page.tsx`
- `src/app/privacidade/page.tsx`
- `src/app/login/page.tsx`
- `src/app/registar/page.tsx`
- `src/app/registar/sucesso/page.tsx`
- `src/components/teams/team-card.tsx`
- `src/components/teams/team-form.tsx`
- `src/components/teams/team-filters.tsx`
- `src/components/teams/team-contact.tsx`
- `src/components/teams/image-upload.tsx`
- `src/components/auth/rgpd-consent.tsx`
- `src/components/layout/header.tsx`
- `src/components/layout/footer.tsx`
- `src/components/layout/mobile-nav.tsx`

- [ ] **Step 2: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/app/ src/components/
git commit -m "feat(i18n): translate all public pages and components to EN"
```

---

### Task 17: Translate dashboard pages

**Files:**
- Modify: All dashboard page files

- [ ] **Step 1: Update dashboard pages**

Apply the same pattern to:
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/[teamId]/page.tsx`
- `src/app/dashboard/[teamId]/jogos/page.tsx`
- `src/app/dashboard/[teamId]/jogos/[matchId]/page.tsx`
- `src/app/dashboard/[teamId]/transferir/page.tsx`
- `src/app/dashboard/[teamId]/eliminar/page.tsx`
- `src/app/dashboard/consentimento/page.tsx`
- `src/components/teams/match-calendar.tsx`
- `src/components/teams/match-form.tsx`
- `src/components/teams/match-list.tsx`

- [ ] **Step 2: Update email template**

In `src/lib/email/send-magic-link.ts`, add EN case to the locale switch for subject, body, button text, and expiry notice.

- [ ] **Step 3: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/app/dashboard/ src/components/teams/ src/lib/email/
git commit -m "feat(i18n): translate dashboard pages and email templates to EN"
```

---

### Task 18: Build and verify Phase 2

- [ ] **Step 1: Run build**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npm run build
```
Expected: Build succeeds. Fix any TypeScript errors (missing `en` key in translation entries will cause type errors).

- [ ] **Step 2: Fix any issues and commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add -A
git commit -m "fix: resolve i18n build issues"
```

---

## PHASE 3: DUPLICATE DETECTION & MANAGEMENT

---

### Task 19: Database migration — duplicate_pairs table

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Add duplicate_pairs table and enums to schema**

In `src/lib/db/schema.ts`, add:

```typescript
export const duplicatePairStatus = pgEnum("duplicate_pair_status", [
  "pending",
  "confirmed_duplicate",
  "not_duplicate",
  "merged",
]);

export const duplicatePairs = pgTable("duplicate_pairs", {
  id: uuid().primaryKey().defaultRandom(),
  teamAId: uuid("team_a_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  teamBId: uuid("team_b_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  similarityScore: real("similarity_score").notNull().default(0.5),
  status: duplicatePairStatus("status").notNull().default("pending"),
  resolvedBy: uuid("resolved_by").references(() => admins.id, {
    onDelete: "set null",
  }),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

- [ ] **Step 2: Generate and push migration**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx drizzle-kit generate && npx drizzle-kit push
```

- [ ] **Step 3: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/db/schema.ts drizzle/
git commit -m "feat: add duplicate_pairs table for smart duplicate tracking"
```

---

### Task 20: Duplicate detection module

**Files:**
- Create: `src/lib/duplicates/detect.ts`
- Create: `tests/lib/duplicates.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/lib/duplicates.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  normalizeText,
  normalizePhone,
  levenshtein,
  haversineDistance,
} from "@/lib/duplicates/detect";

describe("normalizeText", () => {
  it("strips accents and lowercases", () => {
    expect(normalizeText("Veteranos Águeda")).toBe("veteranos agueda");
  });

  it("trims whitespace", () => {
    expect(normalizeText("  Teste  ")).toBe("teste");
  });

  it("expands common abbreviations", () => {
    expect(normalizeText("Vet. Leiria FC")).toBe("veteranos leiria futebol clube");
  });
});

describe("normalizePhone", () => {
  it("strips non-digits", () => {
    expect(normalizePhone("+351 912 345 678")).toBe("912345678");
  });

  it("removes 351 prefix", () => {
    expect(normalizePhone("351912345678")).toBe("912345678");
  });

  it("removes 00351 prefix", () => {
    expect(normalizePhone("00351912345678")).toBe("912345678");
  });

  it("keeps last 9 digits", () => {
    expect(normalizePhone("912345678")).toBe("912345678");
  });
});

describe("levenshtein", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshtein("abc", "abc")).toBe(0);
  });

  it("returns correct distance", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });

  it("handles empty strings", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });
});

describe("haversineDistance", () => {
  it("returns 0 for same point", () => {
    expect(haversineDistance(39.5, -8.0, 39.5, -8.0)).toBe(0);
  });

  it("calculates distance in meters (Lisbon to Porto ~274km)", () => {
    const d = haversineDistance(38.7223, -9.1393, 41.1579, -8.6291);
    expect(d).toBeGreaterThan(270_000);
    expect(d).toBeLessThan(280_000);
  });

  it("returns small distance for nearby points", () => {
    // ~100m apart
    const d = haversineDistance(39.5, -8.0, 39.5009, -8.0);
    expect(d).toBeGreaterThan(50);
    expect(d).toBeLessThan(200);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx vitest run tests/lib/duplicates.test.ts
```

- [ ] **Step 3: Implement detection utilities**

Create `src/lib/duplicates/detect.ts`:

```typescript
// --- Text normalization ---

const ABBREVIATIONS: Record<string, string> = {
  "vet.": "veteranos",
  fc: "futebol clube",
  cf: "clube futebol",
  sc: "sporting clube",
  ac: "atletico clube",
  gd: "grupo desportivo",
  cd: "clube desportivo",
  ud: "uniao desportiva",
  ad: "associacao desportiva",
  sr: "sociedade recreativa",
};

export function normalizeText(text: string): string {
  let normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  for (const [abbr, full] of Object.entries(ABBREVIATIONS)) {
    normalized = normalized.replace(
      new RegExp(`\\b${abbr.replace(".", "\\.")}\\b`, "g"),
      full
    );
  }

  return normalized.replace(/\s+/g, " ").trim();
}

// --- Phone normalization ---

export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00351")) digits = digits.slice(5);
  else if (digits.startsWith("351") && digits.length > 9) digits = digits.slice(3);
  return digits.slice(-9);
}

// --- Levenshtein distance ---

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

// --- Haversine distance (meters) ---

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6_371_000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx vitest run tests/lib/duplicates.test.ts
```
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/duplicates/detect.ts tests/lib/duplicates.test.ts
git commit -m "feat: add duplicate detection utilities (fuzzy match, phone, geo)"
```

---

### Task 21: Rewrite recalculate-flags to use duplicate_pairs

**Files:**
- Modify: `src/lib/recalculate-flags.ts`

- [ ] **Step 1: Read current recalculate-flags.ts**

Already read. The current version writes to `teams.duplicate_flag` string field.

- [ ] **Step 2: Rewrite to use duplicate_pairs table**

Replace `src/lib/recalculate-flags.ts` with a version that:
1. Clears all `pending` entries in `duplicate_pairs` (keeps resolved ones)
2. Fetches all active teams
3. Compares each pair using the detection utilities
4. Inserts new `duplicate_pairs` rows with reason and similarity score
5. Skips pairs already resolved as `not_duplicate`

```typescript
import { db } from "@/lib/db";
import { teams, duplicatePairs } from "@/lib/db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import {
  normalizeText,
  normalizePhone,
  levenshtein,
  haversineDistance,
} from "@/lib/duplicates/detect";

interface TeamRow {
  id: string;
  name: string;
  coordinatorEmail: string | null;
  coordinatorPhone: string | null;
  latitude: string | null;
  longitude: string | null;
  coordinatorName: string | null;
}

interface DuplicatePair {
  teamAId: string;
  teamBId: string;
  reason: string;
  similarityScore: number;
}

export async function recalculateDuplicateFlags() {
  // Clear pending pairs (keep resolved ones)
  await db
    .delete(duplicatePairs)
    .where(eq(duplicatePairs.status, "pending"));

  // Load resolved pairs to avoid re-flagging
  const resolvedPairs = await db
    .select({ teamAId: duplicatePairs.teamAId, teamBId: duplicatePairs.teamBId })
    .from(duplicatePairs)
    .where(eq(duplicatePairs.status, "not_duplicate"));

  const resolvedSet = new Set(
    resolvedPairs.map((p) => [p.teamAId, p.teamBId].sort().join(":"))
  );

  // Fetch all active teams
  const activeTeams: TeamRow[] = await db
    .select({
      id: teams.id,
      name: teams.name,
      coordinatorEmail: teams.coordinatorEmail,
      coordinatorPhone: teams.coordinatorPhone,
      latitude: teams.latitude,
      longitude: teams.longitude,
      coordinatorName: teams.coordinatorName,
    })
    .from(teams)
    .where(eq(teams.isActive, true));

  const pairs: DuplicatePair[] = [];

  for (let i = 0; i < activeTeams.length; i++) {
    const a = activeTeams[i];

    // Self-check: name equals coordinator name
    if (
      a.coordinatorName &&
      a.coordinatorName.trim() &&
      normalizeText(a.name) === normalizeText(a.coordinatorName)
    ) {
      pairs.push({
        teamAId: a.id,
        teamBId: a.id,
        reason: "name_equals_coordinator",
        similarityScore: 0.4,
      });
    }

    for (let j = i + 1; j < activeTeams.length; j++) {
      const b = activeTeams[j];
      const pairKey = [a.id, b.id].sort().join(":");
      if (resolvedSet.has(pairKey)) continue;

      // Email match
      if (
        a.coordinatorEmail &&
        b.coordinatorEmail &&
        a.coordinatorEmail.toLowerCase().trim() ===
          b.coordinatorEmail.toLowerCase().trim()
      ) {
        pairs.push({
          teamAId: a.id,
          teamBId: b.id,
          reason: "email",
          similarityScore: 1.0,
        });
      }

      // Phone match
      if (a.coordinatorPhone && b.coordinatorPhone) {
        const phoneA = normalizePhone(a.coordinatorPhone);
        const phoneB = normalizePhone(b.coordinatorPhone);
        if (phoneA.length >= 9 && phoneA === phoneB) {
          const isExact =
            a.coordinatorPhone.replace(/\s/g, "") ===
            b.coordinatorPhone.replace(/\s/g, "");
          pairs.push({
            teamAId: a.id,
            teamBId: b.id,
            reason: isExact ? "phone" : "phone_normalized",
            similarityScore: isExact ? 0.9 : 0.8,
          });
        }
      }

      // Name matching
      const normA = normalizeText(a.name);
      const normB = normalizeText(b.name);

      if (normA === normB) {
        pairs.push({
          teamAId: a.id,
          teamBId: b.id,
          reason: "name_exact",
          similarityScore: 0.9,
        });
      } else {
        const dist = levenshtein(normA, normB);
        if (dist <= 1) {
          pairs.push({
            teamAId: a.id,
            teamBId: b.id,
            reason: "name_fuzzy",
            similarityScore: 0.8,
          });
        } else if (dist <= 3 && Math.max(normA.length, normB.length) > 8) {
          pairs.push({
            teamAId: a.id,
            teamBId: b.id,
            reason: "name_fuzzy",
            similarityScore: 0.6,
          });
        }
      }

      // Geographic proximity
      if (a.latitude && a.longitude && b.latitude && b.longitude) {
        const dist = haversineDistance(
          parseFloat(a.latitude),
          parseFloat(a.longitude),
          parseFloat(b.latitude),
          parseFloat(b.longitude)
        );
        if (dist < 100) {
          pairs.push({
            teamAId: a.id,
            teamBId: b.id,
            reason: "geo_proximity",
            similarityScore: 0.7,
          });
        } else if (dist < 500) {
          pairs.push({
            teamAId: a.id,
            teamBId: b.id,
            reason: "geo_proximity",
            similarityScore: 0.5,
          });
        }
      }
    }
  }

  // Batch insert new pairs
  if (pairs.length > 0) {
    await db.insert(duplicatePairs).values(pairs).onConflictDoNothing();
  }
}
```

- [ ] **Step 3: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/recalculate-flags.ts
git commit -m "feat: rewrite duplicate detection with fuzzy matching, phone normalization, geo proximity"
```

---

### Task 22: Team merge module

**Files:**
- Create: `src/lib/duplicates/merge.ts`

- [ ] **Step 1: Create merge module**

Create `src/lib/duplicates/merge.ts`:

```typescript
import { db } from "@/lib/db";
import { teams, matches, suggestions, duplicatePairs, auditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Merges secondaryId into primaryId:
 * 1. Copies non-empty fields from secondary to primary (where primary is empty)
 * 2. Transfers matches from secondary to primary
 * 3. Transfers suggestions from secondary to primary
 * 4. Deactivates secondary
 * 5. Updates duplicate pair status
 * 6. Logs the merge in audit log
 */
export async function mergeTeams(
  primaryId: string,
  secondaryId: string,
  pairId: string,
  adminEmail: string
): Promise<void> {
  const [primary] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, primaryId));

  const [secondary] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, secondaryId));

  if (!primary || !secondary) throw new Error("Team not found");

  // Build update: fill empty fields of primary with secondary's data
  const fillableFields = [
    "logoUrl",
    "teamPhotoUrl",
    "fieldName",
    "fieldAddress",
    "fieldType",
    "mapsUrl",
    "latitude",
    "longitude",
    "localidade",
    "concelho",
    "distrito",
    "coordinatorAltName",
    "coordinatorAltPhone",
    "socialFacebook",
    "socialInstagram",
    "trainingSchedule",
    "notes",
    "foundedYear",
    "playerCount",
    "ageGroup",
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const field of fillableFields) {
    if (!primary[field] && secondary[field]) {
      updates[field] = secondary[field];
    }
  }

  if (Object.keys(updates).length > 0) {
    await db.update(teams).set(updates).where(eq(teams.id, primaryId));
  }

  // Transfer matches
  await db
    .update(matches)
    .set({ teamId: primaryId })
    .where(eq(matches.teamId, secondaryId));

  // Transfer suggestions
  await db
    .update(suggestions)
    .set({ teamId: primaryId })
    .where(eq(suggestions.teamId, secondaryId));

  // Deactivate secondary
  await db
    .update(teams)
    .set({ isActive: false })
    .where(eq(teams.id, secondaryId));

  // Update pair status
  await db
    .update(duplicatePairs)
    .set({ status: "merged", resolvedAt: new Date() })
    .where(eq(duplicatePairs.id, pairId));

  // Audit log
  await db.insert(auditLog).values({
    actorType: "super_admin",
    actorEmail: adminEmail,
    action: "teams_merged",
    teamId: primaryId,
    details: {
      primaryId,
      secondaryId,
      fieldsCopied: Object.keys(updates),
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/lib/duplicates/merge.ts
git commit -m "feat: add team merge logic for duplicate resolution"
```

---

### Task 23: Admin duplicates page

**Files:**
- Create: `src/app/admin/duplicados/page.tsx`
- Create: `src/components/admin/duplicate-compare.tsx`
- Create: `src/components/admin/merge-modal.tsx`
- Modify: `src/app/admin/layout.tsx`

- [ ] **Step 1: Create the admin duplicates page**

Create `src/app/admin/duplicados/page.tsx`:

```typescript
import { db } from "@/lib/db";
import { duplicatePairs, teams, admins } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { DuplicateCompare } from "@/components/admin/duplicate-compare";
import { revalidatePath } from "next/cache";
import { mergeTeams } from "@/lib/duplicates/merge";

export const dynamic = "force-dynamic";

export default async function DuplicadosPage() {
  const admin = await requireAdmin();

  const pairs = await db
    .select()
    .from(duplicatePairs)
    .where(eq(duplicatePairs.status, "pending"))
    .orderBy(desc(duplicatePairs.similarityScore));

  // Fetch team data for all pairs
  const teamIds = new Set<string>();
  for (const pair of pairs) {
    teamIds.add(pair.teamAId);
    teamIds.add(pair.teamBId);
  }

  const teamList =
    teamIds.size > 0
      ? await db
          .select()
          .from(teams)
          .where(
            // Use SQL IN for the set of IDs
            eq(teams.isActive, true)
          )
      : [];

  const teamMap = new Map(teamList.map((t) => [t.id, t]));

  async function resolveAction(formData: FormData) {
    "use server";
    const pairId = formData.get("pairId") as string;
    const action = formData.get("action") as string;

    if (action === "not_duplicate") {
      await db
        .update(duplicatePairs)
        .set({ status: "not_duplicate", resolvedAt: new Date() })
        .where(eq(duplicatePairs.id, pairId));
    } else if (action === "confirm") {
      await db
        .update(duplicatePairs)
        .set({ status: "confirmed_duplicate", resolvedAt: new Date() })
        .where(eq(duplicatePairs.id, pairId));
    } else if (action === "merge") {
      const primaryId = formData.get("primaryId") as string;
      const secondaryId = formData.get("secondaryId") as string;
      await mergeTeams(primaryId, secondaryId, pairId, admin.email);
    }

    revalidatePath("/admin/duplicados");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Duplicados ({pairs.length} pendentes)
      </h1>

      {pairs.length === 0 ? (
        <p className="text-muted-foreground">Sem duplicados pendentes.</p>
      ) : (
        <div className="space-y-4">
          {pairs.map((pair) => (
            <DuplicateCompare
              key={pair.id}
              pair={pair}
              teamA={teamMap.get(pair.teamAId) || null}
              teamB={teamMap.get(pair.teamBId) || null}
              resolveAction={resolveAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create DuplicateCompare component**

Create `src/components/admin/duplicate-compare.tsx`:

A client component that shows a card per pair with:
- Summary row (Team A name, reason badge, score, Team B name)
- Expandable section showing side-by-side comparison of all fields
- Action buttons: Merge (with primary team selection), Not Duplicate, Confirm

This is a larger UI component — implement with shadcn Card, Badge, Button, and collapsible sections.

- [ ] **Step 3: Create MergeModal component**

Create `src/components/admin/merge-modal.tsx`:

A client component dialog that:
- Shows both team names
- Lets admin choose which is primary
- Shows preview of what will be merged
- Confirm/Cancel buttons
- Submits form with `action=merge`, `primaryId`, `secondaryId`, `pairId`

- [ ] **Step 4: Add duplicate link to admin layout sidebar**

In `src/app/admin/layout.tsx`, add a link to `/admin/duplicados` in the navigation. Include a badge showing the count of pending pairs.

- [ ] **Step 5: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/app/admin/duplicados/ src/components/admin/duplicate-compare.tsx src/components/admin/merge-modal.tsx src/app/admin/layout.tsx
git commit -m "feat: add admin duplicate management panel with merge UI"
```

---

### Task 24: Build and verify Phase 3

- [ ] **Step 1: Run tests**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx vitest run
```

- [ ] **Step 2: Build**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npm run build
```

- [ ] **Step 3: Fix and commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add -A
git commit -m "fix: resolve build issues from duplicates phase"
```

---

## PHASE 4: MAP IMPROVEMENTS

---

### Task 25: Install react-leaflet-cluster

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npm install react-leaflet-cluster
```

If `react-leaflet-cluster` doesn't support React 19 / react-leaflet 5, use `leaflet.markercluster` directly:

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npm install leaflet.markercluster @types/leaflet.markercluster
```

- [ ] **Step 2: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add package.json package-lock.json
git commit -m "chore: add marker clustering dependency"
```

---

### Task 26: Custom markers component

**Files:**
- Create: `src/components/map/custom-marker.tsx`

- [ ] **Step 1: Create custom marker factory**

Create `src/components/map/custom-marker.tsx`:

```typescript
import L from "leaflet";

export function createLogoIcon(logoUrl: string): L.DivIcon {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      background-image: url('${logoUrl}');
      background-size: cover;
      background-position: center;
    "></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
}

export function createDefaultIcon(): L.DivIcon {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 32px; height: 32px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      background-color: #166534;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5" fill="none"/>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 3.3l1.35-.95c1.82.56 3.37 1.76 4.38 3.34l-.39 1.34-1.35.46L14 7.17V5.3zm-3.35-.95L11 5.3v1.87L8.01 9.49l-1.35-.46-.39-1.34c1.01-1.58 2.56-2.78 4.38-3.34zM7.08 17.11l-1.14.1C4.73 15.81 4 13.99 4 12c0-.12.01-.23.02-.35l1-.73 1.38.48 1.46 4.34-.78 1.37zm7.42 2.48c-.79.26-1.63.41-2.5.41s-1.71-.15-2.5-.41l-.69-1.49.64-1.1h5.1l.64 1.1-.69 1.49zM14.27 15H9.73l-1.35-4.02L12 8.44l3.63 2.54L14.27 15zm3.79 2.21l-1.14-.1-.78-1.37 1.46-4.34 1.38-.48 1 .73c.01.12.02.23.02.35 0 1.99-.73 3.81-1.94 5.21z"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export function getMarkerIcon(logoUrl: string | null): L.Icon | L.DivIcon {
  if (logoUrl) return createLogoIcon(logoUrl);
  return createDefaultIcon();
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/components/map/custom-marker.tsx
git commit -m "feat: add custom map markers with team logo and football icon"
```

---

### Task 27: Rich popup component

**Files:**
- Create: `src/components/map/rich-popup.tsx`

- [ ] **Step 1: Create rich popup**

Create `src/components/map/rich-popup.tsx`:

```typescript
import type { TeamMapData } from "./portugal-map";

export function RichPopupContent({ team }: { team: TeamMapData }) {
  return (
    <div className="min-w-[200px] max-w-[280px]">
      <div className="flex items-center gap-2 mb-2">
        {team.logoUrl && (
          <img
            src={team.logoUrl}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
        <a
          href={`/equipas/${team.slug}`}
          className="font-semibold text-green-700 hover:underline text-sm"
        >
          {team.name}
        </a>
      </div>

      {team.location && (
        <p className="text-xs text-gray-600 mb-1">{team.location}</p>
      )}
      {team.distrito && (
        <p className="text-xs text-gray-500 mb-2">{team.distrito}</p>
      )}

      <div className="flex gap-1 mb-2 flex-wrap">
        {team.teamTypeF11 && (
          <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
            F11
          </span>
        )}
        {team.teamTypeF7 && (
          <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
            F7
          </span>
        )}
        {team.teamTypeFutsal && (
          <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
            Futsal
          </span>
        )}
      </div>

      {(team.kitPrimaryShirt || team.kitSecondaryShirt) && (
        <div className="flex gap-1 mb-2 items-center">
          <span className="text-[10px] text-gray-500">Kit:</span>
          {team.kitPrimaryShirt && (
            <span className="text-[10px]">{team.kitPrimaryShirt}</span>
          )}
          {team.kitSecondaryShirt && (
            <>
              <span className="text-[10px] text-gray-400">/</span>
              <span className="text-[10px]">{team.kitSecondaryShirt}</span>
            </>
          )}
        </div>
      )}

      {team.fieldName && (
        <p className="text-[10px] text-gray-500 mb-2">
          Campo: {team.fieldName}
        </p>
      )}

      <a
        href={`/equipas/${team.slug}`}
        className="block text-center text-xs bg-green-700 text-white rounded py-1 hover:bg-green-800 transition-colors"
      >
        Ver Equipa
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/components/map/rich-popup.tsx
git commit -m "feat: add rich popup component for map markers"
```

---

### Task 28: Map filters component

**Files:**
- Create: `src/components/map/map-filters.tsx`

- [ ] **Step 1: Create filter bar**

Create `src/components/map/map-filters.tsx`:

```typescript
"use client";

import { useState, useMemo } from "react";
import type { Locale } from "@/lib/i18n/translations";

const DISTRITOS = [
  "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco",
  "Coimbra", "Évora", "Faro", "Guarda", "Leiria",
  "Lisboa", "Portalegre", "Porto", "Santarém", "Setúbal",
  "Viana do Castelo", "Vila Real", "Viseu",
  "Açores", "Madeira", "Internacional",
];

export interface MapFilters {
  distrito: string;
  teamType: { f11: boolean; f7: boolean; futsal: boolean };
  dinner: boolean | null;
  search: string;
}

interface MapFiltersBarProps {
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
  visibleCount: number;
  totalCount: number;
  locale: Locale;
}

export function MapFiltersBar({
  filters,
  onChange,
  visibleCount,
  totalCount,
  locale,
}: MapFiltersBarProps) {
  const labels = {
    allDistricts: { pt: "Todos os distritos", br: "Todos", es: "Todos", en: "All districts" },
    search: { pt: "Pesquisar equipa...", br: "Pesquisar...", es: "Buscar...", en: "Search team..." },
    dinner: { pt: "Jantar", br: "Jantar", es: "Cena", en: "Dinner" },
    clear: { pt: "Limpar", br: "Limpar", es: "Limpiar", en: "Clear" },
    showing: { pt: "a mostrar", br: "mostrando", es: "mostrando", en: "showing" },
    of: { pt: "de", br: "de", es: "de", en: "of" },
  };

  const l = (key: keyof typeof labels) => labels[key][locale] || labels[key].en;

  return (
    <div className="flex flex-wrap gap-2 items-center mb-3 p-3 bg-muted/50 rounded-lg">
      <input
        type="text"
        placeholder={l("search")}
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="px-2 py-1 text-sm rounded border bg-background w-40"
      />

      <select
        value={filters.distrito}
        onChange={(e) => onChange({ ...filters, distrito: e.target.value })}
        className="px-2 py-1 text-sm rounded border bg-background"
      >
        <option value="">{l("allDistricts")}</option>
        {DISTRITOS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <label className="flex items-center gap-1 text-xs">
        <input
          type="checkbox"
          checked={filters.teamType.f11}
          onChange={(e) =>
            onChange({
              ...filters,
              teamType: { ...filters.teamType, f11: e.target.checked },
            })
          }
        />
        F11
      </label>
      <label className="flex items-center gap-1 text-xs">
        <input
          type="checkbox"
          checked={filters.teamType.f7}
          onChange={(e) =>
            onChange({
              ...filters,
              teamType: { ...filters.teamType, f7: e.target.checked },
            })
          }
        />
        F7
      </label>
      <label className="flex items-center gap-1 text-xs">
        <input
          type="checkbox"
          checked={filters.teamType.futsal}
          onChange={(e) =>
            onChange({
              ...filters,
              teamType: { ...filters.teamType, futsal: e.target.checked },
            })
          }
        />
        Futsal
      </label>

      <label className="flex items-center gap-1 text-xs">
        <input
          type="checkbox"
          checked={filters.dinner === true}
          onChange={(e) =>
            onChange({ ...filters, dinner: e.target.checked ? true : null })
          }
        />
        {l("dinner")}
      </label>

      <button
        onClick={() =>
          onChange({
            distrito: "",
            teamType: { f11: false, f7: false, futsal: false },
            dinner: null,
            search: "",
          })
        }
        className="text-xs text-muted-foreground hover:text-foreground underline"
      >
        {l("clear")}
      </button>

      <span className="ml-auto text-xs text-muted-foreground">
        {l("showing")} {visibleCount} {l("of")} {totalCount}
      </span>
    </div>
  );
}

export const DEFAULT_FILTERS: MapFilters = {
  distrito: "",
  teamType: { f11: false, f7: false, futsal: false },
  dinner: null,
  search: "",
};
```

- [ ] **Step 2: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/components/map/map-filters.tsx
git commit -m "feat: add interactive map filter bar component"
```

---

### Task 29: Upgrade portugal-map.tsx with clustering, markers, filters, popups

**Files:**
- Modify: `src/components/map/portugal-map.tsx`
- Modify: `src/components/map/map-wrapper.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update TeamMapData type to include new fields**

The `TeamMapData` type in `portugal-map.tsx` needs to be expanded to support rich popups and filters:

```typescript
export type TeamMapData = {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  latitude: string | null;
  longitude: string | null;
  logoUrl: string | null;
  distrito: string | null;
  teamTypeF11: boolean | null;
  teamTypeF7: boolean | null;
  teamTypeFutsal: boolean | null;
  dinnerThirdParty: boolean | null;
  kitPrimaryShirt: string | null;
  kitSecondaryShirt: string | null;
  fieldName: string | null;
};
```

- [ ] **Step 2: Rewrite portugal-map.tsx**

Rewrite the component to include:
- Import `MarkerClusterGroup` from the clustering package
- Import `getMarkerIcon` from `./custom-marker`
- Import `RichPopupContent` from `./rich-popup`
- Import `MapFiltersBar`, `DEFAULT_FILTERS`, and `MapFilters` from `./map-filters`
- State for filters
- `useMemo` to compute filtered teams
- Clustering wrapper around markers
- Rich popup content via `renderToString` from `react-dom/server`
- Auto fit bounds when filters change (use `useMap()` hook in a child component)
- "Where am I?" button using `navigator.geolocation`
- Responsive height via Tailwind classes

Key structure:

```typescript
"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getMarkerIcon } from "./custom-marker";
import { RichPopupContent } from "./rich-popup";
import { MapFiltersBar, DEFAULT_FILTERS, type MapFilters } from "./map-filters";
import type { Locale } from "@/lib/i18n/translations";

// ... TeamMapData type as above

function FitBounds({ teams }: { teams: TeamMapData[] }) {
  const map = useMap();
  useEffect(() => {
    const coords = teams
      .filter((t) => t.latitude && t.longitude)
      .map((t) => [parseFloat(t.latitude!), parseFloat(t.longitude!)] as [number, number]);
    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 12 });
    }
  }, [teams, map]);
  return null;
}

function LocateButton() {
  const map = useMap();
  return (
    <button
      onClick={() => {
        navigator.geolocation?.getCurrentPosition((pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 10);
        });
      }}
      className="absolute bottom-4 right-4 z-[1000] bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
      title="Where am I?"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
      </svg>
    </button>
  );
}

export function PortugalMap({ teams, locale = "pt" }: { teams: TeamMapData[]; locale?: Locale }) {
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);

  useEffect(() => { setMounted(true); }, []);

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      if (!t.latitude || !t.longitude) return false;
      if (filters.distrito && t.distrito !== filters.distrito) return false;
      if (filters.teamType.f11 && !t.teamTypeF11) return false;
      if (filters.teamType.f7 && !t.teamTypeF7) return false;
      if (filters.teamType.futsal && !t.teamTypeFutsal) return false;
      if (filters.dinner === true && !t.dinnerThirdParty) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const nameMatch = t.name.toLowerCase().includes(s);
        const locMatch = t.location?.toLowerCase().includes(s);
        if (!nameMatch && !locMatch) return false;
      }
      return true;
    });
  }, [teams, filters]);

  if (!mounted) {
    return <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-muted rounded-lg animate-pulse" />;
  }

  const center: [number, number] = [39.5, -8.0];

  return (
    <div>
      <MapFiltersBar
        filters={filters}
        onChange={setFilters}
        visibleCount={filteredTeams.length}
        totalCount={teams.filter((t) => t.latitude && t.longitude).length}
        locale={locale}
      />
      <div className="relative">
        <MapContainer
          center={center}
          zoom={7}
          className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg z-0"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom
          >
            {filteredTeams.map((team) => (
              <Marker
                key={team.id}
                position={[parseFloat(team.latitude!), parseFloat(team.longitude!)]}
                icon={getMarkerIcon(team.logoUrl)}
              >
                <Popup>
                  <RichPopupContent team={team} />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
          <FitBounds teams={filteredTeams} />
          <LocateButton />
        </MapContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update map-wrapper.tsx**

Read `src/components/map/map-wrapper.tsx` and update the dynamic import and props to pass the expanded `TeamMapData` and `locale`.

- [ ] **Step 4: Update page.tsx (homepage) to fetch and pass extra team data**

In `src/app/page.tsx`, update the database query to select the additional fields needed for the map (logoUrl, distrito, teamTypeF11, teamTypeF7, teamTypeFutsal, dinnerThirdParty, kitPrimaryShirt, kitSecondaryShirt, fieldName).

Pass `locale` prop to the map component.

- [ ] **Step 5: Add CSS for marker clusters**

In `src/app/globals.css`, add cluster styling:

```css
/* Marker cluster styles */
.marker-cluster-small {
  background-color: rgba(22, 101, 52, 0.3);
}
.marker-cluster-small div {
  background-color: rgba(22, 101, 52, 0.6);
}
.marker-cluster-medium {
  background-color: rgba(234, 179, 8, 0.3);
}
.marker-cluster-medium div {
  background-color: rgba(234, 179, 8, 0.6);
}
.marker-cluster-large {
  background-color: rgba(220, 38, 38, 0.3);
}
.marker-cluster-large div {
  background-color: rgba(220, 38, 38, 0.6);
}
.marker-cluster div {
  width: 30px;
  height: 30px;
  margin-left: 5px;
  margin-top: 5px;
  border-radius: 50%;
  font-size: 12px;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
.custom-marker {
  background: transparent !important;
  border: none !important;
}
```

- [ ] **Step 6: Commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add src/components/map/ src/app/page.tsx src/app/globals.css
git commit -m "feat: upgrade map with clustering, custom markers, filters, rich popups"
```

---

### Task 30: Final build and verification

- [ ] **Step 1: Run all tests**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx vitest run
```

- [ ] **Step 2: Run build**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npm run build
```

- [ ] **Step 3: Run lint**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && npx next lint
```

- [ ] **Step 4: Fix any remaining issues**

Address any TypeScript, build, or lint errors found.

- [ ] **Step 5: Final commit**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol
git add -A
git commit -m "fix: resolve final build and lint issues"
```

- [ ] **Step 6: Push to GitHub**

```bash
cd /home/elstanizitch/Mixed-Projects/veteranos-futebol && git push
```
