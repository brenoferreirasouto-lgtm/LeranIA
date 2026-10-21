# Segurança e privacidade — o que o sistema faz

Revisão da Fase F (20/10/2026). Cada item tem código e, quando possível, teste automatizado. O que ainda falta está em "Limitações conhecidas".

## Contas e acesso

| Proteção | Onde | Teste |
|---|---|---|
| Senhas com hash (Better Auth), entre 8 e 128 caracteres | `src/lib/auth.ts` | `tests/e2e/auth.spec.ts` |
| Um único caminho de cadastro (sem rota `/api/auth` exposta), com aceite dos termos e declaração de idade mínima | `src/app/(auth)/actions.ts` | `tests/e2e/auth.spec.ts`, `tests/e2e/account.spec.ts` |
| Limite de tentativas: login por e-mail e por IP, cadastro por IP, exclusão da conta por pessoa; no banco só fica o hash da chave | `src/lib/rate-limit.ts` | `tests/integration/rate-limit.test.ts` |
| Mesma mensagem para e-mail inexistente e senha errada | `src/app/(auth)/actions.ts` | `tests/e2e/auth.spec.ts` |
| Destino depois do login só dentro do site, conferido com o parser de URL do navegador (corrigido na Fase F: `/<TAB>/site.com` escapava) | `safeRedirectPath` em `src/lib/validation/auth.ts` | `src/lib/validation/auth.test.ts`, `tests/e2e/auth.spec.ts` |
| Toda página e ação confere a sessão de novo no servidor | `requireUser` em `src/lib/session.ts` | testes de sistema de cada área |
| Dados de outra pessoa respondem "não encontrado" (tentativas, missões, projetos) | `src/server/*.ts` | `tests/integration/*.test.ts`, `tests/e2e/lab.spec.ts` |

## Navegador

| Proteção | Onde | Teste |
|---|---|---|
| Content Security Policy com nonce por requisição: scripts e estilos só do próprio site, sem `eval` em produção, sem objetos, sem iframe de outros sites, formulários só para o próprio site | `src/proxy.ts`, `src/lib/csp.ts` | `src/lib/csp.test.ts`, `tests/e2e/security.spec.ts` |
| O zod roda sem `new Function` (modo "jitless"); uma regra do ESLint impede importá-lo por fora de `src/lib/zod.ts` | `src/lib/zod.ts`, `eslint.config.mjs` | `tests/e2e/security.spec.ts` (nenhuma violação da CSP) |
| `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS e sem `X-Powered-By` | `next.config.ts` | `tests/e2e/security.spec.ts` |
| Gabaritos nunca chegam ao navegador: questões e passos de missão vão sem a resposta certa nem a explicação, e a correção é feita no servidor | `src/server/content.ts`, `toPublicStep` em `src/server/missions.ts`, regra do ESLint | `src/server/content.test.ts` |
| Links das referências do Laboratório só com `http://` ou `https://` (bloqueia `javascript:`) | `referenceSchema` em `src/lib/projects.ts` | `src/lib/projects.test.ts` |
| Páginas de erro e 404 sem detalhes técnicos | `src/app/error.tsx`, `src/app/not-found.tsx` | `tests/e2e/security.spec.ts` |

## Dados pessoais (LGPD)

- Idade mínima de 13 anos declarada no cadastro; só a data da declaração é guardada, nunca a data de nascimento (ADR 0002).
- Download dos próprios dados em JSON e exclusão da conta com a senha; a exclusão apaga tudo em cascata, inclusive os projetos.
- O construtor de prompt não grava o texto; a missão do construtor guarda só o resultado.
- Os campos do Laboratório avisam quando o texto parece ter e-mail, telefone, CPF, cartão ou senha. O histórico dos projetos guarda o tipo da mudança, nunca o texto, e mantém as 200 mais recentes.
- Logs de erro do Laboratório registram o tipo do erro e o código do banco, nunca a mensagem.
- Sem rastreamento de terceiros, publicidade ou ranking.

## Dependências

`npm audit` em 20/10/2026, depois da revisão:

| Pacote | Gravidade | Situação |
|---|---|---|
| `esbuild` antigo dentro do `drizzle-kit` (GHSA-67mh-4wv8-2f99) | moderada | **Corrigido** com `overrides` para a versão 0.25; as migrações foram testadas. Só afetava o servidor de desenvolvimento do esbuild, que o projeto não usa. |
| `braces` dentro do plugin do ESLint (GHSA-vfj7-8cjw-p6xm; o `npm audit` mostra "5 high" porque conta cada pacote da cadeia: `braces`, `micromatch`, `fast-glob`, `@next/eslint-plugin-next` e `eslint-config-next`) | alta | **Sem versão corrigida publicada.** Fica só na ferramenta de lint, que lê padrões de arquivo do próprio projeto; não vai para produção nem recebe entrada de usuários. Atualizar quando sair a correção. |

## Limitações conhecidas

- **IP do limite de tentativas:** vem do primeiro valor de `X-Forwarded-For`. Na Vercel esse cabeçalho é definido pela própria plataforma; atrás de outro proxy, confira se ele substitui o valor enviado pelo navegador, ou o limite por IP pode ser contornado (o limite por e-mail continua valendo).
- **Tabela `rate_limits`:** guarda uma linha por chave e não é limpa sozinha. Em produção, uma tarefa diária pode apagar as linhas com `window_start` de mais de um dia.
- **Recuperação de senha:** não existe; depende de um serviço de e-mail.
- **Pedidos de correção de dados:** falta um canal de contato (a pessoa já consegue baixar e excluir os dados sozinha).
- **Revisão jurídica** da página de privacidade ainda não foi feita.
