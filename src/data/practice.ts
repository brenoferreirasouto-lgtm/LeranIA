export type ComparisonOption = "A" | "B"

export type PromptComparisonExercise = {
  id: string
  objective: string
  promptA: string
  promptB: string
  correctOption: ComparisonOption
  explanation: string
  contrast: string
}

export const promptComparisonExercises: PromptComparisonExercise[] = [
  {
    id: "compare-study-plan",
    objective: "Criar um plano curto de revisão para uma prova de biologia.",
    promptA: "Me ajude a estudar para biologia.",
    promptB:
      "Monte um plano de revisão de cinco dias para uma prova de biologia. Considere 30 minutos por dia, combine recuperação ativa e autoavaliação e não invente tópicos que eu não informei.",
    correctOption: "B",
    explanation:
      "O Prompt B define prazo, duração e estratégias de estudo, além de limitar suposições sobre o conteúdo da prova.",
    contrast:
      "O Prompt A informa apenas o tema. A ferramenta precisaria adivinhar o prazo, o tempo disponível e o tipo de ajuda desejado.",
  },
  {
    id: "compare-source-synthesis",
    objective:
      "Sintetizar dois textos para um trabalho sem inventar evidências ou referências.",
    promptA:
      "Compare os dois textos fornecidos, separe convergências e divergências e escreva um parágrafo neutro. Use apenas informações presentes nos textos, sinalize lacunas e não crie citações.",
    promptB:
      "Escreva uma revisão bibliográfica convincente, inclua autores e referências atuais e preencha as lacunas que encontrar nos textos.",
    correctOption: "A",
    explanation:
      "O Prompt A delimita as fontes, pede uma síntese equilibrada e orienta a ferramenta a revelar lacunas em vez de completá-las por suposição.",
    contrast:
      "O Prompt B incentiva a preencher lacunas e adicionar referências sem fornecer fontes. Isso pode produzir citações inexistentes ou afirmações sem suporte.",
  },
  {
    id: "compare-project-update",
    objective:
      "Preparar uma atualização profissional fiel às notas de um projeto.",
    promptA:
      "Escreva um e-mail profissional e otimista sobre o projeto. Diga que todas as etapas foram concluídas e estime uma data para a entrega final.",
    promptB:
      "Transforme as notas abaixo em uma atualização curta para a equipe. Separe itens concluídos, bloqueios e próxima ação. Não invente status ou datas ausentes; sinalize o que precisa ser confirmado. Retorne assunto e tópicos.",
    correctOption: "B",
    explanation:
      "O Prompt B especifica público, formato e critérios de fidelidade e deixa explícito como tratar informações ausentes.",
    contrast:
      "O Prompt A já pressupõe que tudo foi concluído e pede uma data sem evidência. Um texto fluido poderia esconder essas suposições.",
  },
]

export type VerificationCriterion = {
  id: string
  label: string
  isSatisfied: boolean
  explanation: string
}

export const verificationExercise = {
  id: "verify-frequency-claim",
  sourceTitle: "Base didática simulada · coleta de março de 2026",
  sourceContext:
    "Neste conjunto fictício, 40 participantes responderam a uma pesquisa didática. Dezoito disseram usar IA generativa pelo menos uma vez por semana.",
  generatedText:
    "No conjunto de 2026, 18 de 40 participantes (45%) relataram usar IA generativa pelo menos uma vez por semana. Portanto, 45% dos participantes usam IA generativa diariamente.",
  criteria: [
    {
      id: "source",
      label: "O texto identifica a base que sustenta o dado.",
      isSatisfied: true,
      explanation:
        "Sim. O texto aponta o conjunto didático de 2026, que está descrito ao lado para conferência.",
    },
    {
      id: "date",
      label: "A data da coleta está indicada para contextualizar o dado.",
      isSatisfied: true,
      explanation:
        "Sim. A base informa que a coleta simulada ocorreu em março de 2026.",
    },
    {
      id: "calculation",
      label: "A proporção de 18 participantes em um total de 40 é 45%.",
      isSatisfied: true,
      explanation:
        "Sim. 18 dividido por 40 é 0,45, ou 45%.",
    },
    {
      id: "frequency",
      label: "A conclusão de uso diário é sustentada pela informação da base.",
      isSatisfied: false,
      explanation:
        "Não. A base informa uso semanal; ela não mede nem permite concluir uso diário.",
    },
  ] satisfies VerificationCriterion[],
  hallucination:
    "A frase “45% dos participantes usam IA generativa diariamente” é imprecisa. O percentual foi calculado corretamente, mas a frequência mudou de semanal para diária sem evidência. A resposta da IA extrapolou o dado disponível — uma alucinação de interpretação, não um erro de aritmética.",
}
