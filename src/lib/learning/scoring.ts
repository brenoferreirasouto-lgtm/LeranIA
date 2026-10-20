/*
 * Regras de pontuação, nível e progresso. Funções puras (sem banco), para
 * serem testadas isoladamente e reaproveitadas pelo servidor e pelo painel.
 */
import {
  ASSESSMENT_PASS_PERCENT,
  LEVEL_RULES,
  type Level,
  PRACTICE_PASS_PERCENT,
  type Question,
  SKILL_TOPIC,
  type Skill,
  type Track,
  finalAssessment,
  modules,
  placementQuestions,
} from "@/content";

import type { ModuleStatus } from "./status";

export function percentOf(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

/** SP03 — nível a partir do percentual de acertos no nivelamento. */
export function levelForPercent(percent: number): Level {
  const rule = LEVEL_RULES.find((r) => percent <= r.maxPercent);
  return rule?.level ?? "avancado";
}

export type SkillScore = { correct: number; total: number };

export type GradedAnswer = { questionId: string; optionId: string; isCorrect: boolean };

export type QuizResult = {
  correct: number;
  total: number;
  percent: number;
  bySkill: Partial<Record<Skill, SkillScore>>;
  graded: GradedAnswer[];
};

export type PlacementResult = QuizResult & { level: Level };
export type AssessmentResult = QuizResult & { passed: boolean };

export class IncompleteQuizError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Questões sem resposta: ${missing.join(", ")}`);
  }
}

/** Nome mantido para o nivelamento (SP02). */
export { IncompleteQuizError as IncompletePlacementError };

/**
 * Corrige um questionário respondido de uma vez (nivelamento e avaliação).
 * Exige resposta válida em todas as questões; a correção é sempre no servidor.
 */
export function gradeQuestions(
  questions: Question[],
  answers: Record<string, string | undefined>,
): QuizResult {
  const missing = questions
    .filter((q) => {
      const chosen = answers[q.id];
      return !chosen || !q.options.some((o) => o.id === chosen);
    })
    .map((q) => q.id);
  if (missing.length > 0) throw new IncompleteQuizError(missing);

  const bySkill: Partial<Record<Skill, SkillScore>> = {};
  const graded = questions.map((q) => {
    const optionId = answers[q.id] as string;
    const isCorrect = optionId === q.correctOptionId;
    const score = (bySkill[q.skill] ??= { correct: 0, total: 0 });
    score.total += 1;
    if (isCorrect) score.correct += 1;
    return { questionId: q.id, optionId, isCorrect };
  });

  const correct = graded.filter((g) => g.isCorrect).length;
  const total = graded.length;
  return { correct, total, percent: percentOf(correct, total), bySkill, graded };
}

/**
 * SP02 — corrige o nivelamento. "Ainda não sei" conta como resposta, e como erro.
 */
export function gradePlacement(answers: Record<string, string | undefined>): PlacementResult {
  const result = gradeQuestions(placementQuestions, answers);
  return { ...result, level: levelForPercent(result.percent) };
}

/** SP12 — corrige a avaliação final. */
export function gradeAssessment(answers: Record<string, string | undefined>): AssessmentResult {
  const result = gradeQuestions(finalAssessment.questions, answers);
  return { ...result, passed: result.percent >= ASSESSMENT_PASS_PERCENT };
}

/** Recalcula acertos por tema a partir das respostas gravadas. */
export function skillScoresFrom(
  questions: Question[],
  answers: { questionId: string; isCorrect: boolean }[],
): Partial<Record<Skill, SkillScore>> {
  const skillOf = new Map(questions.map((q) => [q.id, q.skill]));
  const bySkill: Partial<Record<Skill, SkillScore>> = {};
  for (const answer of answers) {
    const skill = skillOf.get(answer.questionId);
    if (!skill) continue; // questão removida do conteúdo depois da tentativa
    const score = (bySkill[skill] ??= { correct: 0, total: 0 });
    score.total += 1;
    if (answer.isCorrect) score.correct += 1;
  }
  return bySkill;
}

export function practicePassed(percent: number): boolean {
  return percent >= PRACTICE_PASS_PERCENT;
}

/* ---------- Progresso na trilha (U03, SP05, SP09) ---------- */

export type ModuleProgress = {
  moduleSlug: string;
  lessonCompletedAt: Date | null;
  completedAt: Date | null;
  bestScorePercent: number | null;
  lastStep: "aula" | "pratica" | null;
  lastActivityAt: Date | null;
};

export type { ModuleStatus };

export function moduleStatus(progress: ModuleProgress | undefined): ModuleStatus {
  if (!progress) return "disponivel";
  if (progress.completedAt) return "concluido";
  if (progress.lessonCompletedAt || progress.lastActivityAt) return "em-andamento";
  return "disponivel";
}

export type TrackSummary = {
  steps: { moduleSlug: string; optional: boolean; status: ModuleStatus }[];
  requiredDone: number;
  requiredTotal: number;
  percent: number;
};

export function summarizeTrack(track: Track, progress: ModuleProgress[]): TrackSummary {
  const bySlug = new Map(progress.map((p) => [p.moduleSlug, p]));
  const steps = track.steps.map((step) => ({
    ...step,
    status: moduleStatus(bySlug.get(step.moduleSlug)),
  }));
  const required = steps.filter((s) => !s.optional);
  const requiredDone = required.filter((s) => s.status === "concluido").length;
  return {
    steps,
    requiredDone,
    requiredTotal: required.length,
    percent: percentOf(requiredDone, required.length),
  };
}

export type NextActivity = {
  moduleSlug: string;
  step: "aula" | "pratica";
  /** "continuar": retoma algo iniciado; "comecar": próximo módulo da trilha. */
  kind: "continuar" | "comecar";
};

/**
 * SP05 — para onde o botão "Continuar" leva: a atividade mais recente que
 * não foi concluída; se não houver, o próximo módulo obrigatório da trilha
 * (e depois os opcionais). Retorna null quando tudo foi concluído.
 */
export function nextActivity(track: Track, progress: ModuleProgress[]): NextActivity | null {
  const trackSlugs = new Set(track.steps.map((s) => s.moduleSlug));
  const unfinished = progress
    .filter((p) => trackSlugs.has(p.moduleSlug) && !p.completedAt && p.lastActivityAt)
    .sort((a, b) => (b.lastActivityAt?.getTime() ?? 0) - (a.lastActivityAt?.getTime() ?? 0));

  const latest = unfinished[0];
  if (latest) {
    const step = latest.lessonCompletedAt || latest.lastStep === "pratica" ? "pratica" : "aula";
    return { moduleSlug: latest.moduleSlug, step, kind: "continuar" };
  }

  const done = new Set(progress.filter((p) => p.completedAt).map((p) => p.moduleSlug));
  const ordered = [
    ...track.steps.filter((s) => !s.optional),
    ...track.steps.filter((s) => s.optional),
  ];
  const next = ordered.find((s) => !done.has(s.moduleSlug));
  return next ? { moduleSlug: next.moduleSlug, step: "aula", kind: "comecar" } : null;
}

/* ---------- Avaliação final, resultado e recomendações (SP12, SP10, SP11) ---------- */

/** SP12 — proposta: a avaliação libera quando todos os módulos obrigatórios estão concluídos. */
export function assessmentUnlocked(summary: TrackSummary): boolean {
  return summary.requiredTotal > 0 && summary.requiredDone === summary.requiredTotal;
}

/** SP10 — média das melhores notas nas práticas dos módulos obrigatórios já praticados. */
export function practiceAverage(track: Track, progress: ModuleProgress[]): number | null {
  const required = new Set(track.steps.filter((s) => !s.optional).map((s) => s.moduleSlug));
  const scores = progress
    .filter((p) => required.has(p.moduleSlug) && p.bestScorePercent != null)
    .map((p) => p.bestScorePercent as number);
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export type Recommendation = {
  moduleSlug: string;
  kind: "revisar" | "concluir";
  reason: string;
};

const MAX_RECOMMENDATIONS = 4;

/**
 * SP11 — recomenda conteúdos a partir dos resultados:
 * 1. temas abaixo da nota mínima na avaliação final → revisar os módulos do tema;
 * 2. módulos obrigatórios da trilha ainda não concluídos → concluir.
 */
export function recommend(input: {
  track: Track;
  progress: ModuleProgress[];
  assessmentBySkill: Partial<Record<Skill, SkillScore>> | null;
}): Recommendation[] {
  const { track, progress, assessmentBySkill } = input;
  const skillOf = new Map(modules.map((m) => [m.slug, m.skill]));
  const done = new Set(progress.filter((p) => p.completedAt).map((p) => p.moduleSlug));
  const result: Recommendation[] = [];
  const add = (r: Recommendation) => {
    if (!result.some((x) => x.moduleSlug === r.moduleSlug)) result.push(r);
  };

  if (assessmentBySkill) {
    const weak = (Object.entries(assessmentBySkill) as [Skill, SkillScore][])
      .map(([skill, score]) => ({ skill, score, percent: percentOf(score.correct, score.total) }))
      .filter((w) => w.percent < ASSESSMENT_PASS_PERCENT)
      .sort((a, b) => a.percent - b.percent);
    for (const w of weak) {
      for (const step of track.steps) {
        if (skillOf.get(step.moduleSlug) !== w.skill) continue;
        add({
          moduleSlug: step.moduleSlug,
          kind: "revisar",
          reason: `Na avaliação final, você acertou ${w.score.correct} de ${w.score.total} sobre ${SKILL_TOPIC[w.skill]}.`,
        });
      }
    }
  }

  for (const step of track.steps) {
    if (!step.optional && !done.has(step.moduleSlug)) {
      add({ moduleSlug: step.moduleSlug, kind: "concluir", reason: "Módulo obrigatório da sua trilha ainda não concluído." });
    }
  }

  return result.slice(0, MAX_RECOMMENDATIONS);
}
