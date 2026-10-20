/*
 * Gamificação (Fase C) — valores aprovados pela equipe em 20/10/2026 no
 * documento "Proposta de gamificação — Learn AI". Mudar um valor aqui muda
 * a regra em todo o sistema; os testes conferem a coerência do catálogo.
 *
 * Princípios: só aprendizagem registrada rende XP; cada atividade paga uma
 * vez; conquistas não dão XP; nada se perde; tudo é privado.
 */

/**
 * XP de cada atividade. Acertos contam só na primeira tentativa finalizada.
 * O XP de cada missão fica na própria missão (src/content/missions.ts).
 */
export const XP_RULES = {
  /** Primeiro nivelamento concluído. Fixo, para não incentivar chute no lugar de "Ainda não sei". */
  placementCompleted: 20,
  /** Aula concluída (uma vez por módulo). */
  lessonCompleted: 10,
  /** Por acerto na primeira tentativa finalizada da prática do módulo. */
  practicePerCorrect: 10,
  /** Módulo concluído (aula + prática com a nota mínima), em qualquer tentativa. */
  moduleCompleted: 40,
  /** Por acerto na primeira tentativa da avaliação final. */
  assessmentPerCorrect: 10,
  /** Primeira aprovação na avaliação final, em qualquer tentativa. */
  assessmentPassed: 50,
} as const;

/** Estágios da jornada: o estágio é o maior cujo limiar a pessoa alcançou. */
export const STAGES: { stage: number; minXp: number }[] = [
  { stage: 1, minXp: 0 },
  { stage: 2, minXp: 60 },
  { stage: 3, minXp: 180 },
  { stage: 4, minXp: 330 },
  { stage: 5, minXp: 480 },
];

/** Como cada conquista é conferida no banco. */
export type AchievementCriterion =
  | { kind: "placement-done" }
  | { kind: "first-module-completed" }
  /** Acertar tudo na primeira tentativa finalizada da prática do módulo. */
  | { kind: "perfect-first-practice"; moduleSlug: string }
  /** Todos os módulos obrigatórios da trilha atual concluídos. */
  | { kind: "track-completed" }
  | { kind: "assessment-passed" }
  /** C2 — concluir uma missão. */
  | { kind: "mission-completed"; missionId: string }
  /** C2 — concluir um módulo e uma missão. */
  | { kind: "module-and-mission"; moduleSlug: string; missionId: string }
  /** C2 — concluir todas as missões do catálogo. */
  | { kind: "all-missions" }
  /** Mapa de habilidades: as cinco confirmadas na avaliação (ADR 0002). */
  | { kind: "all-skills-confirmed" }
  /** Laboratório: um projeto com todas as etapas, referência conferida e uso de IA registrado (ADR 0002). */
  | { kind: "project-authored" };

export type Achievement = {
  /** Nunca mude um id publicado: as conquistas gravadas apontam para ele. */
  id: string;
  title: string;
  /** Critério em palavras, mostrado também enquanto a conquista não foi obtida. */
  description: string;
  criterion: AchievementCriterion;
};

export const achievements: Achievement[] = [
  {
    id: "ponto-de-partida",
    title: "Ponto de partida",
    description: "Concluir o quiz de nivelamento.",
    criterion: { kind: "placement-done" },
  },
  {
    id: "primeiro-modulo",
    title: "Primeiro módulo",
    description: "Concluir um módulo: aula e prática com a nota mínima.",
    criterion: { kind: "first-module-completed" },
  },
  {
    id: "olho-nas-alucinacoes",
    title: "Olho nas alucinações",
    description: "Acertar todas as perguntas da prática de Alucinações na primeira tentativa.",
    criterion: { kind: "perfect-first-practice", moduleSlug: "alucinacoes" },
  },
  {
    id: "checagem-certeira",
    title: "Checagem certeira",
    description: "Acertar todas as perguntas da prática de Verificar informações na primeira tentativa.",
    criterion: { kind: "perfect-first-practice", moduleSlug: "verificar-informacoes" },
  },
  {
    id: "trilha-concluida",
    title: "Trilha concluída",
    description: "Concluir todos os módulos obrigatórios da sua trilha.",
    criterion: { kind: "track-completed" },
  },
  {
    id: "aprovado",
    title: "Aprovado",
    description: "Ser aprovado na avaliação final.",
    criterion: { kind: "assessment-passed" },
  },
  {
    id: "todas-as-habilidades",
    title: "Todas as habilidades",
    description: "Ter as cinco habilidades confirmadas: módulos concluídos e 70% ou mais em cada tema da avaliação final.",
    criterion: { kind: "all-skills-confirmed" },
  },
  {
    id: "prompt-completo",
    title: "Prompt completo",
    description:
      "Concluir a missão \"Monte um prompt completo\": os quatro elementos preenchidos e nenhum dado pessoal.",
    criterion: { kind: "mission-completed", missionId: "monte-um-prompt" },
  },
  {
    id: "dados-protegidos",
    title: "Dados protegidos",
    description: "Concluir o módulo de Privacidade e a missão \"O que não colar no chat\".",
    criterion: { kind: "module-and-mission", moduleSlug: "privacidade-e-dados", missionId: "o-que-nao-colar" },
  },
  {
    id: "todas-as-missoes",
    title: "Todas as missões",
    description: "Concluir as seis missões.",
    criterion: { kind: "all-missions" },
  },
  {
    id: "projeto-autoral",
    title: "Projeto autoral",
    description:
      "No Laboratório, concluir todas as etapas de um projeto, com pelo menos uma referência conferida e o uso de IA registrado (ou \"não usei IA\").",
    criterion: { kind: "project-authored" },
  },
];
