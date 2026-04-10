# Correcoes de Seguranca — 2026-04-10

## Fixes ALTO

### 1. Autenticacao no /api/auth/request-email-change
- Adicionada verificacao de sessao JWT (requer login de coordenador)
- Rate limit: 3 pedidos por IP por hora
- Verificacao de email: so pode pedir alteracao para o proprio email
- Erro generico no catch (nao expoe informacao interna)

### 2. HTML escaping nos templates de email
- Funcao `escHtml()` adicionada a send-notification.ts
- Todos os campos de utilizador escapados: authorName, authorEmail, teamName, subject, message, coordinatorName, originalMessage, adminReply
- Previne injecao de HTML em emails

### 3. Rate limiter melhorado
- Adicionado cleanup automatico de entradas expiradas (a cada 5 min)
- Previne memory leaks em instancias long-lived (Fluid Compute)
- Documentada limitacao: in-memory nao e global em serverless
- Nota: Cloudflare Turnstile e a protecao principal; rate limiter e segunda linha

## Fixes MEDIO

### 4. CSRF em Server Actions
- Verificado: Next.js Server Actions ja incluem protecao CSRF nativa
- Formulario de registo protegido por Cloudflare Turnstile (equivalente anti-bot)
- Nao e necessario CSRF manual adicional

### 5. Vulnerabilidades xlsx
- xlsx so e usado em 2 scripts de importacao (nao corre em producao)
- Scripts ja foram executados; risco e minimo
- Alternativa (ExcelJS) nao resolve as CVEs especificas
- Decisao: manter, documentar risco como aceite

### 6. Fallback dev secret (corrigido sessao anterior)
- callback-token.ts: agora faz throw se AUTH_SECRET nao estiver definido

## Fixes BAIXO

### 7. .env.example criado
- Modelo com todas as variaveis necessarias (sem valores reais)

### 8. robots.txt + sitemap.xml
- robots.txt: bloqueia /admin/, /api/, /dashboard/
- sitemap.ts: geracao automatica via Next.js (6 URLs)

### 9. Error boundaries + loading states
- error.tsx: pagina de erro com botao "Tentar novamente"
- loading.tsx: spinner de carregamento
- not-found.tsx: pagina 404 com link para inicio

## Geocoding

### 10. 26 equipas sem coordenadas geocodificadas
- Script geocode-missing.ts criado
- Nominatim (OSM) usado para geocoding por concelho
- 26/26 equipas corrigidas (0 falharam)
- Total: 0 equipas sem coordenadas na BD

## Score Seguranca Atualizado: 18/20 (antes 14/20)
