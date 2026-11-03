import type { Level, Track } from "./types";

// RASCUNHO para revisão da equipe — U03 (visualizar trilha) e SP03 (trilha por nível).
// Proposta: as três trilhas usam os mesmos módulos, em ordens diferentes, e
// marcam como revisão opcional o que o nível já domina. Módulos opcionais não
// contam para concluir a trilha nem para liberar a avaliação final (SP12).

export const tracks: Record<Level, Track> = {
  iniciante: {
    level: "iniciante",
    title: "Trilha Iniciante",
    description:
      "Começa pelos conceitos de IA generativa e segue para a prática: prompts, alucinações, verificação e privacidade.",
    steps: [
      { moduleSlug: "introducao-ia-generativa", optional: false },
      { moduleSlug: "estrutura-de-um-bom-prompt", optional: false },
      { moduleSlug: "comparacao-de-prompts", optional: false },
      { moduleSlug: "alucinacoes", optional: false },
      { moduleSlug: "verificar-informacoes", optional: false },
      { moduleSlug: "privacidade-e-dados", optional: false },
    ],
  },
  intermediario: {
    level: "intermediario",
    title: "Trilha Intermediária",
    description:
      "Você já conhece o básico. A introdução fica como revisão e o foco vai para análise crítica, verificação, prompts e privacidade.",
    steps: [
      { moduleSlug: "introducao-ia-generativa", optional: true },
      { moduleSlug: "alucinacoes", optional: false },
      { moduleSlug: "verificar-informacoes", optional: false },
      { moduleSlug: "estrutura-de-um-bom-prompt", optional: false },
      { moduleSlug: "comparacao-de-prompts", optional: false },
      { moduleSlug: "privacidade-e-dados", optional: false },
    ],
  },
  avancado: {
    level: "avancado",
    title: "Trilha Avançada",
    description:
      "Você domina os fundamentos. O foco é checar respostas, comparar prompts e proteger dados; os módulos de base ficam como revisão.",
    steps: [
      { moduleSlug: "alucinacoes", optional: false },
      { moduleSlug: "verificar-informacoes", optional: false },
      { moduleSlug: "comparacao-de-prompts", optional: false },
      { moduleSlug: "privacidade-e-dados", optional: false },
      { moduleSlug: "estrutura-de-um-bom-prompt", optional: true },
      { moduleSlug: "introducao-ia-generativa", optional: true },
    ],
  },
};
