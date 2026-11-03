# Texto pronto para os cards do Trello

O Trello não foi alterado pelo código (ADR 0002, decisão 15). Este arquivo junta o que a equipe precisa para atualizar o board depois de revisar os PRs.

## 1. Onde cada história foi implementada

Os cards só devem ir para "Concluído" depois que o PR correspondente for revisado e mesclado.

| PR | Fase | Histórias |
|---|---|---|
| #1 | A — Fundação | SP15 Cadastro, U02 Login, SP14 (menu básico) |
| #2 | B — Núcleo educacional | SP02 Nivelamento, SP03 Direcionamento por nível, U03 Trilha, SP01 Aula de IA generativa, U08 Estrutura de um bom prompt, SP04 Alucinações, U07 Privacidade e IA, SP13 Feedback, SP05 Continuar de onde parou, SP09 Painel |
| #3 | B — Práticas e avaliação | SP06 Construtor de prompt, SP07 Comparação de prompts, SP08 Verificar informações, SP12 Avaliação final, SP10 Resultado final, SP11 Recomendações, SP14 (menu completo) |
| #4 | C1 — Jornada | SP23 Jornada de Evolução, SP25 Conquistas (primeiras 6) |
| #5 | C2 — Missões | SP24 Missões e Desafios Práticos, SP25 (mais 3 conquistas) |
| #6 | D1 — Conta e privacidade | Sem card: idade mínima, "Minha conta" e privacidade (ADR 0002) |
| #7 | D2 — Habilidades | SP23 (mapa de habilidades) e SP25 ("Todas as habilidades") |
| #8 | D3 — Laboratório | SP26 Laboratório de Projetos Autorais |
| #9 | F — Qualidade | Sem card: segurança, demonstração, documentação |

## 2. Cards novos ou renomeados (padrão 3Cs)

Os cards de gamificação e do Laboratório já existem no Trello sem ID. Renomeie com o ID e cole o texto abaixo na descrição. É uma proposta de texto, escrita a partir do que foi implementado e do ADR 0002: revisem antes de colar.

### SP23 — Jornada de Evolução do Usuário

**Card:** Como estudante, quero acompanhar minha evolução com XP e estágios para ver o quanto aprendi.

**Conversation:** O XP vem só de aprendizagem corrigida pelo servidor: nivelamento (só o primeiro), aula, acertos na primeira tentativa da prática e da avaliação, módulo concluído, aprovação e missões. São 5 estágios com nomes neutros. A página "Minha jornada" mostra o histórico de XP com a origem de cada ponto e o mapa de habilidades. Sem ranking e sem sequência de dias.

**Confirmation:**

- [ ] Cada atividade rende XP uma única vez, mesmo refeita.
- [ ] Acertos contam só na primeira tentativa da prática e da avaliação.
- [ ] O estágio muda nos valores combinados (0, 60, 180, 330 e 480 XP).
- [ ] O histórico mostra de onde veio cada ponto de XP.
- [ ] O mapa de habilidades mostra o estado de cada tema.
- [ ] Só a própria pessoa vê a sua jornada.

### SP24 — Missões e Desafios Práticos

**Card:** Como estudante, quero cumprir missões práticas para aplicar o que aprendi em situações reais.

**Conversation:** Seis missões: cinco em passos (casos com alternativas, explicação depois de cada resposta e dica) e uma com o construtor de prompt. Cada missão libera ao concluir o módulo que pratica; a integradora, ao concluir a trilha. Na missão do construtor, o texto é conferido e descartado.

**Confirmation:**

- [ ] A missão bloqueada diz o que falta para liberar.
- [ ] Cada passo mostra se acertou e por quê.
- [ ] A missão conclui com 70% dos passos certos.
- [ ] O XP vem só na primeira conclusão.
- [ ] A dica vem aberta na Trilha Iniciante.
- [ ] A missão do construtor recusa dados pessoais.

### SP25 — Conquistas, Medalhas e Reconhecimento

**Card:** Como estudante, quero ganhar conquistas para ver reconhecido o que demonstrei.

**Conversation:** Onze conquistas, cada uma com um critério conferido nos dados gravados (por exemplo, prática perfeita em Alucinações na primeira tentativa, todas as missões, projeto autoral). Conquistas não dão XP.

**Confirmation:**

- [ ] A conquista é concedida uma única vez, com data.
- [ ] As que faltam mostram o critério para obter.
- [ ] Conquistas não rendem XP.
- [ ] A conquista nova aparece logo depois da atividade que a concedeu.

### SP26 — Laboratório de Projetos Autorais

**Card:** Como estudante, quero desenvolver um projeto autoral com etapas guiadas para transformar o que aprendi em algo meu.

**Conversation:** Versão gratuita, sem IA integrada. O projeto parte de um modelo (seminário ou trabalho escolar, pesquisa ou projeto prático) e tem objetivo, público, problema, etapas com tarefas, referências e um registro de uso de IA (ou "não usei IA"). Uma lista de conferência automática aponta o que falta. Os projetos são privados.

**Confirmation:**

- [ ] O Laboratório libera ao concluir a primeira missão.
- [ ] O projeto criado a partir de um modelo já vem com etapas e tarefas sugeridas.
- [ ] A pessoa edita objetivo, público, problema e tarefas.
- [ ] As referências podem ser marcadas como conferidas na fonte.
- [ ] O uso de IA é registrado, ou marcado como não usado.
- [ ] Os campos avisam quando há dados pessoais.
- [ ] Outra pessoa não consegue abrir o projeto.
- [ ] A conquista "Projeto autoral" vem com todas as etapas, uma referência conferida e o uso de IA registrado, sem XP.

## 3. Itens da Terceira Entrega

| Item | Onde está |
|---|---|
| Pelo menos 5 histórias implementadas | 23 histórias nos PRs #1 a #8 (tabela acima e rastreabilidade no README) |
| Testes automatizados | `npm test` e `npm run test:e2e`; a CI roda tudo em cada PR |
| Screencast dos testes | `RECORD_VIDEO=1 npm run test:e2e` grava os vídeos em `test-results/` |
| Apresentação | `docs/roteiro-demonstracao.md` e `npm run db:seed-demo` |
