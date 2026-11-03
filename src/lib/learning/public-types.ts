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
