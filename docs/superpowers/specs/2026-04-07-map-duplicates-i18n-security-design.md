# Veteranos Futebol — Map, Duplicates, i18n EN & Security Improvements

**Date:** 2026-04-07
**Status:** Approved
**Approach:** Incremental by layer (A) — Security > i18n > Duplicates > Map

---

## Phase 1: Security

### 1.1 JWT Signed Sessions

Replace plain-text `coordinator_email` cookie with a signed JWT.

**Changes:**
- Add `jose` dependency for JWT sign/verify
- `src/lib/auth/session.ts`: new `createSession(email, role)` and `verifySession()` functions
- JWT payload: `{ email, role: "coordinator" | "moderator" | "super_admin", iat, exp }`
- Cookie: name `session`, HttpOnly, Secure, SameSite=Strict, max-age 7 days
- Update `getCoordinatorEmail()`, `requireCoordinator()`, `getAdminSession()`, `requireAdmin()`, `requireSuperAdmin()` to decode JWT
- Update `/api/auth/verify/route.ts` and `/auth/callback/route.ts` to set JWT cookie
- Remove old `coordinator_email` cookie logic

### 1.2 Magic Link Expiry Reduction

- `TOKEN_EXPIRY_HOURS = 24` → `TOKEN_EXPIRY_MINUTES = 30`
- Grace period stays at 15min (Outlook Safe Links compatibility)
- Add cleanup: delete tokens where `expires_at < now()` on each verify call (opportunistic GC)
- Add scheduled cleanup: API route `/api/cron/cleanup-tokens` callable by Vercel Cron (daily)

### 1.3 Rate Limiting

In-memory rate limiter for auth endpoints.

**Implementation:**
- New `src/lib/security/rate-limiter.ts`
- `Map<string, { count: number; resetAt: number }>` at module scope (persists via Fluid Compute)
- Limits:
  - `/api/auth/magic-link`: 5 requests per email per 15min, 20 requests per IP per 15min
  - Global auth endpoints: 100 requests per IP per hour
- Always return 200 with generic message (prevent email enumeration)
- Export `checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean`

### 1.4 CAPTCHA — Cloudflare Turnstile

**Client-side:**
- Add Turnstile widget to `/registar/page.tsx` (registration form) and `/login/page.tsx` (magic link request)
- Site key via `NEXT_PUBLIC_TURNSTILE_SITE_KEY` env var
- Render invisible/managed Turnstile widget

**Server-side:**
- New `src/lib/security/turnstile.ts`: `verifyTurnstile(token: string, ip: string): Promise<boolean>`
- Validate in `/api/auth/magic-link/route.ts` and registration route handler
- Secret key via `TURNSTILE_SECRET_KEY` env var

### 1.5 CSP Headers + CSRF

**CSP via `proxy.ts`:**
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data: https://*.blob.vercel-storage.com https://*.tile.openstreetmap.org https://unpkg.com;
connect-src 'self' https://challenges.cloudflare.com;
frame-src https://challenges.cloudflare.com;
font-src 'self';
```

**Additional security headers:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`

**CSRF Protection:**
- New `src/lib/security/csrf.ts`
- Generate CSRF token per session, store in JWT claims
- Hidden field `_csrf` in all forms
- Validate on all POST/PUT/DELETE handlers
- Exempt: API routes called from server components (same-origin)

### 1.6 Security Logging + IP Throttling

**New migration — `security_log` table:**
```sql
CREATE TABLE security_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,  -- magic_link_failed, token_invalid, token_expired, rate_limited, captcha_failed, login_success, login_failed
  email TEXT,
  ip TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Implementation:**
- New `src/lib/security/audit.ts`: `logSecurityEvent(event)` function
- Log events in magic-link, verify, registration, and rate-limit code paths
- IP extracted from `x-forwarded-for` or `x-real-ip` headers

---

## Phase 2: i18n — English Language

### 2.1 Locale System Update

**Files to modify:**
- `src/lib/i18n/translations.ts`:
  - `Locale` type: add `"en"`
  - `SUPPORTED_LOCALES`: add `"en"`
  - `COUNTRY_LOCALE_MAP`: US, GB, AU, CA, IE, NZ, ZA, IN, PH, SG, HK, MY → `"en"`
  - Add `en` key to ALL translation entries
- `src/proxy.ts`: detect EN countries
- `src/components/layout/locale-switcher.tsx`: add EN option with flag

### 2.2 Translation Scope

**Public pages (full EN translation):**
- Homepage (`src/app/page.tsx`)
- Teams directory (`src/app/equipas/page.tsx`)
- Team detail (`src/app/equipas/[slug]/page.tsx`)
- Registration (`src/app/registar/page.tsx`, `registar/sucesso/page.tsx`)
- Login (`src/app/login/page.tsx`)
- Suggestions (`src/app/sugestoes/page.tsx`)
- Privacy policy (`src/app/privacidade/page.tsx`)
- Auth callback (`src/app/auth/callback/route.ts`)

**Coordinator dashboard (full EN translation):**
- Dashboard home (`src/app/dashboard/page.tsx`)
- Team edit (`src/app/dashboard/[teamId]/page.tsx`)
- Match calendar (`src/app/dashboard/[teamId]/jogos/page.tsx`)
- Match edit (`src/app/dashboard/[teamId]/jogos/[matchId]/page.tsx`)
- Transfer (`src/app/dashboard/[teamId]/transferir/page.tsx`)
- Deactivate (`src/app/dashboard/[teamId]/eliminar/page.tsx`)
- RGPD consent (`src/app/dashboard/consentimento/page.tsx`)

**NOT translated (stays PT-PT only):**
- Admin panel (`src/app/admin/**`)

**Components needing translation:**
- `header.tsx`, `footer.tsx`, `mobile-nav.tsx`, `locale-switcher.tsx`
- `team-card.tsx`, `team-form.tsx`, `team-filters.tsx`, `team-contact.tsx`
- `match-calendar.tsx`, `match-form.tsx`, `match-list.tsx`
- `login-form.tsx`, `rgpd-consent.tsx`
- `image-upload.tsx`

Any hardcoded Portuguese text in these files moves to `translations.ts`.

### 2.3 Email Templates

- `src/lib/email/send-magic-link.ts`: add EN email template
- Subject: "Access your team — Veteranos Futebol"
- Body follows existing locale-aware pattern

---

## Phase 3: Duplicate Detection & Management

### 3.1 Smarter Detection

Upgrade `src/lib/recalculate-flags.ts`:

**Fuzzy name matching:**
- Normalize: strip accents (`normalize("NFD").replace(...)`) + lowercase + trim
- Abbreviation expansion: "Vet." → "Veteranos", "FC" → "Futebol Clube", etc.
- Levenshtein distance ≤ 3 on normalized names → flag as `name_fuzzy`
- Substring containment for short names (≥5 chars) within longer names

**Phone normalization:**
- Strip all non-digit chars
- Remove leading `+351`, `00351`, `351`
- Compare last 9 digits
- Flag matches as `phone_normalized`

**Geographic proximity:**
- Haversine distance between team coordinates
- Teams within 500m of each other → flag as `geo_proximity`
- Only for teams that both have valid lat/lng

### 3.2 New Schema — `duplicate_pairs`

**Migration:**
```sql
CREATE TABLE duplicate_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team_b_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  similarity_score REAL NOT NULL DEFAULT 0.5,
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_by UUID REFERENCES admins(id) ON SET NULL,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_a_id, team_b_id)
);

CREATE INDEX idx_duplicate_pairs_status ON duplicate_pairs(status);
```

**Status enum:** `pending`, `confirmed_duplicate`, `not_duplicate`, `merged`

**Reason values:** `email`, `phone`, `phone_normalized`, `name_exact`, `name_fuzzy`, `geo_proximity`, `name_equals_coordinator`

**Similarity scoring:**
- `email` match: 1.0
- `phone` exact: 0.9
- `phone_normalized`: 0.8
- `name_exact`: 0.9
- `name_fuzzy` (Levenshtein ≤ 1): 0.8
- `name_fuzzy` (Levenshtein 2-3): 0.6
- `geo_proximity` (< 100m): 0.7
- `geo_proximity` (100-500m): 0.5
- `name_equals_coordinator`: 0.4

### 3.3 Admin Duplicate Management Panel

**New page:** `/admin/duplicados`

**Features:**
- Table of pending pairs, sorted by similarity_score DESC
- Each row shows: Team A name, Team B name, reason, score, actions
- Click to expand: **side-by-side comparison** showing all fields from both teams
- Mini-map showing both team markers (if coords exist)

**Actions per pair:**
- **Merge** → modal to choose primary team, preview merged result, confirm
  - Merges: fills empty fields of primary with secondary's data
  - Transfers: matches, suggestions linked to secondary → primary
  - Deactivates secondary team
  - Logs in audit_log
  - Sets pair status to `merged`
- **Not Duplicate** → sets status to `not_duplicate`, won't resurface
- **Confirm Duplicate** → sets status to `confirmed_duplicate` (flagged, no merge yet)

**Sidebar badge:** Show count of pending duplicate pairs in admin nav

### 3.4 Migration from `duplicate_flag`

- Parse existing `duplicate_flag` strings into `duplicate_pairs` rows
- Keep `duplicate_flag` column temporarily (read-only reference)
- `recalculate-flags.ts` writes to `duplicate_pairs` instead of `duplicate_flag`
- Future migration: drop `duplicate_flag` column

---

## Phase 4: Map Improvements

### 4.1 Marker Clustering

- Add `react-leaflet-cluster` package (or `leaflet.markercluster` with custom wrapper)
- Cluster configuration:
  - Max cluster radius: 50px
  - Spiderfy on click for overlapping markers
  - Cluster colors by count: green (2-5), orange (6-15), red (16+)
  - Animate cluster split/merge

### 4.2 Custom Markers with Logo

**Teams with `logoUrl`:**
- Circular marker 40x40px via `L.divIcon`
- Team logo as background-image (object-fit: cover)
- White 2px border, subtle box-shadow
- Fallback to default marker if image fails to load

**Teams without logo:**
- Custom SVG football icon in dark green (#166534)
- 32x32px via `L.divIcon`
- Consistent style with logo markers

### 4.3 Rich Popups

Popup content per team:
- Logo thumbnail (if exists) + team name as link
- Location: localidade, distrito
- Team type badges (F11 / F7 / Futsal) using shadcn Badge
- Kit colors: 2 small colored circles (primary shirt + secondary shirt)
- Field name
- "Ver Equipa" button linking to `/equipas/[slug]`

### 4.4 Interactive Filters

Filter bar above the map:

- **District dropdown** — all 20 PT districts + "Internacional" + "Todos"
- **Team type checkboxes** — F11 / F7 / Futsal (multi-select, AND logic within type)
- **Dinner available toggle** — on/off
- **Name search** — text input, filters in real-time (debounced 300ms)
- Filters combine with AND logic
- Counter: "X de Y equipas" updates live
- "Limpar filtros" button to reset all

### 4.5 UX Improvements

- **Auto fit bounds** to visible markers after filter change
- **"Where am I?"** button using Geolocation API → center map on user position with marker
- **Responsive height**: mobile 300px, tablet 400px, desktop 500px
- **Loading skeleton** while map initializes (already exists, keep it)
- **Empty state** when no teams match filters: "Nenhuma equipa encontrada" with translated text

---

## Dependencies & New Packages

| Package | Purpose | Phase |
|---------|---------|-------|
| `jose` | JWT sign/verify | 1 |
| `react-leaflet-cluster` | Map marker clustering | 4 |

Cloudflare Turnstile is loaded via script tag (no npm package needed).

---

## Files Created (New)

| File | Purpose |
|------|---------|
| `src/lib/security/rate-limiter.ts` | Rate limiting logic |
| `src/lib/security/turnstile.ts` | Turnstile verification |
| `src/lib/security/csrf.ts` | CSRF token generation/validation |
| `src/lib/security/audit.ts` | Security event logging |
| `src/lib/duplicates/detect.ts` | Fuzzy matching, phone normalization, geo proximity |
| `src/lib/duplicates/merge.ts` | Team merge logic |
| `src/app/admin/duplicados/page.tsx` | Duplicate management panel |
| `src/app/api/cron/cleanup-tokens/route.ts` | Scheduled token cleanup |
| `src/components/map/map-filters.tsx` | Interactive filter bar |
| `src/components/map/custom-marker.tsx` | Logo/football icon markers |
| `src/components/map/rich-popup.tsx` | Enhanced popup content |
| `src/components/admin/duplicate-compare.tsx` | Side-by-side comparison |
| `src/components/admin/merge-modal.tsx` | Merge confirmation modal |
| `drizzle/migrations/0008_*.sql` | security_log table |
| `drizzle/migrations/0009_*.sql` | duplicate_pairs table |

---

## Files Modified (Key Changes)

| File | Changes |
|------|---------|
| `src/lib/auth/session.ts` | JWT-based sessions |
| `src/lib/auth/magic-link.ts` | 30min expiry, token cleanup |
| `src/lib/i18n/translations.ts` | Add EN locale to all entries |
| `src/lib/recalculate-flags.ts` | Write to duplicate_pairs, fuzzy matching |
| `src/proxy.ts` | CSP headers, security headers, EN locale detection |
| `src/app/api/auth/magic-link/route.ts` | Rate limiting, Turnstile, CSRF |
| `src/components/map/portugal-map.tsx` | Clustering, custom markers, filters |
| `src/components/layout/locale-switcher.tsx` | Add EN option |
| `src/lib/db/schema.ts` | Add security_log, duplicate_pairs tables |
| All public pages + dashboard pages | i18n EN translations |
