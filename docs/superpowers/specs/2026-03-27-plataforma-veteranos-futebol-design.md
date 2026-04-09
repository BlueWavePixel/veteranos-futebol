# Plataforma Veteranos Futebol — Design Spec

## Contexto

Existe atualmente um grupo de WhatsApp com ~314 equipas de veteranos de futebol (nacionais, ilhas e internacionais). Cada equipa tem um coordenador responsável. Os dados são geridos através de:

- **Google Forms** para adesão de novas equipas
- **Google Sheets/Excel** para armazenamento (16 campos por equipa)
- **Google Drive** para logotipos
- **WhatsApp** para comunicação entre moderadores e coordenadores

### Problemas atuais

- Coordenadores perdem acesso ao formulário (mudam de email, não guardam link)
- Mudança de coordenador exige intervenção manual dos moderadores
- Dados de contacto visíveis a qualquer pessoa com o link (problema RGPD)
- Sem pesquisa ou filtros — Excel com 314 linhas
- Logotipos separados dos dados
- Sem mapa ou visualização geográfica

### Moderadores atuais

- Carlos Pereira
- Filipe Neves
- Pedro Estanislau (Super Admin)

## Objetivo

Substituir o sistema atual por uma plataforma web única que:

1. Permita registo e edição autónoma por cada coordenador
2. Proteja dados de contacto (visíveis apenas para equipas registadas)
3. Ofereça pesquisa, filtros e mapa interativo
4. Dê aos moderadores ferramentas para gerir equipas e transferir coordenadores
5. Cumpra o RGPD
6. Custo zero de operação

## Stack Técnico

| Camada | Tecnologia | Justificação |
|--------|-----------|-------------|
| Frontend + Backend | Next.js 16 (App Router) | Full-stack, SSR, grátis no Vercel |
| Base de Dados | Neon Postgres (Vercel Marketplace) | Grátis até 0.5GB, serverless |
| Hosting | Vercel (conta Google dos Veteranos) | Grátis, deploy automático |
| Auth Coordenadores | Magic links via Resend | Sem passwords, 3000 emails/mês grátis |
| Auth Moderadores | Login Google (conta veteranos) | Simples, sem custos |
| Logotipos | Google Drive (links existentes) | Sem migração necessária |
| Mapa | Leaflet + OpenStreetMap | Grátis, sem API key |
| UI | shadcn/ui + Tailwind CSS | Design system consistente |

## Hierarquia de Roles

```
Super Admin (Pedro Estanislau)
├── Tudo o que moderadores podem fazer
├── Adicionar/remover moderadores
└── Login Google com email fixo (conta dos Veteranos)

Moderadores (Carlos Pereira, Filipe Neves, e futuros)
├── Gerir equipas (editar, transferir coordenador, desativar)
├── Ver estatísticas
└── NÃO podem gerir outros moderadores

Coordenadores (1 por equipa, ~314 atualmente)
├── Editar dados da própria equipa
├── Transferir equipa para novo coordenador
└── Ver contactos de todas as equipas

Visitante (sem login)
├── Ver listagem, mapa, páginas de equipa
└── SEM contactos visíveis
```

## Modelo de Dados

### Tabela: teams

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid (PK) | Identificador único |
| slug | text (unique) | URL-friendly do nome da equipa |
| name | text (not null) | Nome da equipa |
| logo_url | text | Link para logotipo no Google Drive |
| coordinator_name | text (not null) | Nome do responsável atual |
| coordinator_alt_name | text | Nome do responsável alternativo |
| coordinator_email | text (not null) | Email do coordenador (usado para magic link). NÃO é unique — um coordenador pode gerir múltiplas equipas (16 casos atuais). |
| coordinator_phone | text | Contacto telefónico atual |
| coordinator_alt_phone | text | Contacto telefónico alternativo |
| dinner_third_party | boolean | Disponibilidade para jantar (3ª parte) |
| kit_primary | text | Cores do equipamento principal |
| kit_secondary | text | Cores do equipamento alternativo |
| field_name | text | Nome do campo |
| field_address | text | Morada do campo |
| location | text | Concelho/Distrito |
| maps_url | text | Link Google Maps |
| latitude | decimal | Latitude (extraída do maps_url) |
| longitude | decimal | Longitude (extraída do maps_url) |
| notes | text | Observações |
| rgpd_consent | boolean (not null) | Consentimento RGPD dado |
| rgpd_consent_at | timestamp | Data/hora do consentimento |
| is_active | boolean (default true) | Equipa ativa |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Última atualização |

### Tabela: admins

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid (PK) | Identificador único |
| email | text (not null, unique) | Email Google do moderador |
| name | text (not null) | Nome |
| role | enum ('super_admin', 'moderator') | Nível de acesso |
| created_at | timestamp | Data de criação |

### Tabela: auth_tokens

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid (PK) | Identificador único |
| team_id | uuid (FK → teams) | Equipa associada |
| token_hash | text (not null) | Hash SHA-256 do token |
| expires_at | timestamp (not null) | Expiração (24h) |
| used_at | timestamp | Quando foi usado |

### Tabela: audit_log

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid (PK) | Identificador único |
| actor_type | enum ('coordinator', 'moderator', 'super_admin') | Quem fez a ação |
| actor_email | text | Email de quem fez |
| action | text | Ação realizada (ex: 'team_updated', 'coordinator_transferred') |
| team_id | uuid (FK → teams) | Equipa afetada |
| details | jsonb | Detalhes da alteração |
| created_at | timestamp | Data/hora da ação |

## Páginas e Rotas

### Públicas

| Rota | Descrição |
|------|-----------|
| `/` | Homepage com mapa de Portugal, pesquisa, contadores, CTAs |
| `/equipas` | Listagem de equipas com filtros (distrito, concelho, pesquisa) |
| `/equipas/[slug]` | Página individual da equipa (contactos ocultos sem login) |
| `/registar` | Formulário de registo de nova equipa |
| `/login` | Página de acesso coordenador (pede email → envia magic link) |
| `/privacidade` | Política de privacidade RGPD |
| `/auth/verify` | Verificação do magic link |

### Autenticadas (Coordenador)

> **Nota:** Um coordenador pode gerir múltiplas equipas (16 casos atuais). O dashboard lista todas as equipas associadas ao email autenticado.

| Rota | Descrição |
|------|-----------|
| `/dashboard` | Lista das equipas do coordenador (se só 1, redireciona direto para edição) |
| `/dashboard/transferir` | Transferir equipa para novo coordenador |
| `/dashboard/eliminar` | Eliminar equipa e dados (RGPD) |

### Administração

| Rota | Descrição |
|------|-----------|
| `/admin` | Dashboard com estatísticas e lista de equipas |
| `/admin/equipas/[id]` | Editar qualquer equipa |
| `/admin/transferir/[id]` | Transferir coordenador de qualquer equipa |
| `/admin/moderadores` | Gerir moderadores (Super Admin apenas) |
| `/admin/importar` | Importar dados do Excel (uso inicial) |
| `/admin/login` | Login Google para moderadores |

## Fluxos Principais

### 1. Registo de Nova Equipa

```
Visitante acede a /registar
→ Preenche formulário (16 campos + email + checkbox RGPD)
→ Submete
→ Recebe magic link por email
→ Clica no link → equipa fica ativa e visível
→ Coordenador fica autenticado (sessão cookie, 30 dias)
```

### 2. Edição de Dados (Coordenador)

```
Coordenador acede a /login
→ Insere email → recebe magic link
→ Clica → sessão autenticada → /dashboard
→ Edita campos → guarda
→ Alteração registada no audit_log
```

### 3. Transferência de Coordenador (pelo próprio)

```
Coordenador acede a /dashboard/transferir
→ Insere email do novo coordenador
→ Novo recebe magic link de confirmação
→ Clica → torna-se coordenador oficial
→ Antigo perde acesso de edição
→ Ação registada no audit_log
```

### 4. Transferência de Coordenador (por moderador)

```
Moderador acede a /admin/transferir/[id]
→ Insere novo email
→ Novo coordenador recebe magic link
→ Clica → acesso transferido
→ Ação registada no audit_log
```

### 5. Consulta de Equipas (Registado vs Visitante)

```
Registado: vê tudo incluindo contactos (telefone, email)
Visitante: vê tudo EXCETO contactos → mensagem "Regista a tua equipa para ver contactos"
```

## RGPD

### Medidas implementadas

1. **Consentimento explícito** — Checkbox obrigatório no registo com texto claro sobre finalidade e partilha de dados
2. **Finalidade definida** — Dados recolhidos exclusivamente para facilitar contacto entre equipas de veteranos para marcação de jogos
3. **Minimização** — Apenas dados necessários para a finalidade
4. **Proteção de contactos** — Telefone e email só visíveis para equipas registadas (acesso condicionado)
5. **Direito de acesso** — Coordenador vê todos os seus dados no dashboard
6. **Direito de retificação** — Coordenador pode editar dados a qualquer momento
7. **Direito ao apagamento** — Coordenador pode eliminar a equipa e todos os dados
8. **Responsável** — Pedro Estanislau (Super Admin) como ponto de contacto
9. **Política de privacidade** — Página pública em `/privacidade` com toda a informação obrigatória
10. **Audit log** — Registo de todas as alterações a dados pessoais

### Texto de consentimento (registo)

> "Ao submeter este formulário, consinto que os meus dados pessoais (nome, email, telefone) sejam armazenados e partilhados com outras equipas de veteranos registadas na plataforma, com a finalidade exclusiva de facilitar o contacto para marcação de jogos. Posso a qualquer momento editar ou eliminar os meus dados. Consulte a nossa [Política de Privacidade](/privacidade)."

## Design Visual

- **Tema**: Dark mode com tons de verde (futebol/relva)
- **Font**: Geist Sans (interface) + Geist Mono (dados técnicos)
- **UI**: shadcn/ui + Tailwind CSS
- **Mobile-first**: Maioria dos acessos via telemóvel (link WhatsApp)
- **Mapa**: Leaflet + OpenStreetMap, pins verdes para cada equipa
- **Cards de equipa**: Logotipo, nome, localização, cores dos equipamentos (faixas coloridas visuais)
- **Página de equipa**: Header com logotipo grande, secções claras, mapa embebido do campo

## Importação Inicial

Script de importação one-time que:

1. Lê o ficheiro Excel (`Contactos dos Clubes Veteranos (Respostas) (1).xlsx`)
2. Mapeia as 16 colunas para o modelo de dados
3. Gera slugs únicos a partir dos nomes das equipas
4. Extrai latitude/longitude dos links Google Maps (quando disponíveis)
5. Marca `rgpd_consent = false` para equipas importadas (precisam re-confirmar)
6. Trata a equipa duplicada ("Associação Antigos Atletas Cabeceirenses" — 2 entradas)
7. Importa para Neon Postgres

### Decisão RGPD para dados importados

Equipas importadas do Excel ficam com `rgpd_consent = false`. Na primeira vez que o coordenador acede via magic link, é apresentado o consentimento RGPD para aceitar. Até lá, os dados ficam visíveis mas com uma flag de "pendente consentimento" no admin.

## Fora de Âmbito (v1)

- Sistema de mensagens entre equipas
- Calendário de jogos
- Resultados/classificações
- App mobile nativa
- Notificações push
- Migração de logotipos do Google Drive para Vercel Blob
- Domínio personalizado (pode ser adicionado depois)
- Multi-idioma (apenas Português)
