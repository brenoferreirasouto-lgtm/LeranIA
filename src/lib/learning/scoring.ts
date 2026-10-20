/*
 * Regras de pontuação, nível e progresso. Funções puras (sem banco), para
 * serem testadas isoladamente e reaproveitadas pelo servidor e pelo painel.
 */
import {
  LEVEL_RULES,
  type Level,
  PRACTICE_PASS_PERCENT,
  type Skill,
  type Track,
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

export type PlacementResult = {
  correct: number;
  total: number;
  percent: number;
  level: Level;
  bySkill: Partial<Record<Skill, SkillScore>>;
  graded: { questionId: string; optionId: string; isCorrect: boolean }[];
};

export class IncompletePlacementError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Questões sem resposta: ${missing.join(", ")}`);
  }
}

/**
 * SP02 — corrige o nivelamento no servidor. Exige resposta em todas as
 * questões ("Ainda não sei" conta como resposta, e como erro).
 */
export function gradePlacement(answers: Record<string, string | undefined>): PlacementResult {
  const missing = placementQuestions
    .filter((q) => {
      const chosen = answers[q.id];
      return !chosen || !q.options.some((o) => o.id === chosen);
    })
    .map((q) => q.id);
  if (missing.length > 0) throw new IncompletePlacementError(missing);

  const bySkill: Partial<Record<Skill, SkillScore>> = {};
  const graded = placementQuestions.map((q) => {
    const optionId = answers[q.id] as string;
    const isCorrect = optionId === q.correctOptionId;
    const score = (bySkill[q.skill] ??= { correct: 0, total: 0 });
    score.total += 1;
    if (isCorrect) score.correct += 1;
    return { questionId: q.id, optionId, isCorrect };
  });

  const correct = graded.filter((g) => g.isCorrect).length;
  const total = graded.length;
  const percent = percentOf(correct, total);
  return { correct, total, percent, level: levelForPercent(percent), bySkill, graded };
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
