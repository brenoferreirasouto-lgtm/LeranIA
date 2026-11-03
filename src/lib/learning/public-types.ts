/*
 * Formatos que podem ir para o navegador: questões sem gabarito e o
 * feedback devolvido depois da resposta.
 */
export type PublicOption = { id: string; text: string };

export type PublicQuestion = {
  id: string;
  scenario?: string;
  sample?: { label: string; text: string };
  prompt: string;
  options: PublicOption[];
  optionStyle?: "prompt";
};

export type Feedback = {
  questionId: string;
  optionId: string;
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
};

/** XP e conquistas concedidos agora (Fase C1). */
export type RewardSummary = {
  xp: number;
  achievements: { id: string; title: string }[];
};

export type PracticeOutcome = {
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
  moduleCompleted: boolean;
  rewards: RewardSummary;
};

/* ---------- Missões (Fase C2) ---------- */

/** Passo de missão sem gabarito. A dica pode ir antes da resposta; a explicação, só depois. */
export type PublicMissionStep = {
  id: string;
  scenario?: string;
  sample?: { label: string; text: string };
  prompt: string;
  options: PublicOption[];
  optionStyle?: "prompt";
  multiple: boolean;
  hint: string;
};

export type MissionFeedback = {
  stepId: string;
  optionIds: string[];
  isCorrect: boolean;
  correctOptionIds: string[];
  explanation: string;
};

export type MissionOutcome = {
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
  rewards: RewardSummary;
};

export type PromptMissionResult = {
  passed: boolean;
  problems: string[];
  rewards: RewardSummary;
};
