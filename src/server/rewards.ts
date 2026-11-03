import "server-only";

import { and, asc, desc, eq, inArray, isNotNull, sql, sum } from "drizzle-orm";

import { ASSESSMENT_PASS_PERCENT, type Achievement, type Skill, achievements, finalAssessment } from "@/content";
import { db } from "@/db";
import {
  assessmentAnswers,
  assessmentAttempts,
  learnerProfiles,
  missionAttempts,
  moduleProgress,
  placementAttempts,
  practiceAttempts,
  userAchievements,
  xpEvents,
} from "@/db/schema";
import {
  type LearnerFacts,
  type StageInfo,
  type XpSource,
  achievementById,
  entitledRewards,
  stageFor,
  xpEventLabel,
} from "@/lib/learning/gamification";
import type { RewardSummary } from "@/lib/learning/public-types";
import { percentOf, skillScoresFrom } from "@/lib/learning/scoring";
import { type SkillMapEntry, skillMap } from "@/lib/learning/skills";
import { authoredAt } from "@/lib/projects";
import { loadProjects } from "@/server/project-snapshots";

/*
 * Gamificação (Fase C1) no banco. `syncRewards` roda dentro da mesma
 * transação que grava a atividade: lê os fatos, calcula o que a pessoa tem
 * direito a receber e grava só o que ainda falta. As chaves únicas fazem o
 * banco recusar um segundo pagamento da mesma atividade.
 */

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = typeof db | Transaction;

async function loadFacts(ex: Executor, userId: string): Promise<LearnerFacts> {
  // Em sequência: dentro de uma transação todas as consultas usam a mesma conexão.
  const profile = await ex
    .select({ level: learnerProfiles.level })
    .from(learnerProfiles)
    .where(eq(learnerProfiles.userId, userId));
  const firstPlacement = await ex
    .select({ id: placementAttempts.id, at: placementAttempts.createdAt })
    .from(placementAttempts)
    .where(eq(placementAttempts.userId, userId))
    .orderBy(asc(placementAttempts.createdAt))
    .limit(1);
  const progress = await ex
    .select({
      moduleSlug: moduleProgress.moduleSlug,
      lessonCompletedAt: moduleProgress.lessonCompletedAt,
      completedAt: moduleProgress.completedAt,
      bestScorePercent: moduleProgress.bestScorePercent,
      lastStep: moduleProgress.lastStep,
      lastActivityAt: moduleProgress.lastActivityAt,
    })
    .from(moduleProgress)
    .where(eq(moduleProgress.userId, userId));
  // Primeira tentativa finalizada de cada módulo (só há uma em aberto por vez,
  // então a ordem de início é a ordem de término).
  const firstPractices = await ex
    .selectDistinctOn([practiceAttempts.moduleSlug], {
      id: practiceAttempts.id,
      moduleSlug: practiceAttempts.moduleSlug,
      correct: practiceAttempts.correct,
      total: practiceAttempts.total,
      at: practiceAttempts.finishedAt,
    })
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.userId, userId), isNotNull(practiceAttempts.finishedAt)))
    .orderBy(practiceAttempts.moduleSlug, asc(practiceAttempts.startedAt));
  const assessmentRows = await ex
    .select({
      id: assessmentAttempts.id,
      correct: assessmentAttempts.correct,
      total: assessmentAttempts.total,
      passed: assessmentAttempts.passed,
      at: assessmentAttempts.createdAt,
    })
    .from(assessmentAttempts)
    .where(and(eq(assessmentAttempts.userId, userId), eq(assessmentAttempts.assessmentId, finalAssessment.id)))
    .orderBy(asc(assessmentAttempts.createdAt));
  // Mapa de habilidades: primeira tentativa da avaliação com 70% ou mais em cada tema.
  const assessmentAnswerRows = assessmentRows.length
    ? await ex
        .select({
          attemptId: assessmentAnswers.attemptId,
          questionId: assessmentAnswers.questionId,
          isCorrect: assessmentAnswers.isCorrect,
        })
        .from(assessmentAnswers)
        .where(inArray(assessmentAnswers.attemptId, assessmentRows.map((a) => a.id)))
    : [];
  const assessmentSkillPasses: { skill: Skill; at: Date }[] = [];
  for (const attempt of assessmentRows) {
    const bySkill = skillScoresFrom(
      finalAssessment.questions,
      assessmentAnswerRows.filter((a) => a.attemptId === attempt.id),
    );
    for (const [skill, score] of Object.entries(bySkill) as [Skill, { correct: number; total: number }][]) {
      if (percentOf(score.correct, score.total) < ASSESSMENT_PASS_PERCENT) continue;
      if (!assessmentSkillPasses.some((p) => p.skill === skill)) assessmentSkillPasses.push({ skill, at: attempt.at });
    }
  }
  // C2 — primeira tentativa concluída (aprovada) de cada missão.
  const missionsCompleted = await ex
    .selectDistinctOn([missionAttempts.missionId], {
      missionId: missionAttempts.missionId,
      attemptId: missionAttempts.id,
      at: missionAttempts.finishedAt,
    })
    .from(missionAttempts)
    .where(and(eq(missionAttempts.userId, userId), eq(missionAttempts.passed, true)))
    .orderBy(missionAttempts.missionId, asc(missionAttempts.finishedAt));

  const firstAssessment = assessmentRows[0] ?? null;
  const firstPassed = assessmentRows.find((a) => a.passed) ?? null;

  return {
    level: profile[0]?.level ?? null,
    firstPlacement: firstPlacement[0] ?? null,
    progress,
    firstPractices: firstPractices.map((a) => ({
      id: a.id,
      moduleSlug: a.moduleSlug,
      correct: a.correct ?? 0,
      total: a.total,
      at: a.at as Date,
    })),
    firstAssessment: firstAssessment
      ? { id: firstAssessment.id, correct: firstAssessment.correct, total: firstAssessment.total, at: firstAssessment.at }
      : null,
    firstPassedAssessment: firstPassed ? { id: firstPassed.id, at: firstPassed.at } : null,
    missionsCompleted: missionsCompleted.map((m) => ({ missionId: m.missionId, attemptId: m.attemptId, at: m.at as Date })),
    assessmentSkillPasses,
    authoredProjects: (await loadProjects(ex, { userId })).flatMap((p) => {
      const at = authoredAt(p);
      return at ? [{ projectId: p.id, at }] : [];
    }),
  };
}

export type GrantedRewards = {
  xp: { source: XpSource; sourceId: string; points: number }[];
  achievementIds: string[];
};

/**
 * Grava o XP e as conquistas que faltam. Chame dentro da transação que
 * grava a atividade. A trava por pessoa serializa duas atividades que
 * terminam ao mesmo tempo, para a segunda enxergar a primeira (uma
 * conquista que depende das duas não fica para trás).
 */
export async function syncRewards(tx: Transaction, userId: string): Promise<GrantedRewards> {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`rewards:${userId}`}, 0))`);

  const facts = await loadFacts(tx, userId);
  const entitled = entitledRewards(facts);

  const insertedXp = entitled.xp.length
    ? await tx
        .insert(xpEvents)
        .values(entitled.xp.map((x) => ({ userId, ...x })))
        .onConflictDoNothing({ target: [xpEvents.userId, xpEvents.source, xpEvents.sourceId] })
        .returning({ source: xpEvents.source, sourceId: xpEvents.sourceId, points: xpEvents.points })
    : [];

  const insertedAchievements = entitled.achievements.length
    ? await tx
        .insert(userAchievements)
        .values(entitled.achievements.map((a) => ({ userId, ...a })))
        .onConflictDoNothing({ target: [userAchievements.userId, userAchievements.achievementId] })
        .returning({ achievementId: userAchievements.achievementId })
    : [];

  return { xp: insertedXp, achievementIds: insertedAchievements.map((a) => a.achievementId) };
}

/** Versão pública do que acabou de ser concedido, para a tela de resultado. */
export function summarizeGranted(granted: GrantedRewards): RewardSummary {
  return {
    xp: granted.xp.reduce((s, x) => s + x.points, 0),
    achievements: granted.achievementIds.flatMap((id) => {
      const a = achievementById(id);
      return a ? [{ id: a.id, title: a.title }] : [];
    }),
  };
}

/**
 * Concede o que faltar fora de uma atividade (ao abrir o painel ou a
 * jornada). É assim que quem já usava a plataforma antes da gamificação
 * recebe o XP retroativo; repetir não duplica nada.
 */
export async function ensureRewards(userId: string): Promise<GrantedRewards> {
  return db.transaction((tx) => syncRewards(tx, userId));
}

export async function getTotalXp(userId: string, ex: Executor = db): Promise<number> {
  const [row] = await ex
    .select({ total: sum(xpEvents.points).mapWith(Number) })
    .from(xpEvents)
    .where(eq(xpEvents.userId, userId));
  return row?.total ?? 0;
}

export async function getStage(userId: string): Promise<StageInfo> {
  return stageFor(await getTotalXp(userId));
}

/** XP que uma tentativa específica rendeu (nivelamento, prática ou avaliação). */
export async function getAttemptXp(userId: string, attemptId: string): Promise<number> {
  const [row] = await db
    .select({ total: sum(xpEvents.points).mapWith(Number) })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), eq(xpEvents.attemptId, attemptId)));
  return row?.total ?? 0;
}

/** XP já recebido por origem (ex.: a aula de um módulo). */
export async function getSourceXp(
  userId: string,
  sources: { source: XpSource; sourceId: string }[],
): Promise<number> {
  if (sources.length === 0) return 0;
  const rows = await db
    .select({ source: xpEvents.source, sourceId: xpEvents.sourceId, points: xpEvents.points })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), inArray(xpEvents.source, sources.map((s) => s.source))));
  return rows
    .filter((r) => sources.some((s) => s.source === r.source && s.sourceId === r.sourceId))
    .reduce((s, r) => s + r.points, 0);
}

/** Mapa de habilidades da pessoa (estado de cada uma, a partir dos dados gravados). */
export async function getSkillMap(userId: string): Promise<SkillMapEntry[]> {
  return skillMap(await loadFacts(db, userId));
}

export type JourneyAchievement = Achievement & { earnedAt: Date | null };

export type Journey = {
  stage: StageInfo;
  achievements: JourneyAchievement[];
  earnedCount: number;
  history: { id: string; label: string; points: number; earnedAt: Date }[];
};

/** Tudo o que a página "Minha jornada" precisa, só com dados da própria pessoa. */
export async function getJourney(userId: string): Promise<Journey> {
  const [total, earned, events] = await Promise.all([
    getTotalXp(userId),
    db
      .select({ achievementId: userAchievements.achievementId, earnedAt: userAchievements.earnedAt })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId)),
    db
      .select()
      .from(xpEvents)
      .where(eq(xpEvents.userId, userId))
      .orderBy(desc(xpEvents.earnedAt), desc(xpEvents.points)),
  ]);

  const earnedAt = new Map(earned.map((e) => [e.achievementId, e.earnedAt]));
  const list = achievements.map((a) => ({ ...a, earnedAt: earnedAt.get(a.id) ?? null }));

  return {
    stage: stageFor(total),
    achievements: list,
    earnedCount: list.filter((a) => a.earnedAt).length,
    history: events.map((e) => ({
      id: e.id,
      label: xpEventLabel(e.source, e.sourceId),
      points: e.points,
      earnedAt: e.earnedAt,
    })),
  };
}
