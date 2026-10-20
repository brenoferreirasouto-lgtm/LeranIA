# ADR 0001 — Stack e fundação do Learn AI

- **Status:** aceita (19/10/2026)
- **Decisores:** Breno Ferreira (PO); proposta técnica preparada com apoio do Claude
- **Origem:** Fase A do plano de execução definido no diagnóstico do projeto de 19/10/2026

## Contexto

Até 19/10/2026 o repositório tinha só o README e a imagem de identidade visual. Não havia código, testes nem build. O MVP precisa de cadastro, login, progresso salvo por usuário, testes de sistema (Terceira Entrega) e deve crescer para gamificação, Laboratório de Projetos e Plano Plus.

## Decisões

| Tema | Escolha | Por quê |
| --- | --- | --- |
| Framework | **Next.js 16 (App Router) + TypeScript estrito** | Escolha do PO. Front e back no mesmo projeto, um único deploy. |
| Banco | **PostgreSQL 16** | Relacional, com integridade (chaves únicas, FKs) para progresso, tentativas e XP sem duplicação. |
| Acesso ao banco | **Drizzle ORM + drizzle-kit** | Esquema em TypeScript, migrações SQL versionadas em `drizzle/`, sem gerar cliente. |
| Autenticação | **Better Auth** (e-mail e senha) chamado só por Server Actions | Hash de senha (scrypt), sessões no banco, cookie httpOnly. Não montamos `/api/auth`: o único caminho de cadastro passa pela validação e pelo aceite dos termos. |
| Limite de tentativas | Tabela `rate_limits` própria, UPSERT atômico | O limite embutido do Better Auth só vale para a rota HTTP, que não usamos. Guarda só hash de e-mail/IP. |
| Validação | **Zod**, mesmas regras no servidor; atributos HTML espelham no navegador | Validação no cliente e no servidor, mensagens em português. |
| Renderização | `cacheComponents` **desligado** | Quase todas as telas dependem da sessão; o modelo dinâmico tradicional é mais simples para a equipe. Pode ser ligado depois. |
| Estilo | **CSS Modules + tokens em `globals.css`** | Nenhuma dependência extra; tokens derivados da identidade visual. |
| Fontes | Lexend (títulos) + Atkinson Hyperlegible Next e Mono (texto e prompts), auto-hospedadas via `@fontsource-variable` | Famílias desenhadas para legibilidade; build não depende de acesso ao Google Fonts. |
| Testes | **Vitest** (unidade e integração com banco real), **Playwright** (sistema, desktop e celular), **axe** (acessibilidade WCAG 2.1 AA) | Atende a Terceira Entrega (testes de sistema + screencast). |
| CI | GitHub Actions com PostgreSQL de serviço | Lint, tipos, migrações, testes e build em todo PR. |
| IDs das histórias | Esquema **SP/U** da branch `alinha-backlog-com-trello` | Decisão do PO em 19/10/2026. |

## Consequências e limitações conhecidas

- **Recuperação de senha e verificação de e-mail** ainda não existem: dependem de um serviço de envio de e-mail (decisão pendente).
- **Limite por IP** confia no cabeçalho `x-forwarded-for`. Na Vercel ele é definido pela plataforma; em outra hospedagem, conferir se o proxy sobrescreve o valor enviado pelo cliente. O limite por e-mail vale independentemente disso.
- **Público com menores de 18 anos**: decisão pendente. Se confirmado, o cadastro precisa de consentimento de um responsável (LGPD, art. 14).
- A página `/privacidade` é um **rascunho** para revisão da equipe.
- `npm audit` aponta vulnerabilidades moderadas/altas apenas em ferramentas de desenvolvimento (`drizzle-kit` → `esbuild`, `braces`); nenhuma nas dependências de execução. Reavaliar a cada atualização.
