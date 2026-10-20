# ADR 0002 — Decisões de produto de 20/10/2026

**Situação:** aceita. O PO (Breno) delegou estas decisões em 20/10/2026 ("responda todas as perguntas do jeito que você achar melhor"). A equipe pode rever qualquer uma delas; cada regra está isolada para mudar sem reescrever o resto.

## Contexto

Depois da gamificação (Fase C), havia perguntas em aberto que impediam o Laboratório de Projetos Autorais (Fase D) e decisões antigas que nunca tinham sido validadas.

## Decisões

### Público e dados pessoais

| # | Decisão | Por quê |
|---|---|---|
| 1 | **Idade mínima de 13 anos.** O cadastro pede a declaração "Tenho 13 anos ou mais" e guarda só a data da declaração (`users.age_confirmed_at`), nunca a data de nascimento. Contas sem a declaração confirmam no próximo acesso. | Pela LGPD (art. 14, §1º), o tratamento de dados de crianças (até 12 anos incompletos, pelo ECA) depende do consentimento de um dos pais ou responsável. O público do README (ensino médio, técnico e superior) fica coberto. Para adolescentes, o Enunciado CD/ANPD nº 1/2023 admite as bases legais dos arts. 7º e 11, desde que prevaleça o melhor interesse. |
| 2 | **Privacidade por padrão para adolescentes:** nada é público, não há ranking, publicidade nem rastreamento de terceiros, os dados são os mínimos e a exclusão é feita pela própria pessoa. | Medidas concretas de "melhor interesse" (art. 14 da LGPD). |
| 3 | **Página "Minha conta"** com download dos próprios dados (JSON) e exclusão da conta com a senha, com limite de tentativas. A exclusão apaga tudo em cascata. | Direitos de acesso, portabilidade e eliminação (art. 18 da LGPD), necessários antes de guardar texto livre no Laboratório. |
| 4 | **Página de privacidade reescrita** em linguagem simples, descrevendo só o que o sistema faz. | Art. 14, §6º da LGPD: informações em linguagem clara e adequada ao entendimento. |

### Regras de aprendizagem

| # | Decisão |
|---|---|
| 5 | Ficam como regra as propostas que estavam em validação: faixas do nivelamento (até 40% iniciante, até 75% intermediário), prática com 70%, avaliação final com 70% e liberada ao concluir os módulos obrigatórios, e o critério das recomendações. |
| 6 | **Mapa de habilidades** implementado com o corte de 70% das recomendações, mais a conquista "Todas as habilidades". |
| 7 | Os fatos citados no conteúdo são checados contra fontes e registrados em `docs/conteudo.md`. A revisão pedagógica continua com a equipe. |

### Laboratório de Projetos Autorais (Fase D)

| # | Decisão | Por quê |
|---|---|---|
| 8 | **Versão gratuita sem IA.** Projetos privados com objetivo, público, problema, etapas com tarefas, referências e um registro de uso de IA. | Cumpre o card sem depender de chave de API e reforça a autoria, que é o objetivo do card. |
| 9 | As "sugestões de melhoria" vêm de uma **lista de conferência automática** (regras fixas), sem IA. | Dá retorno útil sem enviar texto a terceiros. |
| 10 | Os campos avisam quando há dados pessoais (mesma detecção do construtor). Limites: 20 projetos por pessoa e tamanho máximo em cada campo. | Minimização de dados e proteção contra abuso. |
| 11 | **Libera ao concluir a primeira missão.** | Ordem do fluxo do Trello: o Laboratório é a etapa 4, depois das missões. |
| 12 | **Conquista "Projeto autoral":** todas as etapas concluídas, pelo menos uma referência marcada como conferida e o registro de uso de IA preenchido (ou "não usei IA neste projeto"). **Projeto não rende XP.** | O XP fica para aprendizagem corrigida pelo servidor; o projeto é autodeclarado. |
| 13 | Três modelos em rascunho: seminário ou trabalho escolar, pesquisa e projeto prático. | Os "modelos de referência" do card. |

### Processo e backlog

| # | Decisão | Por quê |
|---|---|---|
| 14 | **Os PRs não são mesclados por mim.** Continuam empilhados até a revisão da equipe. | A disciplina avalia o trabalho em pares, e quem apresenta precisa conhecer o código. |
| 15 | **O Trello não é alterado por mim.** Os IDs novos ficam no README: SP23 Jornada, SP24 Missões, SP25 Conquistas, SP26 Laboratório. As histórias do Plus, se voltarem, ficam com SP27 a SP33. | Não reaproveitar IDs: os cards arquivados já usaram SP06–SP09B e SP16–SP22. |
| 16 | O backlog da branch `alinha-backlog-com-trello` (IDs SP/U aprovados em 19/10) entra no README. | Já era a priorização oficial. |

### Fora por enquanto

| # | Decisão | Por quê |
|---|---|---|
| 17 | **Plano Plus (Fase E) não começa agora.** Quando começar: plano atribuído manualmente, sem cobrança real; IA só no servidor, com limite diário, registro de uso e aviso antes de enviar texto. | Depende de conta, chave de API e orçamento da equipe, e envolve enviar textos de adolescentes a um serviço de terceiros. |
| 18 | **Publicação:** recomendação de Vercel (Next.js) com Postgres gerenciado; **recuperação de senha:** um serviço de e-mail transacional. O passo a passo fica no README, mas nada é publicado sem conta da equipe. | Exigem contas e credenciais que só a equipe pode criar. |
| 19 | **Prazo da Terceira Entrega:** não é decisão técnica. Cada PR sai apresentável sozinho. | — |

## Consequências

- O cadastro ganha uma caixa de seleção obrigatória.
- Uma coluna nova em `users` (`age_confirmed_at`).
- Rotas novas: `/conta`, `/conta/dados`, `/confirmar-idade`, `/conta-excluida`, e as do Laboratório.
