/*
 * Tipos do conteúdo educacional. O conteúdo fica versionado no repositório
 * (src/content) e é revisado por pull request; o banco guarda só o que cada
 * pessoa fez (respostas, tentativas e progresso), referenciando os ids daqui.
 *
 * Regra: um id publicado nunca muda nem é reaproveitado, porque respostas
 * antigas apontam para ele. Para trocar uma questão, crie outra com id novo.
 */

export type Level = "iniciante" | "intermediario" | "avancado";

/** Habilidades usadas para agrupar resultados e recomendar revisão. */
export type Skill = "conceitos" | "alucinacoes" | "verificacao" | "prompts" | "privacidade";

export type Option = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  skill: Skill;
  /** Situação apresentada antes da pergunta (opcional). */
  scenario?: string;
  /** Trecho de prompt ou resposta de IA mostrado em fonte monoespaçada (opcional). */
  sample?: { label: string; text: string };
  prompt: string;
  options: Option[];
  /** "prompt": as alternativas são prompts inteiros (SP07), mostradas em fonte monoespaçada. */
  optionStyle?: "prompt";
  correctOptionId: string;
  /** Explicação mostrada depois da resposta (SP13). */
  explanation: string;
};

export type LessonBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "example"; label: string; text: string; verdict?: "bom" | "ruim" }
  | { type: "tip"; title: string; text: string }
  /** Lista de passos para conferir (SP08). */
  | { type: "checklist"; title: string; items: string[] };

export type LessonSection = {
  heading: string;
  blocks: LessonBlock[];
};

export type Module = {
  slug: string;
  /** História de usuário de origem (IDs SP/U do backlog). */
  storyIds: string[];
  title: string;
  summary: string;
  skill: Skill;
  estimatedMinutes: number;
  lesson: LessonSection[];
  practice: Question[];
  /** Ferramenta da plataforma para praticar o tema (ex.: construtor de prompt). */
  relatedTool?: { href: string; label: string; description: string };
};

/** SP12 — avaliação ao final de uma etapa (hoje, a trilha). */
export type Assessment = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
};

export type TrackStep = {
  moduleSlug: string;
  /** Opcional = revisão recomendada, mas não conta para concluir a trilha. */
  optional: boolean;
};

export type Track = {
  level: Level;
  title: string;
  description: string;
  steps: TrackStep[];
};

export const LEVEL_LABEL: Record<Level, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export const SKILL_LABEL: Record<Skill, string> = {
  conceitos: "Conceitos de IA generativa",
  alucinacoes: "Identificar alucinações",
  verificacao: "Verificar informações",
  prompts: "Escrever prompts",
  privacidade: "Privacidade e dados",
};

/** Tema em letra minúscula, para usar no meio de frases ("você acertou 1 de 2 sobre …"). */
export const SKILL_TOPIC: Record<Skill, string> = {
  conceitos: "conceitos de IA generativa",
  alucinacoes: "alucinações",
  verificacao: "verificação de informações",
  prompts: "prompts",
  privacidade: "privacidade e dados",
};
