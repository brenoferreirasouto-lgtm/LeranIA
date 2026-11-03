import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DONT_KNOW_OPTION_ID, findModule, placementQuestions } from "@/content";
import { db } from "@/db";
import { moduleProgress, placementAttempts, practiceAttempts, users } from "@/db/schema";
import { IncompletePlacementError } from "@/lib/learning/scoring";
import {
  NotFoundError,
  answerPractice,
  completeLesson,
  getLatestPlacement,
  getLevel,
  getOpenPractice,
  getProgress,
  recordVisit,
  savePlacement,
  startPractice,
} from "@/server/learning";

// Banco de teste (ver vitest.config.mts). Cada teste cria a própria pessoa.
const createdUsers: string[] = [];

async function newUser() {
  const id = randomUUID();
  await db.insert(users).values({ id, name: "Pessoa Teste", email: `${id}@teste.learnai.dev` });
  createdUsers.push(id);
  return id;
}

const SLUG = "alucinacoes";
const practice = findModule(SLUG)!.practice;

function placementAnswers(correctCount: number) {
  return Object.fromEntries(
    placementQuestions.map((q, i) => [q.id, i < correctCount ? q.correctOptionId : DONT_KNOW_OPTION_ID]),
  );
}

/** Responde a prática acertando as `n` primeiras questões. */
async function answerAll(userId: string, attemptId: string, correctCount: number) {
  let last;
  for (const [i, q] of practice.entries()) {
    const wrong = q.options.find((o) => o.id !== q.correctOptionId)!.id;
    last = await answerPractice(userId, SLUG, attemptId, q.id, i < correctCount ? q.correctOptionId : wrong);
  }
  return last!;
}

beforeAll(async () => {
  await db.execute("select 1");
});

afterAll(async () => {
  if (createdUsers.length) await db.delete(users).where(inArray(users.id, createdUsers));
});

describe("SP02/SP03 — nivelamento salvo no banco", () => {
  it("grava tentativa, respostas e nível; refazer atualiza o nível", async () => {
    const userId = await newUser();

    const first = await savePlacement(userId, placementAnswers(2));
    expect(first.level).toBe("iniciante");
    expect(await getLevel(userId)).toBe("iniciante");

    const second = await savePlacement(userId, placementAnswers(9));
    expect(second.level).toBe("avancado");
    expect(await getLevel(userId)).toBe("avancado");

    const latest = await getLatestPlacement(userId);
    expect(latest).toMatchObject({ attemptId: second.attemptId, correct: 9, level: "avancado" });

    const attempts = await db.select().from(placementAttempts).where(eq(placementAttempts.userId, userId));
    expect(attempts).toHaveLength(2);
  });

  it("nivelamento incompleto não grava nada", async () => {
    const userId = await newUser();
    const answers = placementAnswers(10);
    delete answers["niv-q5"];
    await expect(savePlacement(userId, answers)).rejects.toBeInstanceOf(IncompletePlacementError);
    expect(await getLevel(userId)).toBeNull();
  });
});

describe("SP04/SP13 — prática com feedback", () => {
  it("devolve feedback com explicação e a alternativa correta", async () => {
    const userId = await newUser();
    const { attemptId } = await startPractice(userId, SLUG);
    const q = practice[0];
    const wrong = q.options.find((o) => o.id !== q.correctOptionId)!.id;

    const feedback = await answerPractice(userId, SLUG, attemptId, q.id, wrong);
    expect(feedback.isCorrect).toBe(false);
    expect(feedback.correctOptionId).toBe(q.correctOptionId);
    expect(feedback.explanation).toBe(q.explanation);
    expect(feedback.outcome).toBeNull();
  });

  it("responder de novo a mesma questão não muda a resposta registrada", async () => {
    const userId = await newUser();
    const { attemptId } = await startPractice(userId, SLUG);
    const q = practice[0];
    const wrong = q.options.find((o) => o.id !== q.correctOptionId)!.id;

    await answerPractice(userId, SLUG, attemptId, q.id, wrong);
    const again = await answerPractice(userId, SLUG, attemptId, q.id, q.correctOptionId);
    expect(again.isCorrect).toBe(false);
    expect(again.optionId).toBe(wrong);
  });

  it("recusa alternativa inexistente", async () => {
    const userId = await newUser();
    const { attemptId } = await startPractice(userId, SLUG);
    await expect(answerPractice(userId, SLUG, attemptId, practice[0].id, "zzz")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("não deixa uma pessoa responder na tentativa de outra", async () => {
    const owner = await newUser();
    const intruder = await newUser();
    const { attemptId } = await startPractice(owner, SLUG);
    const q = practice[0];
    await expect(answerPractice(intruder, SLUG, attemptId, q.id, q.correctOptionId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("retoma a tentativa em aberto em vez de criar outra", async () => {
    const userId = await newUser();
    const [a, b] = await Promise.all([startPractice(userId, SLUG), startPractice(userId, SLUG)]);
    expect(a.attemptId).toBe(b.attemptId);

    await answerPractice(userId, SLUG, a.attemptId, practice[0].id, practice[0].correctOptionId);
    const resumed = await getOpenPractice(userId, SLUG);
    expect(resumed?.answered.map((x) => x.questionId)).toEqual([practice[0].id]);
  });
});

describe("conclusão do módulo", () => {
  it("só conclui com aula concluída e prática com pelo menos 70%", async () => {
    const userId = await newUser();

    const first = await startPractice(userId, SLUG);
    const failed = await answerAll(userId, first.attemptId, 3); // 3/5 = 60%
    expect(failed.outcome).toMatchObject({ correct: 3, percent: 60, passed: false, moduleCompleted: false });

    const second = await startPractice(userId, SLUG);
    expect(second.attemptId).not.toBe(first.attemptId);
    const passed = await answerAll(userId, second.attemptId, 5);
    // Prática aprovada, mas a aula ainda não foi concluída.
    expect(passed.outcome).toMatchObject({ percent: 100, passed: true, moduleCompleted: false });

    await completeLesson(userId, SLUG);
    const [row] = await getProgress(userId);
    expect(row.completedAt).not.toBeNull();
    expect(row.bestScorePercent).toBe(100);
  });

  it("guarda a melhor nota e não desfaz a conclusão com uma nota menor", async () => {
    const userId = await newUser();
    await completeLesson(userId, SLUG);

    const a = await startPractice(userId, SLUG);
    const passed = await answerAll(userId, a.attemptId, 4);
    expect(passed.outcome?.moduleCompleted).toBe(true);

    const b = await startPractice(userId, SLUG);
    await answerAll(userId, b.attemptId, 1);

    const [row] = await db.select().from(moduleProgress).where(eq(moduleProgress.userId, userId));
    expect(row.bestScorePercent).toBe(80);
    expect(row.completedAt).not.toBeNull();
  });

  it("concluir a aula duas vezes mantém a primeira data", async () => {
    const userId = await newUser();
    await completeLesson(userId, SLUG);
    const [first] = await getProgress(userId);
    await completeLesson(userId, SLUG);
    const [second] = await getProgress(userId);
    expect(second.lessonCompletedAt?.getTime()).toBe(first.lessonCompletedAt?.getTime());
  });

  it("tentativa encerrada não aceita respostas novas", async () => {
    const userId = await newUser();
    const { attemptId } = await startPractice(userId, SLUG);
    await answerAll(userId, attemptId, 5);
    const [attempt] = await db.select().from(practiceAttempts).where(eq(practiceAttempts.id, attemptId));
    expect(attempt.finishedAt).not.toBeNull();
    expect(await getOpenPractice(userId, SLUG)).toBeNull();
  });
});

describe("SP05 — registro da última atividade", () => {
  it("guarda a etapa e o momento da última visita", async () => {
    const userId = await newUser();
    await recordVisit(userId, "privacidade-e-dados", "aula");
    const [row] = await getProgress(userId);
    expect(row).toMatchObject({ moduleSlug: "privacidade-e-dados", lastStep: "aula" });
    expect(row.lastActivityAt).toBeInstanceOf(Date);
  });

  it("recusa módulo que não existe", async () => {
    const userId = await newUser();
    await expect(recordVisit(userId, "modulo-inexistente", "aula")).rejects.toBeInstanceOf(NotFoundError);
  });
});
