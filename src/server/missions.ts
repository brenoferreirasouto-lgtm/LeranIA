import "server-only";

import { and, asc, count, desc, eq, isNull } from "drizzle-orm";

import { type Mission, type MissionStep, type StepMission, findMission, missions } from "@/content";
import { db } from "@/db";
import { missionAnswers, missionAttempts } from "@/db/schema";
import {
  type MissionStatus,
  checkPromptMission,
  gradeStep,
  missionPassed,
  missionUnlocked,
  unlockText,
  validStepAnswer,
} from "@/lib/learning/missions";
import type {
  MissionFeedback,
  MissionOutcome,
  PromptMissionResult,
  PublicMissionStep,
} from "@/lib/learning/public-types";
import { percentOf } from "@/lib/learning/scoring";
import type { PromptFields } from "@/lib/prompt-builder";
import { trackFor } from "@/server/content";
import { NotFoundError, getLevel, getProgress } from "@/server/learning";
import { summarizeGranted, syncRewards } from "@/server/rewards";

/*
 * Missões (Fase C2). Toda função recebe o id da pessoa logada e só lê ou
 * grava dados dela. A correção é sempre no servidor.
 */

export class MissionLockedError extends Error {
  constructor(mission: Mission) {
    super(unlockText(mission));
  }
}

function requireMission(id: string): Mission {
  const mission = findMission(id);
  if (!mission) throw new NotFoundError(`Missão inexistente: ${id}`);
  return mission;
}

function requireStepMission(id: string): StepMission {
  const mission = requireMission(id);
  if (mission.kind !== "steps") throw new NotFoundError(`Missão sem passos: ${id}`);
  return mission;
}

export function toPublicStep(step: MissionStep): PublicMissionStep {
  return {
    id: step.id,
    scenario: step.scenario,
    sample: step.sample,
    prompt: step.prompt,
    options: step.options.map((o) => ({ id: o.id, text: o.text })),
    optionStyle: step.optionStyle,
    multiple: Boolean(step.multiple),
    hint: step.hint,
  };
}

async function learnerContext(userId: string) {
  const [level, progress] = await Promise.all([getLevel(userId), getProgress(userId)]);
  return { level, progress, track: trackFor(level) };
}

export type MissionOverviewItem = {
  id: string;
  title: string;
  summary: string;
  skill: Mission["skill"];
  kind: Mission["kind"];
  xp: number;
  stepCount: number | null;
  status: MissionStatus;
  unlockText: string;
  completedAt: Date | null;
};

/** Lista de missões com a situação de cada uma para a pessoa. */
export async function getMissionsOverview(userId: string): Promise<MissionOverviewItem[]> {
  const [{ progress, track }, attempts] = await Promise.all([
    learnerContext(userId),
    db
      .select({
        missionId: missionAttempts.missionId,
        passed: missionAttempts.passed,
        finishedAt: missionAttempts.finishedAt,
      })
      .from(missionAttempts)
      .where(eq(missionAttempts.userId, userId))
      .orderBy(asc(missionAttempts.startedAt)),
  ]);

  return missions.map((mission) => {
    const mine = attempts.filter((a) => a.missionId === mission.id);
    const firstPassed = mine.find((a) => a.passed);
    const open = mine.some((a) => !a.finishedAt);
    const unlocked = missionUnlocked(mission, track, progress);
    const status: MissionStatus = firstPassed
      ? "concluida"
      : open
        ? "em-andamento"
        : unlocked
          ? "disponivel"
          : "bloqueada";
    return {
      id: mission.id,
      title: mission.title,
      summary: mission.summary,
      skill: mission.skill,
      kind: mission.kind,
      xp: mission.xp,
      stepCount: mission.kind === "steps" ? mission.steps.length : null,
      status,
      unlockText: unlockText(mission),
      completedAt: firstPassed?.finishedAt ?? null,
    };
  });
}

export async function isMissionUnlocked(userId: string, mission: Mission): Promise<boolean> {
  const { progress, track } = await learnerContext(userId);
  return missionUnlocked(mission, track, progress);
}

/* ---------- Missões em passos ---------- */

export type MissionState = {
  attemptId: string;
  total: number;
  answered: MissionFeedback[];
};

function feedbackFor(mission: StepMission, stepId: string, optionIds: string[], isCorrect: boolean): MissionFeedback {
  const step = mission.steps.find((s) => s.id === stepId);
  return {
    stepId,
    optionIds,
    isCorrect,
    correctOptionIds: step?.correctOptionIds ?? [],
    explanation: step?.explanation ?? "",
  };
}

export async function getOpenMission(userId: string, missionId: string): Promise<MissionState | null> {
  const mission = requireStepMission(missionId);
  const [attempt] = await db
    .select({ id: missionAttempts.id, total: missionAttempts.total })
    .from(missionAttempts)
    .where(
      and(
        eq(missionAttempts.userId, userId),
        eq(missionAttempts.missionId, missionId),
        isNull(missionAttempts.finishedAt),
      ),
    );
  if (!attempt) return null;

  const answers = await db
    .select()
    .from(missionAnswers)
    .where(eq(missionAnswers.attemptId, attempt.id))
    .orderBy(missionAnswers.answeredAt);

  return {
    attemptId: attempt.id,
    total: attempt.total,
    answered: answers.map((a) => feedbackFor(mission, a.stepId, a.optionIds, a.isCorrect)),
  };
}

/** Resultado da última tentativa encerrada, para a página da missão. */
export async function getLastFinishedMission(userId: string, missionId: string) {
  const [attempt] = await db
    .select()
    .from(missionAttempts)
    .where(and(eq(missionAttempts.userId, userId), eq(missionAttempts.missionId, missionId)))
    .orderBy(desc(missionAttempts.startedAt))
    .limit(1);
  return attempt?.finishedAt ? attempt : null;
}

/** Começa uma tentativa, se a missão estiver liberada; reaproveita a que estiver em aberto. */
export async function startMission(userId: string, missionId: string): Promise<MissionState> {
  const mission = requireStepMission(missionId);
  if (!(await isMissionUnlocked(userId, mission))) throw new MissionLockedError(mission);

  await db
    .insert(missionAttempts)
    .values({ userId, missionId, total: mission.steps.length })
    .onConflictDoNothing({
      target: [missionAttempts.userId, missionAttempts.missionId],
      where: isNull(missionAttempts.finishedAt),
    });

  const state = await getOpenMission(userId, missionId);
  if (!state) throw new Error("Não foi possível iniciar a missão.");
  return state;
}

export type MissionAnswerResult = MissionFeedback & { outcome: MissionOutcome | null };

/**
 * Registra a resposta de um passo e devolve o feedback. Responder de novo o
 * mesmo passo devolve o feedback já registrado, sem mudar a nota. No último
 * passo, encerra a tentativa e concede XP e conquistas na mesma transação.
 */
export async function answerMissionStep(
  userId: string,
  missionId: string,
  attemptId: string,
  stepId: string,
  optionIds: string[],
): Promise<MissionAnswerResult> {
  const mission = requireStepMission(missionId);
  const step = mission.steps.find((s) => s.id === stepId);
  if (!step || !validStepAnswer(step, optionIds)) throw new NotFoundError("Passo ou alternativa inválida.");

  return db.transaction(async (tx) => {
    const [attempt] = await tx
      .select()
      .from(missionAttempts)
      .where(
        and(
          eq(missionAttempts.id, attemptId),
          eq(missionAttempts.userId, userId),
          eq(missionAttempts.missionId, missionId),
        ),
      )
      .for("update");
    if (!attempt) throw new NotFoundError("Tentativa não encontrada.");

    const [existing] = await tx
      .select()
      .from(missionAnswers)
      .where(and(eq(missionAnswers.attemptId, attemptId), eq(missionAnswers.stepId, stepId)));
    if (existing) {
      return { ...feedbackFor(mission, stepId, existing.optionIds, existing.isCorrect), outcome: null };
    }
    if (attempt.finishedAt) throw new NotFoundError("Esta tentativa já foi encerrada.");

    const sorted = [...optionIds].sort();
    const isCorrect = gradeStep(step, sorted);
    await tx.insert(missionAnswers).values({ attemptId, stepId, optionIds: sorted, isCorrect });

    const [{ answered }] = await tx
      .select({ answered: count() })
      .from(missionAnswers)
      .where(eq(missionAnswers.attemptId, attemptId));

    let outcome: MissionOutcome | null = null;
    if (answered >= attempt.total) {
      const [{ correct }] = await tx
        .select({ correct: count() })
        .from(missionAnswers)
        .where(and(eq(missionAnswers.attemptId, attemptId), eq(missionAnswers.isCorrect, true)));
      const passed = missionPassed(correct, attempt.total);
      await tx
        .update(missionAttempts)
        .set({ correct, passed, finishedAt: new Date() })
        .where(eq(missionAttempts.id, attemptId));

      // Só a primeira conclusão de cada missão paga XP.
      const granted = await syncRewards(tx, userId);
      outcome = {
        correct,
        total: attempt.total,
        percent: percentOf(correct, attempt.total),
        passed,
        rewards: summarizeGranted(granted),
      };
    }

    return { ...feedbackFor(mission, stepId, sorted, isCorrect), outcome };
  });
}

/* ---------- Missão do construtor de prompt ---------- */

/**
 * Confere a estrutura do prompt no servidor e grava só o resultado. O texto
 * que a pessoa escreveu é conferido e descartado: não vai para o banco nem
 * para os registros de erro.
 */
export async function submitPromptMission(
  userId: string,
  missionId: string,
  fields: PromptFields,
): Promise<PromptMissionResult> {
  const mission = requireMission(missionId);
  if (mission.kind !== "prompt") throw new NotFoundError(`Missão sem construtor: ${missionId}`);
  if (!(await isMissionUnlocked(userId, mission))) throw new MissionLockedError(mission);

  const check = checkPromptMission(fields);

  const rewards = await db.transaction(async (tx) => {
    await tx.insert(missionAttempts).values({
      userId,
      missionId,
      total: 1,
      correct: check.passed ? 1 : 0,
      passed: check.passed,
      finishedAt: new Date(),
    });
    return summarizeGranted(await syncRewards(tx, userId));
  });

  return { passed: check.passed, problems: check.problems, rewards };
}
