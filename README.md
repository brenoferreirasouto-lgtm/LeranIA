# Learn AI
![Learn AI - Nova identidade visual](./learn-ai-nova.png.png)

> Plataforma web educacional para promover o letramento em Inteligência Artificial por meio de conteúdos curtos, situações práticas, exercícios interativos e acompanhamento de progresso.

## Sobre o projeto

O **Learn AI** é um projeto desenvolvido para a disciplina de **Fundamentos de Desenvolvimento de Software (FDS)**.

A proposta é criar uma aplicação web voltada ao **letramento em Inteligência Artificial**, ajudando estudantes a compreender conceitos fundamentais sobre IA generativa e a utilizá-la de maneira mais crítica, segura e eficiente.

O projeto busca abordar temas como:

- funcionamento básico de IAs generativas;
- limitações e alucinações;
- privacidade e compartilhamento de dados;
- construção de prompts;
- verificação de informações;
- boas práticas de uso;
- acompanhamento do aprendizado.

---

## Problema

Ferramentas de Inteligência Artificial generativa estão cada vez mais presentes no cotidiano acadêmico e profissional. Entretanto, muitos usuários utilizam essas ferramentas sem compreender adequadamente suas limitações, riscos e boas práticas.

Entre os principais problemas identificados estão:

- confiar automaticamente em respostas produzidas por IA;
- dificuldade para reconhecer informações incorretas ou inventadas;
- compartilhamento indevido de dados pessoais ou sensíveis;
- dificuldade para formular prompts claros;
- falta de hábito de verificar fontes e informações;
- uso da IA sem compreensão crítica de seus resultados.

---

## Solução

O **Learn AI** será uma plataforma web educacional composta por uma trilha de aprendizagem sobre Inteligência Artificial.

O usuário poderá acessar conteúdos curtos, realizar exercícios e quizzes, receber feedback sobre suas respostas e acompanhar seu progresso ao longo da trilha.

A estrutura inicial da aplicação será:

```text
Usuário
   ↓
Cadastro / Login
   ↓
Trilha de aprendizagem
   ↓
Conteúdos
   ↓
Exercícios e quizzes
   ↓
Feedback
   ↓
Acompanhamento de progresso
```

---

## Objetivo

Promover o letramento em Inteligência Artificial entre estudantes, oferecendo uma experiência de aprendizagem prática que ajude o usuário a:

- compreender conceitos básicos de IA generativa;
- reconhecer limitações e possíveis alucinações;
- utilizar IA de forma mais segura;
- construir prompts mais claros;
- verificar informações produzidas por IA;
- desenvolver uma postura crítica no uso dessas tecnologias.

---

## Público-alvo

O público-alvo inicial do Learn AI é composto por:

Estudantes do ensino médio, técnico e superior, que usam ferramentas de IA para pesquisar, estudar, fazer trabalhos e tirar dúvidas, e aqueles que estão começando nessa jornada, aprendendo assim a utilizá-las de forma mais crítica, segura, eficiente e de forma produtiva.

Esse público geralmente busca respostas rápidas, prefere conteúdos visuais e interativos e pode ter dificuldades para identificar informações falsas, criar bons prompts ou verificar se uma resposta da IA é realmente confiável.

---

## Diferencial

O Learn AI não pretende apenas apresentar conceitos teóricos sobre Inteligência Artificial.

O diferencial da plataforma será utilizar **situações práticas e exercícios interativos**, permitindo que o usuário aprenda enquanto toma decisões relacionadas ao uso real de ferramentas de IA.

Exemplos:

- identificar uma possível alucinação;
- escolher qual informação não deve ser compartilhada com uma IA;
- comparar um prompt ruim com um prompt bem estruturado;
- verificar se uma resposta gerada por IA possui informações confiáveis.

---

## ODS relacionado

O projeto está relacionado principalmente ao:

### ODS 4 — Educação de Qualidade

O Learn AI busca ampliar o acesso a conhecimentos importantes para o uso consciente e responsável de novas tecnologias, contribuindo para o desenvolvimento de competências digitais.

---

# Como rodar o projeto

**Stack:** Next.js 16 + TypeScript, PostgreSQL 16 (Drizzle ORM), Better Auth, Vitest e Playwright. As decisões e os motivos estão em [`docs/adr/0001-stack-e-fundacao.md`](docs/adr/0001-stack-e-fundacao.md).

**Requisitos:** Node.js 22 ou superior e Docker (ou um PostgreSQL 16 instalado na máquina).

```bash
cp .env.example .env      # depois gere um BETTER_AUTH_SECRET (instrução no arquivo)
docker compose up -d      # sobe o PostgreSQL com os bancos learn_ai e learn_ai_test
npm install
npm run db:migrate        # cria as tabelas no banco de desenvolvimento
npm run dev               # http://localhost:3000
```

### Testes

| Comando | O que verifica |
|---|---|
| `npm run lint` | Padrões de código (ESLint) |
| `npm run typecheck` | Tipos do TypeScript |
| `npm test` | Testes de unidade e de integração (usam o banco `learn_ai_test`) |
| `npm run test:e2e` | Testes de sistema no navegador, em tela de computador e de celular, incluindo acessibilidade (WCAG 2.1 AA) |

Antes dos testes, crie as tabelas no banco de teste:

```bash
DATABASE_URL=postgres://learnai:localdev@localhost:5432/learn_ai_test npm run db:migrate
```

Para gravar o **screencast dos testes** pedido na Terceira Entrega: `RECORD_VIDEO=1 npm run test:e2e` (os vídeos ficam em `test-results/`).

O GitHub Actions roda lint, tipos, migrações, testes e build em todo pull request.

---

# Rastreabilidade das histórias

Os IDs seguem o esquema **SP/U** aprovado pelo PO em 19/10/2026 (a seção de backlog acima será atualizada ao mesclar a branch `alinha-backlog-com-trello`). Só entra como "implementada" o que tem código e teste automatizado passando.

| ID | História | Status | Onde está | Testes |
|---|---|---|---|---|
| **SP15** | Cadastro de usuário | Implementada | `src/app/(auth)/cadastro`, `src/app/(auth)/actions.ts`, `src/lib/validation/auth.ts` | `tests/e2e/auth.spec.ts`, `src/lib/validation/auth.test.ts` |
| **U02** | Login | Implementada | `src/app/(auth)/entrar`, `src/app/(auth)/actions.ts`, `src/lib/session.ts`, `src/lib/rate-limit.ts` | `tests/e2e/auth.spec.ts`, `tests/integration/rate-limit.test.ts` |
| **SP02** | Quiz de nivelamento | Implementada (conteúdo em rascunho) | `src/app/(app)/nivelamento`, `src/content/placement.ts`, `src/lib/learning/scoring.ts` | `tests/e2e/learning.spec.ts`, `src/lib/learning/scoring.test.ts`, `tests/integration/learning.test.ts` |
| **SP03** | Direcionamento por nível | Implementada (faixas de nível em validação) | `src/app/(app)/nivelamento/resultado`, `src/content/tracks.ts` | `tests/e2e/learning.spec.ts`, `src/lib/learning/scoring.test.ts` |
| **U03** | Visualizar a trilha de aprendizagem | Implementada | `src/app/(app)/trilha` | `tests/e2e/learning.spec.ts` |
| **SP01** | Aula sobre IA generativa | Implementada (conteúdo em rascunho) | `src/app/(app)/trilha/[modulo]`, `src/content/modules/introducao-ia-generativa.ts` | `tests/e2e/learning.spec.ts` |
| **SP04** | Identificação de alucinações | Implementada (conteúdo em rascunho) | `src/content/modules/alucinacoes.ts` | `tests/e2e/learning.spec.ts`, `tests/integration/learning.test.ts` |
| **U08** | Estrutura de um bom prompt | Implementada (conteúdo em rascunho) | `src/content/modules/estrutura-de-um-bom-prompt.ts` | `src/content/content.test.ts` |
| **U07** | Privacidade e IA (conteúdo + quiz) | Implementada (conteúdo em rascunho) | `src/content/modules/privacidade-e-dados.ts` | `tests/e2e/learning.spec.ts` (acessibilidade), `src/content/content.test.ts` |
| **SP13** | Feedback dos exercícios | Implementada | `src/app/(app)/trilha/[modulo]/pratica`, `src/server/learning.ts` | `tests/e2e/learning.spec.ts`, `tests/integration/learning.test.ts` |
| **SP05** | Continuar de onde parou | Implementada | `src/lib/learning/scoring.ts` (`nextActivity`), `src/components/learning/record-visit.tsx` | `tests/e2e/learning.spec.ts`, `src/lib/learning/scoring.test.ts` |
| **SP09** | Painel de progresso | Implementada com dados reais da trilha | `src/app/(app)/painel` | `tests/e2e/learning.spec.ts` |
| **SP06** | Construtor guiado de prompts | Implementada (tudo no navegador, nada é salvo) | `src/app/(app)/construtor`, `src/lib/prompt-builder.ts` | `tests/e2e/practice-tools.spec.ts`, `src/lib/prompt-builder.test.ts` |
| **SP07** | Comparação de prompts | Implementada (conteúdo em rascunho) | `src/content/modules/comparacao-de-prompts.ts` | `tests/e2e/practice-tools.spec.ts` |
| **SP08** | Verificar informações produzidas por IA | Implementada (conteúdo em rascunho) | `src/content/modules/verificar-informacoes.ts` | `tests/e2e/practice-tools.spec.ts` |
| **SP12** | Quiz de avaliação do aprendizado | Implementada (libera ao fim da trilha; regra em validação) | `src/app/(app)/avaliacao`, `src/server/assessment.ts`, `src/content/assessment.ts` | `tests/e2e/practice-tools.spec.ts`, `tests/integration/assessment.test.ts` |
| **SP10** | Visualizar resultado final | Implementada | `src/app/(app)/resultado` | `tests/e2e/practice-tools.spec.ts`, `tests/integration/assessment.test.ts` |
| **SP11** | Recomendações de aprendizagem | Implementada | `recommend` em `src/lib/learning/scoring.ts`, `src/components/learning/recommendations.tsx` | `src/lib/learning/scoring.test.ts`, `tests/e2e/practice-tools.spec.ts` |
| **SP14** | Menu com todas as funcionalidades | Implementada: menu completo, recolhível no celular | `src/components/nav` | `tests/e2e/navigation-a11y.spec.ts` |
| Card "Jornada de Evolução do Usuário" (sem ID) | XP, estágios e histórico | Implementada (C1). Mapa de habilidades aguarda decisão da equipe | `src/content/gamification.ts`, `src/lib/learning/gamification.ts`, `src/server/rewards.ts`, `src/app/(app)/jornada` | `src/lib/learning/gamification.test.ts`, `tests/integration/rewards.test.ts`, `tests/e2e/journey.spec.ts` |
| Card "Missões e Desafios Práticos" (sem ID) | Missões práticas com XP e feedback | Implementada (C2: 6 missões, conteúdo em rascunho) | `src/content/missions.ts`, `src/lib/learning/missions.ts`, `src/server/missions.ts`, `src/app/(app)/missoes` | `src/lib/learning/missions.test.ts`, `tests/integration/missions.test.ts`, `tests/e2e/missions.spec.ts` |
| Card "Conquistas, Medalhas e Reconhecimento" (sem ID) | Conquistas com critério verificável | Implementada (9 conquistas: 6 na C1 e 3 na C2) | `achievements` em `src/content/gamification.ts`, `src/app/(app)/jornada` | `src/lib/learning/gamification.test.ts`, `tests/integration/rewards.test.ts`, `tests/integration/missions.test.ts`, `tests/e2e/journey.spec.ts` |

O conteúdo das aulas e questões é um **rascunho para revisão da equipe**; como revisar e o que ainda depende de validação está em [`docs/conteudo.md`](docs/conteudo.md).

**Pendências conhecidas:** recuperação de senha (precisa de serviço de e-mail), exclusão da conta pela própria pessoa, decisão sobre público menor de 18 anos, revisão do texto de privacidade (`/privacidade`) e validação das faixas do nivelamento e da nota mínima da prática.

---

# Equipe

| Integrante | Papel principal
|---|---|---|
| Breno Ferreira | Product Owner
| Bruno Rodrigues | Gestão do Processo
| Vinicius Beleza | UX/UI 
| Pedro Freitas | Front-end
| João Fernando | Back-end

---

# Product Backlog

As histórias foram organizadas por prioridade, considerando primeiro as funcionalidades necessárias para formar o fluxo básico da aplicação.

## Prioridade P0 — Essenciais

| ID | História de Usuário |
|---|---|
| **F01** | Como estudante, quero acessar uma introdução sobre IA generativa para entender seus conceitos básicos. |
| **F02** | Como usuário, quero realizar um quiz de nivelamento para descobrir meu nível de conhecimento sobre IA. |
| **F03** | Como usuário, quero ser direcionado para o nível adequado após o quiz para começar o curso com conteúdos compatíveis com meu conhecimento. |
| **F04** | Como estudante, quero aprender a identificar alucinações de IA para não confiar automaticamente em respostas geradas. |
| **F05** | Como estudante, quero continuar meus estudos de onde parei para não precisar procurar novamente o conteúdo. |
| **F06** | Como estudante, quero montar um prompt seguindo etapas guiadas para transformar uma necessidade em uma instrução clara para a IA. |
| **F07** | Como estudante, quero comparar prompts bons e ruins, para entender na prática o que diferencia um prompt eficiente de um mal elaborado. |
| **F08**| Como estudante, quero aprender a verificar informações produzidas por IA para reduzir o risco de desinformação. |

## Prioridade P1 — Importantes

| ID | História de Usuário |
|---|---|
| **F09** | Como estudante, quero visualizar meu progresso para saber quanto da trilha já concluí. |
| **F10** | Como estudante, quero visualizar meu resultado final para saber como foi meu desempenho na trilha de aprendizagem. |
| **F11** | Como estudante, quero receber recomendações de conteúdo com base no meu desempenho para saber quais temas devo revisar ou aprofundar. |
| **F12** | Como estudante, quero realizar um quiz ao final de uma etapa para avaliar o que aprendi. |
| **F13** |Como estudante, quero receber feedback dos exercícios que realizo, para entender meus erros e acertos e evoluir no aprendizado. |

## Prioridade P2 — Complementares

| ID | História de Usuário |
|---|---|
| **F14** | Como usuário, quero ter acesso a um menu interativo com todas as funcionalidades disponíveis no sistema para encontrar e utilizar os recursos de forma fácil e organizada. |
| **F15** | Como estudante, quero criar uma conta para acompanhar meu aprendizado. |

---

# Histórias de Usuário — Padrão 3Cs

Cada história do backlog deve ser detalhada no Board utilizando o padrão **3Cs**:

### Card

Descrição curta da necessidade do usuário.

Exemplo:

> Como estudante, quero aprender a identificar alucinações de IA para não confiar automaticamente em respostas geradas.

### Conversation

Contexto e discussão sobre como a funcionalidade deverá funcionar.

Exemplo:

> O usuário receberá situações nas quais uma IA apresenta informações verdadeiras ou incorretas. O objetivo é desenvolver uma postura crítica diante das respostas geradas por IA.

### Confirmation

Critérios utilizados para confirmar que a história foi atendida.

Exemplo:

- [ ] Um cenário é apresentado ao usuário.
- [ ] O usuário consegue selecionar uma resposta.
- [ ] O sistema informa se a resposta está correta.
- [ ] Uma explicação é exibida após a resposta.

---

# Planejamento inicial das Sprints

A divisão abaixo representa uma proposta inicial e pode ser ajustada durante o refinamento do backlog.

## Sprint 01







https://github.com/user-attachments/assets/953bd2bd-464d-4a12-9507-000aacace13b








**Objetivo:** disponibilizar o fluxo inicial de acesso e aprendizagem.

- [F01 — Aula sobre IA generativa](https://github.com/user-attachments/assets/aa9e6124-0ccd-493a-b2cb-b695dd07f6f6)
- [Diagrama](https://github.com/user-attachments/assets/1aac7498-9816-4600-8dd3-8a29a60ff1e3)

- [F02 — Quiz de nivelamento](https://github.com/user-attachments/assets/1e50f815-dd98-402c-93b5-afaf99c548ee)
- [Diagrama](https://github.com/user-attachments/assets/c9fc1383-c652-404f-96dc-38ed1e09c394)

- [F03 — Direcionamento por nível](https://github.com/user-attachments/assets/8254580e-63a8-4d3d-bb59-9868573075ad)
- [Diagrama](https://github.com/user-attachments/assets/868e2d7f-1d35-497d-9eab-4e2fc91c06f1)

- [F04 — Quiz de identificação de alucinações](https://github.com/user-attachments/assets/345085ca-8678-4a44-9f6a-ba1507e88164)
- [Diagrama](https://github.com/user-attachments/assets/8114fea9-eb4b-44a5-bbfa-b3744f4cd6fd)

- [F05 — Continuar estudo de onde parou](https://github.com/user-attachments/assets/185650e4-09fe-428f-adbb-56e5b1c22524)
- [Diagrama](https://github.com/user-attachments/assets/fcafd75e-07b7-4150-90a7-3529f145d6f8)

- 
## Sprint 02

**Objetivo:** ampliar a experiência de aprendizagem com feedback, segurança e prompting.

- [F06 — Construtor guiado de prompts](https://github.com/user-attachments/assets/c895942a-d7f2-4f07-a66d-1627fe4ef03c)
- [Diagrama](https://github.com/user-attachments/assets/ae1781bc-75af-49e8-8b94-df08b800bd71)

- [F07 — Menu de comparação de prompts](https://github.com/user-attachments/assets/c1f5b762-717c-4c31-a1c9-ea606cd21ea3)
- [Diagrama](https://github.com/user-attachments/assets/d0774560-d611-41cf-94ca-85a3c3bf81b5)

- [F08 — Verificar informações produzidas por IA](https://github.com/user-attachments/assets/7e8871b3-9ee7-487c-bb0d-70b41f044ae1)
- [Diagrama](https://github.com/user-attachments/assets/963c8f34-43a6-412e-b32a-7e445d3b0606)

- [F09 — Dashboard de progresso do usuário](https://github.com/user-attachments/assets/1ccef923-1d78-4261-9552-de1b79099717)
- [Diagrama](https://github.com/user-attachments/assets/7af5c267-f888-4d47-95bb-12b7aab7eabc)

- [F10 — Visualizar resultado final](https://github.com/user-attachments/assets/9a2cf24d-863e-44bc-8694-3f335bdc061f)
- [Diagrama](https://github.com/user-attachments/assets/8b8e696f-e974-4acd-b7e1-98b1dd1c33fe)

- [F11 — Recomendações de aprendizagem](https://github.com/user-attachments/assets/7966e55c-ec8e-4928-b42c-f0a0c2de5c28)
- [Diagrama](https://github.com/user-attachments/assets/da78f460-08cd-4373-9241-cd37279f5ffa)



## Sprint 03

**Objetivo:** consolidar o aprendizado e permitir acompanhamento de desempenho.

- [F12 — Quiz de avaliação do aprendizado](https://github.com/user-attachments/assets/9dcf9bd8-a448-4034-8bb6-a794d4f526de)
- [Diagrama](https://github.com/user-attachments/assets/753a813d-43d6-4e9c-ac8d-1d120cc76be9)

- [F13 — Sistema de feedback dos exercícios](https://github.com/user-attachments/assets/630abe3e-7680-43be-a422-e93514692e83)
- [Diagrama](https://github.com/user-attachments/assets/e2f76ef4-596d-49ea-aa72-568b802739f5)

- [F14 — Menu interativo com todas as funcionalidades](https://github.com/user-attachments/assets/f8d5d7a1-dc2d-498f-908f-4999181201aa)
- [Diagrama](https://github.com/user-attachments/assets/9a49977b-bdff-4900-be4f-1e637f40e040)

- [F15 — Cadastro de usuário](https://github.com/user-attachments/assets/55d5537d-61ce-4f5c-b33e-1c106f11e7f8)
- [Diagrama](https://github.com/user-attachments/assets/29468629-43eb-46ac-bc65-0064480cf32d)

---

---

# Board do projeto

A equipe utiliza um quadro Kanban para organizar o trabalho, priorizar o backlog e acompanhar a evolução das histórias.

**Ferramenta:** Trello

**Link do Board:**  
`https://trello.com/invite/b/6a9622309222e81119bfef2e/ATTIdfe49ca6ba86da893594140a907fd479BF1A75CC/kanban-learn-ai`

### Estrutura do Board

O fluxo de trabalho é organizado em colunas como:

```text
Problema
↓
Solução
↓
Backlog
↓
Histórias / Refinamento
↓
A Fazer
↓
Em andamento
↓
Revisão / Testes
↓
Concluído
```
---
# Roadmap

| Etapa | Objetivo |
|---|---|
| **Entrega 01** | Definição do problema, histórias de usuário, backlog, board e organização do projeto |
| **Entrega 02** | Modelagem, diagramas de atividades e prototipação |
| **Sprint 01** | Implementação das primeiras funcionalidades |
| **Sprint 02** | Evolução da aplicação e ampliação das funcionalidades |
| **Sprint 03** | Consolidação do produto, testes, documentação e deploy |
---
## Learn AI

**Aprender a usar Inteligência Artificial também significa aprender quando questioná-la.**

# Equipe

[https://www.linkedin.com/in/breno-ferreira-souto-b360063a6/]
[www.linkedin.com/in/vinicius-beleza-20101542a]
[https://www.linkedin.com/in/pedro-lustosa-83a629355/]
[https://www.linkedin.com/in/joão-fernando-0a6b023b4?utm_source=share_via&utm_content=profile&utm_medium=member_ios]
[www.linkedin.com/in/bruno-rodrigues-0a9aa43b2]
[]
[]
