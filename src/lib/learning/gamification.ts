/*
 * Gamificação (Fase C1) — regras puras, sem banco.
 *
 * A ideia central: XP e conquistas não são somados "na hora" por cada tela.
 * A partir dos fatos já gravados (nivelamento, aulas, práticas, avaliação),
 * `entitledRewards` calcula tudo o que a pessoa tem direito a receber. O
 * servidor grava o que ainda falta com chave única, então repetir o cálculo
 * nunca duplica nada, e o mesmo código serve para quem já usava a plataforma
 * antes da gamificação existir (XP retroativo).
 */
import {
  type Achievement,
  type Level,
  STAGES,
  XP_RULES,
  achievements,
  finalAssessment,
  modules,
  tracks,
} from "@/content";

import type { ModuleProgress } from "./scoring";

export type XpSource = "nivelamento" | "aula" | "pratica" | "modulo" | "avaliacao" | "aprovacao";

export const XP_SOURCES: XpSource[] = ["nivelamento", "aula", "pratica", "modulo", "avaliacao", "aprovacao"];

/** Um pagamento de XP. A chave (pessoa + source + sourceId) é única no banco. */
export type XpEntitlement = {
  source: XpSource;
  /** Slug do módulo, id da avaliação ou "nivelamento". */
  sourceId: string;
  /** Tentativa que gerou o XP, quando houver. */
  attemptId: string | null;
  points: number;
  /** Quando a atividade aconteceu (não quando o XP foi gravado). */
  earnedAt: Date;
};

export type AchievementEntitlement = { achievementId: string; earnedAt: Date };

export type FinishedAttempt = { id: string; correct: number; total: number; at: Date };

/** Tudo o que as regras precisam saber sobre a pessoa, lido do banco. */
export type LearnerFacts = {
  level: Level | null;
  /** Primeiro nivelamento (o XP vem só dele). */
  firstPlacement: { id: string; at: Date } | null;
  progress: ModuleProgress[];
  /** Primeira tentativa finalizada da prática de cada módulo. */
  firstPractices: (FinishedAttempt & { moduleSlug: string })[];
  /** Primeira tentativa da avaliação final. */
  firstAssessment: FinishedAttempt | null;
  /** Primeira tentativa aprovada da avaliação final. */
  firstPassedAssessment: { id: string; at: Date } | null;
};

const knownModules = new Set(modules.map((m) => m.slug));

export function xpEntitlements(facts: LearnerFacts): XpEntitlement[] {
  const result: XpEntitlement[] = [];

  if (facts.firstPlacement) {
    result.push({
      source: "nivelamento",
      sourceId: "nivelamento",
      attemptId: facts.firstPlacement.id,
      points: XP_RULES.placementCompleted,
      earnedAt: facts.firstPlacement.at,
    });
  }

  for (const p of facts.progress) {
    if (!knownModules.has(p.moduleSlug)) continue; // módulo removido do conteúdo
    if (p.lessonCompletedAt) {
      result.push({
        source: "aula",
        sourceId: p.moduleSlug,
        attemptId: null,
        points: XP_RULES.lessonCompleted,
        earnedAt: p.lessonCompletedAt,
      });
    }
    if (p.completedAt) {
      result.push({
        source: "modulo",
        sourceId: p.moduleSlug,
        attemptId: null,
        points: XP_RULES.moduleCompleted,
        earnedAt: p.completedAt,
      });
    }
  }

  for (const attempt of facts.firstPractices) {
    if (!knownModules.has(attempt.moduleSlug)) continue;
    const points = attempt.correct * XP_RULES.practicePerCorrect;
    if (points <= 0) continue; // nenhum acerto na primeira tentativa: nada a pagar
    result.push({
      source: "pratica",
      sourceId: attempt.moduleSlug,
      attemptId: attempt.id,
      points,
      earnedAt: attempt.at,
    });
  }

  if (facts.firstAssessment) {
    const points = facts.firstAssessment.correct * XP_RULES.assessmentPerCorrect;
    if (points > 0) {
      result.push({
        source: "avaliacao",
        sourceId: finalAssessment.id,
        attemptId: facts.firstAssessment.id,
        points,
        earnedAt: facts.firstAssessment.at,
      });
    }
  }

  if (facts.firstPassedAssessment) {
    result.push({
      source: "aprovacao",
      sourceId: finalAssessment.id,
      attemptId: facts.firstPassedAssessment.id,
      points: XP_RULES.assessmentPassed,
      earnedAt: facts.firstPassedAssessment.at,
    });
  }

  return result;
}

function earliest(dates: (Date | null)[]): Date | null {
  const valid = dates.filter((d): d is Date => d instanceof Date);
  if (valid.length === 0) return null;
  return new Date(Math.min(...valid.map((d) => d.getTime())));
}

function latest(dates: Date[]): Date {
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

/** Quando a conquista foi obtida, ou null se ainda não foi. */
export function achievementEarnedAt(achievement: Achievement, facts: LearnerFacts): Date | null {
  const criterion = achievement.criterion;
  switch (criterion.kind) {
    case "placement-done":
      return facts.firstPlacement?.at ?? null;
    case "first-module-completed":
      return earliest(facts.progress.filter((p) => knownModules.has(p.moduleSlug)).map((p) => p.completedAt));
    case "perfect-first-practice": {
      const first = facts.firstPractices.find((a) => a.moduleSlug === criterion.moduleSlug);
      return first && first.total > 0 && first.correct === first.total ? first.at : null;
    }
    case "track-completed": {
      const track = tracks[facts.level ?? "iniciante"];
      const bySlug = new Map(facts.progress.map((p) => [p.moduleSlug, p]));
      const dates = track.steps
        .filter((s) => !s.optional)
        .map((s) => bySlug.get(s.moduleSlug)?.completedAt ?? null);
      if (dates.length === 0 || dates.some((d) => d === null)) return null;
      return latest(dates as Date[]);
    }
    case "assessment-passed":
      return facts.firstPassedAssessment?.at ?? null;
  }
}

export function achievementEntitlements(facts: LearnerFacts): AchievementEntitlement[] {
  return achievements.flatMap((achievement) => {
    const earnedAt = achievementEarnedAt(achievement, facts);
    return earnedAt ? [{ achievementId: achievement.id, earnedAt }] : [];
  });
}

export function entitledRewards(facts: LearnerFacts) {
  return { xp: xpEntitlements(facts), achievements: achievementEntitlements(facts) };
}

/* ---------- Estágios ---------- */

export type StageInfo = {
  xp: number;
  stage: number;
  minXp: number;
  /** Próximo estágio, ou null no último. */
  next: { stage: number; minXp: number } | null;
};

export function stageFor(xp: number): StageInfo {
  const ordered = [...STAGES].sort((a, b) => a.minXp - b.minXp);
  let index = 0;
  for (const [i, s] of ordered.entries()) {
    if (xp >= s.minXp) index = i;
  }
  const current = ordered[index];
  const next = ordered[index + 1] ?? null;
  return { xp, stage: current.stage, minXp: current.minXp, next };
}

/* ---------- Textos ---------- */

function titleOf(slug: string): string {
  return modules.find((m) => m.slug === slug)?.title ?? slug;
}

/** Como cada pagamento de XP aparece no histórico. */
export function xpEventLabel(source: XpSource, sourceId: string): string {
  switch (source) {
    case "nivelamento":
      return "Nivelamento concluído";
    case "aula":
      return `Aula concluída: ${titleOf(sourceId)}`;
    case "pratica":
      return `Prática, primeira tentativa: ${titleOf(sourceId)}`;
    case "modulo":
      return `Módulo concluído: ${titleOf(sourceId)}`;
    case "avaliacao":
      return "Avaliação final, primeira tentativa";
    case "aprovacao":
      return "Aprovação na avaliação final";
  }
}

export function achievementById(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id);
}
