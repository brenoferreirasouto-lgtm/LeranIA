import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { DONT_KNOW_OPTION_ID, findModule, finalAssessment, placementQuestions, tracks } from "@/content";
import { db } from "@/db";
import { learnerProfiles, moduleProgress, userAchievements, users, xpEvents } from "@/db/schema";
import { saveAssessment } from "@/server/assessment";
import { answerPractice, completeLesson, savePlacement, startPractice } from "@/server/learning";
import { ensureRewards, getAttemptXp, getJourney, getSourceXp, getTotalXp } from "@/server/rewards";

// Fase C1 — XP e conquistas gravados no banco de teste (ver vitest.config.mts).
const createdUsers: string[] = [];

async function newUser() {
  const id = randomUUID();
  await db.insert(users).values({ id, name: "Pessoa Teste", email: `${id}@teste.learnai.dev` });
  createdUsers.push(id);
  return id;
}

afterAll(async () => {
  if (createdUsers.length) await db.delete(users).where(inArray(users.id, createdUsers));
});

/** Faz uma tentativa completa da prática acertando as `n` primeiras questões. */
async function practiceRound(userId: string, slug: string, correctCount: number) {
  const practice = findModule(slug)!.practice;
  const { attemptId } = await startPractice(userId, slug);
  let last;
  for (const [i, q] of practice.entries()) {
    const wrong = q.options.find((o) => o.id !== q.correctOptionId)!.id;
    last = await answerPractice(userId, slug, attemptId, q.id, i < correctCount ? q.correctOptionId : wrong);
  }
  return { attemptId, outcome: last!.outcome! };
}

function placementAnswers(correctCount: number) {
  return Object.fromEntries(
    placementQuestions.map((q, i) => [q.id, i < correctCount ? q.correctOptionId : DONT_KNOW_OPTION_ID]),
  );
}

function assessmentAnswers(correctCount: number) {
  return Object.fromEntries(
    finalAssessment.questions.map((q, i) => [
      q.id,
      i < correctCount ? q.correctOptionId : q.options.find((o) => o.id !== q.correctOptionId)!.id,
    ]),
  );
}

async function achievementIds(userId: string) {
  const rows = await db
    .select({ id: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));
  return rows.map((r) => r.id).sort();
}

async function xpRowCount(userId: string) {
  return (await db.select().from(xpEvents).where(eq(xpEvents.userId, userId))).length;
}

/** Marca módulos como concluídos direto no banco, como se a pessoa já os tivesse feito antes da C1. */
async function seedCompleted(userId: string, slugs: string[], best = 80) {
  const now = new Date();
  for (const slug of slugs) {
    await db.insert(moduleProgress).values({
      userId,
      moduleSlug: slug,
      lessonCompletedAt: now,
      completedAt: now,
      bestScorePercent: best,
      lastStep: "pratica",
      lastActivityAt: now,
    });
  }
}

describe("C1 — XP de cada atividade, uma vez só", () => {
  it("aula + prática com 4 de 5: 10 + 40 + 40, e refazer não rende mais XP", async () => {
    const userId = await newUser();

    expect(await completeLesson(userId, "alucinacoes")).toEqual({ xp: 10, achievements: [] });

    const first = await practiceRound(userId, "alucinacoes", 4);
    expect(first.outcome.moduleCompleted).toBe(true);
    expect(first.outcome.rewards).toEqual({
      xp: 80,
      achievements: [{ id: "primeiro-modulo", title: "Primeiro módulo" }],
    });

    // Refazer acertando tudo: a nota melhora, o XP não; a conquista de 5 de 5 exige a primeira tentativa.
    const again = await practiceRound(userId, "alucinacoes", 5);
    expect(again.outcome.rewards).toEqual({ xp: 0, achievements: [] });
    expect(await completeLesson(userId, "alucinacoes")).toEqual({ xp: 0, achievements: [] });

    expect(await getTotalXp(userId)).toBe(90);
    expect(await getAttemptXp(userId, first.attemptId)).toBe(40);
    expect(await getAttemptXp(userId, again.attemptId)).toBe(0);
    expect(await achievementIds(userId)).toEqual(["primeiro-modulo"]);
  });

  it("quem erra na primeira tentativa e refaz até passar ganha a conclusão do módulo", async () => {
    const userId = await newUser();

    const first = await practiceRound(userId, "privacidade-e-dados", 3); // 60%: não passa
    expect(first.outcome.passed).toBe(false);
    expect(first.outcome.rewards.xp).toBe(30);

    expect((await completeLesson(userId, "privacidade-e-dados")).xp).toBe(10);

    const retry = await practiceRound(userId, "privacidade-e-dados", 4);
    expect(retry.outcome.moduleCompleted).toBe(true);
    expect(retry.outcome.rewards.xp).toBe(40); // só a conclusão
    expect(await getTotalXp(userId)).toBe(80);
  });

  it("acertar tudo na primeira tentativa concede Olho nas alucinações", async () => {
    const userId = await newUser();
    await completeLesson(userId, "alucinacoes");
    const { outcome } = await practiceRound(userId, "alucinacoes", 5);
    expect(outcome.rewards.xp).toBe(90);
    expect(outcome.rewards.achievements.map((a) => a.id).sort()).toEqual(["olho-nas-alucinacoes", "primeiro-modulo"]);
  });

  it("só o primeiro nivelamento paga, com Ponto de partida", async () => {
    const userId = await newUser();
    const first = await savePlacement(userId, placementAnswers(2));
    expect(first.rewards).toEqual({ xp: 20, achievements: [{ id: "ponto-de-partida", title: "Ponto de partida" }] });

    const second = await savePlacement(userId, placementAnswers(9));
    expect(second.rewards).toEqual({ xp: 0, achievements: [] });
    expect(await getAttemptXp(userId, first.attemptId)).toBe(20);
    expect(await getAttemptXp(userId, second.attemptId)).toBe(0);
  });

  it("avaliação: acertos da primeira tentativa e +50 na primeira aprovação, com Aprovado", async () => {
    const userId = await newUser();
    await seedCompleted(userId, tracks.iniciante.steps.map((s) => s.moduleSlug));
    const before = await ensureRewards(userId); // módulos feitos antes: retroativo
    expect(before.achievementIds).toContain("trilha-concluida");

    const failed = await saveAssessment(userId, assessmentAnswers(7)); // 58%
    expect(failed.passed).toBe(false);
    expect(failed.rewards).toEqual({ xp: 70, achievements: [] });

    const passed = await saveAssessment(userId, assessmentAnswers(10));
    expect(passed.rewards).toEqual({ xp: 50, achievements: [{ id: "aprovado", title: "Aprovado" }] });

    const third = await saveAssessment(userId, assessmentAnswers(12));
    expect(third.rewards).toEqual({ xp: 0, achievements: [] });

    expect(await getAttemptXp(userId, failed.attemptId)).toBe(70);
    expect(await getAttemptXp(userId, passed.attemptId)).toBe(50);
    expect(await getAttemptXp(userId, third.attemptId)).toBe(0);
    expect(await getTotalXp(userId)).toBe(6 * 50 + 70 + 50);
  });
});

describe("C1 — retroativo e concorrência", () => {
  it("recalcula para quem já tinha atividade, e repetir não duplica nada", async () => {
    const userId = await newUser();
    await savePlacement(userId, placementAnswers(2));
    await completeLesson(userId, "alucinacoes");
    await practiceRound(userId, "alucinacoes", 4);
    const expected = await getTotalXp(userId);
    const rows = await xpRowCount(userId);

    // Simula dados de antes da gamificação: apaga o que foi concedido.
    await db.delete(xpEvents).where(eq(xpEvents.userId, userId));
    await db.delete(userAchievements).where(eq(userAchievements.userId, userId));

    await ensureRewards(userId);
    await ensureRewards(userId);
    expect(await getTotalXp(userId)).toBe(expected);
    expect(await xpRowCount(userId)).toBe(rows);
    expect(await achievementIds(userId)).toEqual(["ponto-de-partida", "primeiro-modulo"]);
  });

  it("três sincronizações ao mesmo tempo não duplicam XP", async () => {
    const userId = await newUser();
    await seedCompleted(userId, ["alucinacoes", "privacidade-e-dados"]);
    await Promise.all([ensureRewards(userId), ensureRewards(userId), ensureRewards(userId)]);
    expect(await getTotalXp(userId)).toBe(2 * 50);
    expect(await xpRowCount(userId)).toBe(4);
  });

  it("dois módulos concluídos ao mesmo tempo ainda concedem Trilha concluída", async () => {
    const userId = await newUser();
    await db.insert(learnerProfiles).values({ userId, level: "avancado" });
    const required = tracks.avancado.steps.filter((s) => !s.optional).map((s) => s.moduleSlug);
    const [a, b, ...rest] = required;
    await seedCompleted(userId, rest);
    // Práticas já aprovadas, aulas pendentes: concluir a aula fecha o módulo.
    for (const slug of [a, b]) {
      await db.insert(moduleProgress).values({ userId, moduleSlug: slug, bestScorePercent: 80 });
    }

    await Promise.all([completeLesson(userId, a), completeLesson(userId, b)]);

    expect(await achievementIds(userId)).toContain("trilha-concluida");
  });

  it("o banco recusa um segundo pagamento da mesma atividade", async () => {
    const userId = await newUser();
    await completeLesson(userId, "alucinacoes");
    const duplicate = db.insert(xpEvents).values({
      userId,
      source: "aula",
      sourceId: "alucinacoes",
      points: 10,
      earnedAt: new Date(),
    });
    await expect(duplicate).rejects.toThrow();
    const rows = await db
      .select()
      .from(xpEvents)
      .where(and(eq(xpEvents.userId, userId), eq(xpEvents.source, "aula")));
    expect(rows).toHaveLength(1);
  });
});

describe("C1 — jornada", () => {
  it("mostra estágio, conquistas e histórico só da própria pessoa", async () => {
    const userId = await newUser();
    const other = await newUser();
    await savePlacement(other, placementAnswers(9));

    await savePlacement(userId, placementAnswers(2));
    await completeLesson(userId, "alucinacoes");
    await practiceRound(userId, "alucinacoes", 4);

    const journey = await getJourney(userId);
    expect(journey.stage).toMatchObject({ xp: 110, stage: 2, next: { stage: 3, minXp: 180 } });
    expect(journey.earnedCount).toBe(2);
    expect(journey.achievements.find((x) => x.id === "aprovado")?.earnedAt).toBeNull();
    expect(journey.history.map((h) => h.points).sort((x, y) => x - y)).toEqual([10, 20, 40, 40]);
    expect(await getSourceXp(userId, [{ source: "aula", sourceId: "alucinacoes" }])).toBe(10);

    const otherJourney = await getJourney(other);
    expect(otherJourney.stage.xp).toBe(20);
    expect(otherJourney.history).toHaveLength(1);
  });
});
