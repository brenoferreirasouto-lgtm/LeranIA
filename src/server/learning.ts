import "server-only";

import { and, count, desc, eq, isNull, sql } from "drizzle-orm";

import { type Level, PRACTICE_PASS_PERCENT, type Skill, findModule, placementQuestions } from "@/content";
import { db } from "@/db";
import {
  learnerProfiles,
  moduleProgress,
  placementAnswers,
  placementAttempts,
  practiceAnswers,
  practiceAttempts,
} from "@/db/schema";
import type { Feedback, PracticeOutcome, RewardSummary } from "@/lib/learning/public-types";
import {
  type ModuleProgress,
  type PlacementResult,
  type SkillScore,
  gradePlacement,
  percentOf,
  practicePassed,
  skillScoresFrom,
} from "@/lib/learning/scoring";
import { summarizeGranted, syncRewards } from "@/server/rewards";

/*
 * Regras do núcleo educacional que tocam o banco. Toda função recebe o id da
 * pessoa logada (vindo de requireUser) e só lê ou altera dados dela.
 */

export class NotFoundError extends Error {}

/* ---------- Nivelamento (SP02, SP03) ---------- */

export async function savePlacement(
  userId: string,
  answers: Record<string, string | undefined>,
): Promise<PlacementResult & { attemptId: string; rewards: RewardSummary }> {
  const result = gradePlacement(answers); // lança IncompletePlacementError se faltar resposta

  const { attemptId, rewards } = await db.transaction(async (tx) => {
    const [attempt] = await tx
      .insert(placementAttempts)
      .values({
        userId,
        correct: result.correct,
        total: result.total,
        scorePercent: result.percent,
        level: result.level,
      })
      .returning({ id: placementAttempts.id });

    await tx.insert(placementAnswers).values(
      result.graded.map((g) => ({
        attemptId: attempt.id,
        questionId: g.questionId,
        optionId: g.optionId,
        isCorrect: g.isCorrect,
      })),
    );

    await tx
      .insert(learnerProfiles)
      .values({ userId, level: result.level, placementAttemptId: attempt.id })
      .onConflictDoUpdate({
        target: learnerProfiles.userId,
        set: { level: result.level, placementAttemptId: attempt.id, updatedAt: new Date() },
      });

    // Fase C1: XP e conquistas na mesma transação (só o primeiro nivelamento paga).
    const granted = await syncRewards(tx, userId);
    return { attemptId: attempt.id, rewards: summarizeGranted(granted) };
  });

  return { ...result, attemptId, rewards };
}

export type LatestPlacement = {
  attemptId: string;
  correct: number;
  total: number;
  percent: number;
  level: Level;
  createdAt: Date;
  bySkill: Partial<Record<Skill, SkillScore>>;
};

export async function getLatestPlacement(userId: string): Promise<LatestPlacement | null> {
  const [attempt] = await db
    .select()
    .from(placementAttempts)
    .where(eq(placementAttempts.userId, userId))
    .orderBy(desc(placementAttempts.createdAt))
    .limit(1);
  if (!attempt) return null;

  const answers = await db
    .select({ questionId: placementAnswers.questionId, isCorrect: placementAnswers.isCorrect })
    .from(placementAnswers)
    .where(eq(placementAnswers.attemptId, attempt.id));

  const bySkill = skillScoresFrom(placementQuestions, answers);

  return {
    attemptId: attempt.id,
    correct: attempt.correct,
    total: attempt.total,
    percent: attempt.scorePercent,
    level: attempt.level,
    createdAt: attempt.createdAt,
    bySkill,
  };
}

export async function getLevel(userId: string): Promise<Level | null> {
  const [profile] = await db
    .select({ level: learnerProfiles.level })
    .from(learnerProfiles)
    .where(eq(learnerProfiles.userId, userId));
  return profile?.level ?? null;
}

/* ---------- Progresso (U03, SP05, SP09) ---------- */

export async function getProgress(userId: string): Promise<ModuleProgress[]> {
  return db
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
}

function requireModule(slug: string) {
  const found = findModule(slug);
  if (!found) throw new NotFoundError(`Módulo inexistente: ${slug}`);
  return found;
}

/** SP05 — registra a última atividade (abrir a aula ou a prática). */
export async function recordVisit(userId: string, slug: string, step: "aula" | "pratica") {
  requireModule(slug);
  const now = new Date();
  await db
    .insert(moduleProgress)
    .values({ userId, moduleSlug: slug, lastStep: step, lastActivityAt: now })
    .onConflictDoUpdate({
      target: [moduleProgress.userId, moduleProgress.moduleSlug],
      set: { lastStep: step, lastActivityAt: now },
    });
}

/**
 * SP01 — conclui a aula. A primeira conclusão fica registrada; repetir não
 * muda a data. Se a prática já foi aprovada antes, o módulo é concluído agora.
 */
export async function completeLesson(userId: string, slug: string): Promise<RewardSummary> {
  requireModule(slug);
  const now = new Date();
  return db.transaction(async (tx) => {
    await tx
      .insert(moduleProgress)
      .values({ userId, moduleSlug: slug, lessonCompletedAt: now, lastStep: "aula", lastActivityAt: now })
      .onConflictDoUpdate({
        target: [moduleProgress.userId, moduleProgress.moduleSlug],
        set: {
          lessonCompletedAt: sql`coalesce(${moduleProgress.lessonCompletedAt}, ${now})`,
          lastStep: "aula",
          lastActivityAt: now,
          completedAt: sql`coalesce(${moduleProgress.completedAt}, case when ${moduleProgress.bestScorePercent} >= ${PRACTICE_PASS_PERCENT} then ${now}::timestamptz end)`,
        },
      });
    // Fase C1: a aula paga uma vez; se a prática já tinha passado, o módulo também.
    return summarizeGranted(await syncRewards(tx, userId));
  });
}

/* ---------- Prática com feedback (SP04, SP13) ---------- */

export type AnsweredQuestion = Feedback;

export type PracticeState = {
  attemptId: string;
  total: number;
  answered: AnsweredQuestion[];
};

function feedbackFor(slug: string, questionId: string, optionId: string, isCorrect: boolean): AnsweredQuestion {
  const question = requireModule(slug).practice.find((q) => q.id === questionId);
  return {
    questionId,
    optionId,
    isCorrect,
    correctOptionId: question?.correctOptionId ?? "",
    explanation: question?.explanation ?? "",
  };
}

/** Tentativa em aberto (para retomar de onde parou), sem criar nada. */
export async function getOpenPractice(userId: string, slug: string): Promise<PracticeState | null> {
  requireModule(slug);
  const [attempt] = await db
    .select({ id: practiceAttempts.id, total: practiceAttempts.total })
    .from(practiceAttempts)
    .where(
      and(
        eq(practiceAttempts.userId, userId),
        eq(practiceAttempts.moduleSlug, slug),
        isNull(practiceAttempts.finishedAt),
      ),
    );
  if (!attempt) return null;

  const answers = await db
    .select()
    .from(practiceAnswers)
    .where(eq(practiceAnswers.attemptId, attempt.id))
    .orderBy(practiceAnswers.answeredAt);

  return {
    attemptId: attempt.id,
    total: attempt.total,
    answered: answers.map((a) => feedbackFor(slug, a.questionId, a.optionId, a.isCorrect)),
  };
}

/** Começa uma tentativa; se já houver uma em aberto, reaproveita (no máximo uma por módulo). */
export async function startPractice(userId: string, slug: string): Promise<PracticeState> {
  const learningModule = requireModule(slug);
  await db
    .insert(practiceAttempts)
    .values({ userId, moduleSlug: slug, total: learningModule.practice.length })
    .onConflictDoNothing({
      target: [practiceAttempts.userId, practiceAttempts.moduleSlug],
      where: isNull(practiceAttempts.finishedAt),
    });
  await recordVisit(userId, slug, "pratica");

  const state = await getOpenPractice(userId, slug);
  if (!state) throw new Error("Não foi possível iniciar a prática.");
  return state;
}

export type AnswerResult = AnsweredQuestion & { outcome: PracticeOutcome | null };

/**
 * Registra a resposta e devolve o feedback (SP13). Só aceita tentativas
 * em aberto da própria pessoa. Responder de novo a mesma questão devolve o
 * feedback já registrado, sem mudar a nota.
 */
export async function answerPractice(
  userId: string,
  slug: string,
  attemptId: string,
  questionId: string,
  optionId: string,
): Promise<AnswerResult> {
  const learningModule = requireModule(slug);
  const question = learningModule.practice.find((q) => q.id === questionId);
  if (!question || !question.options.some((o) => o.id === optionId)) {
    throw new NotFoundError("Questão ou alternativa inválida.");
  }

  return db.transaction(async (tx) => {
    const [attempt] = await tx
      .select()
      .from(practiceAttempts)
      .where(
        and(
          eq(practiceAttempts.id, attemptId),
          eq(practiceAttempts.userId, userId),
          eq(practiceAttempts.moduleSlug, slug),
        ),
      )
      .for("update");
    if (!attempt) throw new NotFoundError("Tentativa não encontrada.");

    const [existing] = await tx
      .select()
      .from(practiceAnswers)
      .where(and(eq(practiceAnswers.attemptId, attemptId), eq(practiceAnswers.questionId, questionId)));
    if (existing) {
      return { ...feedbackFor(slug, questionId, existing.optionId, existing.isCorrect), outcome: null };
    }
    if (attempt.finishedAt) throw new NotFoundError("Esta tentativa já foi encerrada.");

    const isCorrect = optionId === question.correctOptionId;
    await tx.insert(practiceAnswers).values({ attemptId, questionId, optionId, isCorrect });

    const now = new Date();
    await tx
      .insert(moduleProgress)
      .values({ userId, moduleSlug: slug, lastStep: "pratica", lastActivityAt: now })
      .onConflictDoUpdate({
        target: [moduleProgress.userId, moduleProgress.moduleSlug],
        set: { lastStep: "pratica", lastActivityAt: now },
      });

    const [{ answered }] = await tx
      .select({ answered: count() })
      .from(practiceAnswers)
      .where(eq(practiceAnswers.attemptId, attemptId));

    let outcome: PracticeOutcome | null = null;
    if (answered >= attempt.total) {
      const [{ correct }] = await tx
        .select({ correct: count() })
        .from(practiceAnswers)
        .where(and(eq(practiceAnswers.attemptId, attemptId), eq(practiceAnswers.isCorrect, true)));
      const percent = percentOf(correct, attempt.total);
      const passed = practicePassed(percent);

      await tx
        .update(practiceAttempts)
        .set({ correct, scorePercent: percent, finishedAt: now })
        .where(eq(practiceAttempts.id, attemptId));

      const [progress] = await tx
        .update(moduleProgress)
        .set({
          bestScorePercent: sql`greatest(coalesce(${moduleProgress.bestScorePercent}, 0), ${percent})`,
          completedAt: passed
            ? sql`coalesce(${moduleProgress.completedAt}, case when ${moduleProgress.lessonCompletedAt} is not null then ${now}::timestamptz end)`
            : sql`${moduleProgress.completedAt}`,
        })
        .where(and(eq(moduleProgress.userId, userId), eq(moduleProgress.moduleSlug, slug)))
        .returning({ completedAt: moduleProgress.completedAt });

      // Fase C1: os acertos desta tentativa só rendem XP se ela for a primeira.
      const granted = await syncRewards(tx, userId);

      outcome = {
        correct,
        total: attempt.total,
        percent,
        passed,
        moduleCompleted: Boolean(progress?.completedAt),
        rewards: summarizeGranted(granted),
      };
    }

    return { ...feedbackFor(slug, questionId, optionId, isCorrect), outcome };
  });
}

/** Resultado da última tentativa encerrada, para a tela de resultado da prática. */
export async function getLastFinishedPractice(userId: string, slug: string) {
  const [attempt] = await db
    .select()
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.userId, userId), eq(practiceAttempts.moduleSlug, slug)))
    .orderBy(desc(practiceAttempts.startedAt))
    .limit(1);
  return attempt ?? null;
}
