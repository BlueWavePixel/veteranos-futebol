# Auditoria de Seguranca — Veteranos Futebol
**Data:** 2026-04-09
**Score:** 14/20

---

## Nivel 1: Cyber Security (Site em Producao)

| Verificacao | Estado | Detalhe |
|---|---|---|
| HTTPS | PASS | Certificado valido, TLS ativo |
| HTTP to HTTPS redirect | PASS | 308 Permanent Redirect |
| HSTS | PASS | max-age=63072000; includeSubDomains; preload |
| X-Content-Type-Options | PASS | nosniff |
| X-Frame-Options | PASS | DENY |
| Content-Security-Policy | PASS | CSP completa com dominios explicitos |
| Referrer-Policy | PASS | strict-origin-when-cross-origin |
| Permissions-Policy | PASS | camera=(), microphone=(), geolocation=(self), payment=() |
| Ficheiros sensiveis (.env, .git) | PASS | Todos retornam 404 |
| API auth/magic-link (POST only) | PASS | Retorna 405 para GET |
| .env no .gitignore | PASS | .env* e .env*.local excluidos |
| .env nunca commitado | PASS | Historico git limpo |
| npm audit | WARN | 2 high + 7 moderate (todas no xlsx) |
| Hardcoded secrets no codigo | PASS | Nenhuma API key ou password em codigo |
| XSS | PASS | Nenhum uso inseguro de HTML dinamico encontrado |
| SQL injection | PASS | Drizzle ORM com queries parametrizadas |
| robots.txt / sitemap.xml | WARN | Sem robots.txt nem sitemap (404) |

---

## Nivel 2: Data Security (Codigo e Repositorio)

| Verificacao | Estado | Detalhe |
|---|---|---|
| API keys no codigo | PASS | Nenhuma encontrada |
| .env no .gitignore | PASS | .env* excluido |
| .env no git history | PASS | Nunca commitado |
| Dados pessoais em codigo | PASS | Sem NIFs, IBANs, etc. |
| Secrets hardcoded | PASS | Fallback dev secret removido (corrigido 2026-04-09 noite) |
| Cookie security flags | PASS | httpOnly, secure (prod), sameSite=strict |
| Token hashing | PASS | SHA256 hash guardado na DB, nao plaintext |
| Timing-safe comparison | PASS | crypto.timingSafeEqual para CSRF |

---

## Problemas Encontrados

### ALTO (Corrigir)

| # | Problema | Ficheiro | Impacto |
|---|---|---|---|
| 1 | Endpoint /api/auth/request-email-change sem autenticacao | src/app/api/auth/request-email-change/route.ts:5 | Qualquer pessoa pode criar sugestoes de alteracao de email sem estar autenticada. Pode ser usado para spam. |
| 2 | HTML nao escapado nos templates de email | src/lib/email/send-notification.ts:44,49,53 | authorName, subject, message e adminReply sao inseridos diretamente no HTML sem escaping. Possivel injecao de HTML em email. |
| 3 | Rate limiter in-memory ineficaz em serverless | src/lib/security/rate-limiter.ts | Usa Map em memoria. Cada invocacao Vercel e uma instancia nova. O rate limiting nao funciona em producao. |

### MEDIO

| # | Problema | Ficheiro | Impacto |
|---|---|---|---|
| 4 | CSRF ausente no registo | src/app/registar/page.tsx:20 | Formulario publico sem token CSRF. |
| 5 | CSRF ausente em acoes admin | src/app/admin/sugestoes/page.tsx, src/app/admin/equipas/[id]/page.tsx | Server actions de admin sem validacao CSRF. |
| ~~6~~ | ~~Fallback secret hardcoded~~ | ~~src/lib/auth/callback-token.ts~~ | **CORRIGIDO** — Agora faz throw se AUTH_SECRET nao estiver definido. |
| 7 | CSP permite inline scripts | src/lib/security/headers.ts:15 | Necessario para Next.js e Leaflet, mas enfraquece a CSP. |
| 8 | Vulnerabilidades npm (xlsx) | package.json | 1 high + 4 moderate (apos npm audit fix). xlsx sem fix. Apenas usado em scripts de importacao. |
| 9 | Sessao admin valida 7 dias | src/lib/auth/session.ts | JWT continua valido ate expirar, mas DB e verificada em getAdminSession() o que mitiga parcialmente. |

### BAIXO

| # | Problema | Impacto |
|---|---|---|
| 10 | Sem robots.txt / sitemap.xml | Sem controlo sobre indexacao |
| 11 | Rota /api/calendar/[slug] sem rate limit | Pode ser usada para enumerar slugs |
| 12 | Cron cleanup sem audit log | Sem registo de tokens limpos |

---

## O que esta BEM

- Autenticacao magic link solida: tokens SHA256 hash, 30min expiry, grace period
- JWT sessions: httpOnly, secure, sameSite strict, 7 dias
- CSP robusta com dominios explicitos e object-src none, base-uri self
- HSTS preload ativo
- Cloudflare Turnstile nos formularios publicos (login, registo)
- Audit log e security log para acoes de admin
- Drizzle ORM sem SQL raw: imune a SQL injection
- Upload seguro: whitelist de tipos, limite 5MB, Vercel Blob
- React escapa todo o conteudo de utilizador automaticamente
- Zero secrets no codigo ou git history

---

## Acoes Prioritarias (Para Proxima Sessao)

1. [ALTO] Adicionar autenticacao ao endpoint /api/auth/request-email-change
2. [ALTO] Escapar HTML nos templates de email (send-notification.ts)
3. [ALTO] Migrar rate limiter para Upstash Redis ou similar
4. [MEDIO] Adicionar CSRF ao formulario de registo e acoes admin
5. ~~[MEDIO] Remover fallback secret hardcoded em callback-token.ts~~ **DONE**
6. [MEDIO] Avaliar alternativa ao pacote xlsx (vulnerabilidades sem fix)
