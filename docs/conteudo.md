# Conteúdo educacional — como revisar e editar

> **Situação em 19/10/2026: RASCUNHO.** Todo o conteúdo abaixo foi escrito como primeira versão para a equipe revisar. Nada aqui foi validado por professor ou especialista. Revise antes de apresentar a usuários reais.

## Onde fica

| Arquivo | O que tem | História |
|---|---|---|
| `src/content/placement.ts` | 10 questões do nivelamento e as faixas de nível | SP02, SP03 |
| `src/content/tracks.ts` | As três trilhas (iniciante, intermediário, avançado) | U03, SP03 |
| `src/content/modules/introducao-ia-generativa.ts` | Aula + 5 questões | SP01 |
| `src/content/modules/estrutura-de-um-bom-prompt.ts` | Aula + 5 questões | U08 |
| `src/content/modules/alucinacoes.ts` | Aula + 5 questões em cenários | SP04 |
| `src/content/modules/privacidade-e-dados.ts` | Aula + 5 questões (conteúdo e quiz de privacidade) | U07 |
| `src/content/modules/comparacao-de-prompts.ts` | Aula + 5 pares de prompts | SP07 |
| `src/content/modules/verificar-informacoes.ts` | Aula com roteiro de verificação + 5 questões | SP08 |
| `src/content/assessment.ts` | Avaliação final: 12 questões novas sobre toda a trilha | SP12 |
| `src/content/index.ts` | Lista de módulos e nota mínima da prática | — |
| `src/content/gamification.ts` | Valores de XP, estágios e conquistas | Jornada, Conquistas (cards do Trello) |
| `src/content/missions.ts` | 6 missões: 5 em passos (com dica e explicação) e 1 com o construtor de prompt | Missões e Desafios Práticos (card do Trello) |

O conteúdo é código versionado: toda mudança passa por pull request e pelos testes automáticos (`src/content/content.test.ts`), que recusam ids repetidos, gabarito apontando para alternativa inexistente, questão sem explicação e trilha com módulo que não existe.

## Regras para editar

1. **Nunca mude nem reaproveite o `id` de uma questão já publicada.** As respostas das pessoas ficam gravadas com esse id. Para trocar uma questão, crie outra com id novo e remova a antiga.
2. Toda questão precisa de explicação (aparece depois da resposta, SP13). Diga por que a certa está certa e, quando ajudar, por que a tentadora está errada.
3. No nivelamento, toda questão tem a alternativa **"Ainda não sei"** (conta como erro). Ela existe para desestimular o chute.
4. Exemplos de respostas de IA, citações e estudos usados nas questões são **fictícios** e servem para treinar a verificação. Fatos apresentados como verdadeiros (autores de livros, datas, artigos da LGPD) precisam ser conferidos na revisão.
5. Prompts e respostas de IA aparecem em fonte monoespaçada: use os blocos `example` (aula) e `sample` (questão).

## Lista de revisão

- [x] Os fatos citados foram conferidos em 20/10/2026 (ADR 0002, decisão 7). Tabela abaixo.
- [ ] As fontes indicadas no módulo de verificação continuam valendo (planalto.gov.br, IBGE, Google Acadêmico, SciELO, Portal de Periódicos da CAPES).
- [ ] A linguagem é adequada ao público definido (13 anos ou mais, ADR 0002).
- [ ] Cada questão tem uma única resposta defensável e explicação clara.
- [ ] Nenhum exemplo usa dados reais de pessoas.

### Fatos conferidos em 20/10/2026

| Fato usado no conteúdo | Onde aparece | Fonte |
|---|---|---|
| *O Cortiço* é de Aluísio Azevedo, publicado em 1890 | Alucinações | [Toda Matéria](https://www.todamateria.com.br/o-cortico/) |
| *Vidas Secas* é de Graciliano Ramos, publicado em 1938, sobre uma família de retirantes no sertão | Alucinações | [Toda Matéria](https://www.todamateria.com.br/vidas-secas-de-graciliano-ramos/) |
| *Dom Casmurro* é de Machado de Assis, de 1899 (página de rosto; a Garnier lançou em 1900), narrado por Bento Santiago | Alucinações | [Wikipédia](https://en.wikipedia.org/wiki/Dom_Casmurro) |
| LGPD é a Lei nº 13.709/2018; o art. 5º, II lista os dados sensíveis (origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou organização religiosa, filosófica ou política, saúde, vida sexual, dado genético ou biométrico) | Privacidade | [Planalto](https://planalto.gov.br/ccivil_03/_ato2015-2018/2018/Lei/L13709.htm) |
| Censo 2022: 203.080.756 habitantes | Missão "Checagem de fonte" | [IBGE Educa](https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22005-censo-2022-o-retrato-atualizado-do-brasil.html) |
| Edward Jenner aplicou a primeira vacina, contra a varíola, em 1796 | Missão "Caça às alucinações" | [Conass](https://www.conass.org.br/?p=28714) |
| "Vacina" vem do latim *vaccinus*, de *vacca* (vaca) | Missão "Caça às alucinações" | [Etymonline](https://www.etymonline.com/pt/word/vaccination) |
| A EPE publica o Balanço Energético Nacional | Missão "Trabalho em grupo com IA" | [Cenário Energia](https://cenarioenergia.com.br/2025/07/01/epe-divulga-relatorio-final-do-ben-2025-e-destaca-avanco-das-fontes-renovaveis-no-brasil/) |
| A ANEEL publica dados de geração por fonte (solar em cerca de 23% da capacidade instalada no início de 2026, longe dos "45%" que a missão usa como dado suspeito) | Missão "Trabalho em grupo com IA" | [Movimento Econômico](https://movimentoeconomico.com.br/economia/energia/2026/01/13/aneel-preve-crescimento-de-91-gw-na-matriz-eletrica-brasileira-em-2026/) |

A checagem cobre fatos, não pedagogia: a revisão das questões e explicações continua com a equipe.

## Regras decididas (ADR 0002)

Estes valores foram propostos para o sistema funcionar e viraram regra em 20/10/2026 ([ADR 0002](adr/0002-decisoes-de-produto.md)). Continuam isolados para serem trocados sem mexer no resto do código:

| Regra | Valor | Onde mudar |
|---|---|---|
| Faixas do nivelamento | até 40% iniciante · 41–75% intermediário · acima de 75% avançado (com 10 questões: 0–4, 5–7, 8–10) | `LEVEL_RULES` em `src/content/placement.ts` |
| Nota para concluir a prática do módulo | 70% (4 de 5) | `PRACTICE_PASS_PERCENT` em `src/content/index.ts` |
| Estrutura das trilhas | Os mesmos 6 módulos em ordens diferentes; módulos que o nível já domina viram "revisão opcional" e não contam para concluir | `src/content/tracks.ts` |
| Conclusão do módulo | Aula concluída **e** prática com a nota mínima | `src/server/learning.ts` |
| Refazer | Nivelamento e prática podem ser refeitos à vontade; vale o nivelamento mais recente e a melhor nota da prática | `src/server/learning.ts` |
| Liberação da avaliação final (SP12) | Ao concluir todos os módulos obrigatórios da trilha; "etapa" = a trilha inteira por enquanto | `assessmentUnlocked` em `src/lib/learning/scoring.ts` |
| Aprovação na avaliação final | 70% (pelo menos 9 de 12) | `ASSESSMENT_PASS_PERCENT` em `src/content/assessment.ts` |
| Recomendações (SP11) | Temas abaixo de 70% na avaliação → revisar os módulos do tema; depois, módulos obrigatórios não concluídos; no máximo 4 | `recommend` em `src/lib/learning/scoring.ts` |
| Aproveitamento nas práticas (SP10) | Média das melhores notas dos módulos obrigatórios já praticados | `practiceAverage` em `src/lib/learning/scoring.ts` |

## Gamificação — regras aprovadas em 20/10/2026

A equipe aprovou estas regras no documento "Proposta de gamificação — Learn AI". Todas ficam em `src/content/gamification.ts`:

| Regra | Valor aprovado | Onde mudar |
|---|---|---|
| XP por atividade | Nivelamento 20 (só o primeiro) · aula 10 · prática 10 por acerto na primeira tentativa · módulo concluído 40 · avaliação 10 por acerto na primeira tentativa · aprovação 50 | `XP_RULES` |
| Estágios | 5 estágios, a partir de 0, 60, 180, 330 e 480 XP, com nomes neutros | `STAGES` |
| Conquistas | Ponto de partida, Primeiro módulo, Olho nas alucinações, Checagem certeira, Trilha concluída, Aprovado; na C2, Prompt completo, Dados protegidos e Todas as missões | `achievements` |
| Missões | 6 missões, liberadas ao concluir o módulo que praticam (a integradora, ao concluir a trilha); concluem com 70% dos passos; 30 XP cada e 60 na integradora, só na primeira conclusão; sem missões diárias | `src/content/missions.ts` (`MISSION_PASS_PERCENT` e `xp` de cada missão) |
| Missão do construtor | Confere só a estrutura: os quatro elementos (contexto e formato e restrições com pelo menos 10 caracteres, objetivo com 15) e nenhum dado pessoal; o texto é descartado | `PROMPT_MISSION_MIN` em `src/lib/learning/missions.ts` |
| Dica nas missões | Aberta na Trilha Iniciante, fechada nas outras; usar a dica não reduz o XP | `src/app/(app)/missoes/[missao]/page.tsx` |
| Sem ranking, sem sequência de dias e sem missões diárias | — | — |

**Mapa de habilidades (ADR 0002):** cada tema fica "confirmado" com os módulos concluídos e 70% ou mais nas questões dele em alguma tentativa da avaliação final (o mesmo corte das recomendações). Com os cinco confirmados, vem a conquista "Todas as habilidades". Regras em `src/lib/learning/skills.ts`.

Regras para editar conquistas e missões: nunca mude nem reaproveite o `id` de uma conquista, missão ou passo publicado (as conquistas gravadas apontam para ele). Mudar um valor de XP vale para o que for concedido dali em diante; o XP já gravado não muda.
