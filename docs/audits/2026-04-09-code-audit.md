# Auditoria de Codigo — Veteranos Futebol
**Data:** 2026-04-09

## Estado Geral: Bom, com pontos corrigidos

Build compila sem erros, estrutura bem organizada, `.env.local` nao esta no git.

---

## Problemas Corrigidos Nesta Sessao

### Testes (5 falhas -> 0)
- **`geo.test.ts`**: Adicionado `async/await` a todos os testes — `extractCoordinates` e async mas os testes nao estavam a aguardar o resultado
- Atualizado o teste de URLs curtas (`goo.gl`) para refletir que a funcao agora consegue resolver estas URLs corretamente

### ESLint (54 erros -> 0)
- **`locale-switcher.tsx`**: Suprimido falso positivo `react-hooks/immutability` (modificar `document.cookie` num click handler e legitimo)
- **`location-picker.tsx`** + **`portugal-map.tsx`**: Substituido `useState` + `useEffect` para `mounted` por `useSyncExternalStore` — evita renders cascata
- **`csrf.ts`**: Substituido `require("crypto")` por import ES module direto
- **`duplicados/page.tsx`**: Removidos imports nao usados (`admins`, `CardHeader`, `CardTitle`, `DuplicatePair`)
- **`sugestoes/page.tsx`**: Removidos `Link`, `admin`, `pending` nao usados
- **`registar/page.tsx`**: Removido import `TurnstileWidget` nao usado
- **`team-card.tsx`**: Removido type `Locale` nao usado
- **`magic-link.ts`**: Removidos `and`, `isNull` nao usados
- **`recalculate-flags.ts`**: Removidos `and`, `or`, `sql`, `haversineDistance`, `Team` nao usados
- **`geo.ts`**: Removida funcao `isGoogleDefault` nao usada
- **`page.tsx`**: Removidos `eslint-disable` desnecessarios
- **`eslint.config.mjs`**: Adicionada regra para relaxar `no-explicit-any` em scripts de manutencao
- **Scripts**: Corrigidos `prefer-const`, variaveis e imports nao usados

---

## Problemas Pendentes (Nao-Criticos)

### Importante — Melhorar
| # | Problema | Recomendacao |
|---|----------|--------------|
| 1 | Rate limiter in-memory | Nao funciona em serverless. Usar Upstash Redis. |
| 2 | Sem `.env.example` | Criar ficheiro modelo sem valores reais. |
| 3 | Imagens com `<img>` em vez de `next/image` | 6 warnings — afeta performance (LCP). |
| 4 | Sem `error.tsx` / `loading.tsx` | Sem error boundaries nem loading states. |
| 5 | Sem `sitemap.xml` / `robots.txt` | Afeta SEO. Next.js 16 suporta geracao automatica. |

### Menor — Nice to have
| # | Problema | Nota |
|---|----------|------|
| 6 | Email via Gmail com app password | Limites diarios (~500/dia). Para escalar, usar Resend ou SES. |
| 7 | Todas as paginas `force-dynamic` | Home page podia usar ISR/cache components. |
| 8 | CLAUDE.md / AGENTS.md quase vazios | Sem documentacao de arquitetura para onboarding. |

---

## Resultado Final (re-auditoria 2026-04-09 noite)
- **Tests:** 59/59 PASS
- **ESLint:** 0 errors, 7 warnings (apenas `<img>` em componentes Leaflet/upload)
- **Build:** OK, todas as rotas registadas
- **Corrigido:** `fieldNameFixed` unused var removida, fallback dev secret eliminado
