# Learn AI

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

- estudantes universitários;
- estudantes que já utilizam ferramentas de IA generativa;
- pessoas interessadas em aprender boas práticas de utilização de Inteligência Artificial.

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
| **SP1** | Como estudante, quero criar uma conta para acompanhar meu aprendizado. |
| **SP2** | Como estudante, quero fazer login para acessar meu progresso. |
| **SP3** | Como estudante, quero visualizar a trilha de aprendizagem para saber o que estudar. |
| **SP4** | Como estudante, quero acessar uma introdução sobre IA generativa para entender seus conceitos básicos. |
| **SP5** | Como estudante, quero aprender a identificar alucinações de IA para não confiar automaticamente em respostas geradas. |
| **SP6** | Como estudante, quero receber explicações após os exercícios para entender meus erros. |
| **SP7** | Como estudante, quero aprender sobre privacidade ao usar IA para evitar compartilhar dados sensíveis. |
| **SP8** | Como estudante, quero aprender os componentes de um bom prompt para obter melhores respostas. |

## Prioridade P1 — Importantes

| ID | História de Usuário |
|---|---|
| **SP9** | Como estudante, quero montar um prompt usando campos guiados para praticar sua estrutura. |
| **SP10** | Como estudante, quero comparar prompts bons e ruins para reconhecer boas práticas. |
| **SP11** | Como estudante, quero aprender a verificar informações produzidas por IA para reduzir o risco de desinformação. |
| **SP12** | Como estudante, quero realizar um quiz ao final de uma etapa para avaliar o que aprendi. |
| **SP13** | Como estudante, quero visualizar meu progresso para saber quanto da trilha já concluí. |

## Prioridade P2 — Complementares

| ID | História de Usuário |
|---|---|
| **SP14** | Como estudante, quero continuar meus estudos de onde parei para não precisar procurar novamente o conteúdo. |
| **SP15** | Como estudante, quero visualizar meu resultado final e recomendações para entender quais temas preciso revisar. |

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

**Objetivo:** disponibilizar o fluxo inicial de acesso e aprendizagem.

- SP0 — Cadastro de usuário
- SP16 — Menu interativo com todas as funcionalidades
- SP17 — Quiz pré-curso
- SP2 — Plano Plus
- SP01 — Forma de pagamentos variados do plano Plus
- SP3 — Visualizar trilha de aprendizagem
- SP4 — Módulo de introdução sobre IA generativa
- SP5 — Quiz de identificação de alucinações

## Sprint 02

**Objetivo:** ampliar a experiência de aprendizagem com feedback, segurança e prompting.

- SP6 — Sistema de feedback dos exercícios
- SP7 — Quiz de privacidade e dados sensíveis
- SP8 — Módulo de estrutura de um bom prompt
- SP9 — Recursos avançados de IA
- SP10 — Menu de comparação de prompts

## Sprint 03

**Objetivo:** consolidar o aprendizado e permitir acompanhamento de desempenho.

- SP11 — Verificar informações produzidas por IA
- SP12 — Quiz de avaliação do aprendizado
- SP13 — Dashboard de progresso do usuário
- SP14 — Continuar estudo de onde parou
- SP15 — Visualizar resultado final e recomendações
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
[]
[]
