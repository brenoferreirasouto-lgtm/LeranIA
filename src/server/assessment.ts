import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { type Question, type Skill, finalAssessment } from "@/content";
import { db } from "@/db";
import { assessmentAnswers, assessmentAttempts } from "@/db/schema";
import {
  type SkillScore,
  type TrackSummary,
  assessmentUnlocked,
  gradeAssessment,
  practiceAverage,
  recommend,
  skillScoresFrom,
  summarizeTrack,
} from "@/lib/learning/scoring";
import { trackFor } from "@/server/content";
import { getLatestPlacement, getLevel, getProgress } from "@/server/learning";

/*
 * SP12 (avaliação final), SP10 (resultado final) e SP11 (recomendações).
 * Toda função recebe o id da pessoa logada e só lê ou grava dados dela.
 */

export class AssessmentLockedError extends Error {
  constructor() {
    super("Conclua os módulos obrigatórios da trilha para fazer a avaliação final.");
  }
}

async function trackState(userId: string) {
  const [level, progress] = await Promise.all([getLevel(userId), getProgress(userId)]);
  const track = trackFor(level);
  const summary = summarizeTrack(track, progress);
  return { level, progress, track, summary };
}

export type AssessmentReviewItem = {
  question: Question;
  chosenOptionId: string;
  isCorrect: boolean;
};

export type LatestAssessment = {
  attemptId: string;
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
  createdAt: Date;
  attemptCount: number;
  bestPercent: number;
  bySkill: Partial<Record<Skill, SkillScore>>;
  review: AssessmentReviewItem[];
};

export async function getLatestAssessment(userId: string): Promise<LatestAssessment | null> {
  const attempts = await db
    .select()
    .from(assessmentAttempts)
    .where(and(eq(assessmentAttempts.userId, userId), eq(assessmentAttempts.assessmentId, finalAssessment.id)))
    .orderBy(desc(assessmentAttempts.createdAt));
  const latest = attempts[0];
  if (!latest) return null;

  const answers = await db
    .select()
    .from(assessmentAnswers)
    .where(eq(assessmentAnswers.attemptId, latest.id));
  const byQuestion = new Map(answers.map((a) => [a.questionId, a]));

  const review = finalAssessment.questions.flatMap((question) => {
    const answer = byQuestion.get(question.id);
    return answer ? [{ question, chosenOptionId: answer.optionId, isCorrect: answer.isCorrect }] : [];
  });

  return {
    attemptId: latest.id,
    correct: latest.correct,
    total: latest.total,
    percent: latest.scorePercent,
    passed: latest.passed,
    createdAt: latest.createdAt,
    attemptCount: attempts.length,
    bestPercent: Math.max(...attempts.map((a) => a.scorePercent)),
    bySkill: skillScoresFrom(finalAssessment.questions, answers),
    review,
  };
}

export type AssessmentState = {
  unlocked: boolean;
  summary: TrackSummary;
  latest: LatestAssessment | null;
};

export async function getAssessmentState(userId: string): Promise<AssessmentState> {
  const [{ summary }, latest] = await Promise.all([trackState(userId), getLatestAssessment(userId)]);
  return { unlocked: assessmentUnlocked(summary), summary, latest };
}

/** SP12 — corrige e grava a avaliação. Recusa se a trilha ainda não liberou a avaliação. */
export async function saveAssessment(userId: string, answers: Record<string, string | undefined>) {
  const { summary } = await trackState(userId);
  if (!assessmentUnlocked(summary)) throw new AssessmentLockedError();

  const result = gradeAssessment(answers); // lança IncompleteQuizError se faltar resposta

  const attemptId = await db.transaction(async (tx) => {
    const [attempt] = await tx
      .insert(assessmentAttempts)
      .values({
        userId,
        assessmentId: finalAssessment.id,
        correct: result.correct,
        total: result.total,
        scorePercent: result.percent,
        passed: result.passed,
      })
      .returning({ id: assessmentAttempts.id });
    await tx.insert(assessmentAnswers).values(
      result.graded.map((g) => ({
        attemptId: attempt.id,
        questionId: g.questionId,
        optionId: g.optionId,
        isCorrect: g.isCorrect,
      })),
    );
    return attempt.id;
  });

  return { ...result, attemptId };
}

/** SP10 + SP11 — tudo o que a página de resultado precisa, a partir de dados reais. */
export async function getResults(userId: string) {
  const [{ level, progress, track, summary }, placement, assessment] = await Promise.all([
    trackState(userId),
    getLatestPlacement(userId),
    getLatestAssessment(userId),
  ]);

  return {
    level,
    track,
    summary,
    placement,
    assessment,
    unlocked: assessmentUnlocked(summary),
    practiceAverage: practiceAverage(track, progress),
    recommendations: recommend({ track, progress, assessmentBySkill: assessment?.bySkill ?? null }),
  };
}
