@AGENTS.md

# Veteranos Futebol — Project Guide

## Overview

Platform for managing ~315 veteran football team contacts in Portugal. Replaces Google Forms + Excel + WhatsApp with a web app featuring team directory, interactive map, role-based access, and RGPD compliance.

**URL:** https://veteranos-futebol.vercel.app
**Repo:** github.com/BlueWavePixel/veteranos-futebol (public)

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components by default)
- **Database:** Neon Postgres via Drizzle ORM
- **Auth:** Magic links (coordinators) + JWT sessions + Google OAuth (admins)
- **Hosting:** Vercel (Hobby plan, account: veteranosclubesgeral)
- **Anti-bot:** Cloudflare Turnstile on public forms
- **Map:** Leaflet + react-leaflet + react-leaflet-cluster
- **UI:** shadcn/ui + Tailwind CSS
- **Email:** Nodemailer via Gmail app password
- **Storage:** Vercel Blob (team logos)
- **i18n:** PT-PT (default), PT-BR, ES, EN

## Key Architecture Decisions

- **Server Components by default.** Only add `'use client'` for interactive components (map, forms, search).
- **No ORM magic.** All DB queries use explicit Drizzle select/insert/update.
- **Rate limiter is in-memory.** Works partially with Fluid Compute. Turnstile is the main anti-abuse layer.
- **Images:** Use `next/image` with `remotePatterns` for external URLs. Exception: Leaflet popups (DOM outside React) and blob URL previews use `<img>` with eslint-disable.
- **Duplicate detection:** Fuzzy matching (Levenshtein), phone normalization, geographic proximity (Haversine). Admin panel for manual merge.

## Directory Structure

```
src/
  app/           # Next.js App Router pages
    admin/       # Admin dashboard (moderators, suggestions, duplicates)
    dashboard/   # Coordinator dashboard (edit team, matches)
    equipas/     # Public team listing and detail pages
    api/auth/    # Magic link, email change, verify endpoints
  components/
    map/         # Leaflet map, location picker, rich popup
    teams/       # Team card, form, image upload, match calendar
    layout/      # Header, footer, mobile nav, locale switcher
    ui/          # shadcn/ui components
  lib/
    auth/        # Session JWT, magic links, callback tokens
    db/          # Drizzle schema, connection
    email/       # Send magic link, notifications
    i18n/        # Translations, locale detection
    security/    # Rate limiter, CSRF, Turnstile, audit logging, headers
    geo.ts       # Coordinate extraction from Google Maps URLs
  scripts/       # One-off data scripts (import, geocode, cleanup)
docs/
  audits/        # Security and code audit reports
  data-original/ # Original Excel files from Google Forms
  superpowers/   # Implementation plans and design specs
```

## Roles

- **Super Admin** (Pedro Estanislau): full access, manage moderators
- **Moderators** (Carlos Pereira, Filipe Neves): manage teams, merge duplicates, reply to suggestions
- **Coordinators**: edit own team, manage matches, request transfers

## Environment Variables

See `.env.example` for all required variables. Key ones:
- `DATABASE_URL` — Neon Postgres connection string
- `AUTH_SECRET` — JWT signing secret (required, no fallback)
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` — Email sending
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` — Anti-bot

## Common Commands

```bash
npm run dev          # Dev server
npx next build       # Production build
npx vitest run       # Run tests (59 tests)
npx eslint .         # Lint
npx drizzle-kit push # Push schema to DB
npx tsx src/scripts/geocode-missing.ts  # Geocode teams without coordinates
```

## Security Notes

- Security score: 18/20 (see docs/audits/)
- All security headers configured in src/lib/security/headers.ts
- CSP allows `unsafe-inline` (required for Next.js + Leaflet)
- xlsx package has known vulnerabilities but is only used in import scripts, not production
