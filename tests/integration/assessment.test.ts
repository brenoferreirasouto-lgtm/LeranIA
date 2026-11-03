import { randomUUID } from "node:crypto";
import { inArray } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { finalAssessment, tracks } from "@/content";
import { db } from "@/db";
import { moduleProgress, users } from "@/db/schema";
import { IncompleteQuizError } from "@/lib/learning/scoring";
import {
  AssessmentLockedError,
  getAssessmentState,
  getLatestAssessment,
  getResults,
  saveAssessment,
} from "@/server/assessment";

const createdUsers: string[] = [];

async function newUser() {
  const id = randomUUID();
  await db.insert(users).values({ id, name: "Pessoa Teste", email: `${id}@teste.learnai.dev` });
  createdUsers.push(id);
  return id;
}

/** Marca como concluídos os módulos obrigatórios da trilha Iniciante (padrão sem nivelamento). */
async function completeRequiredModules(userId: string) {
  const now = new Date();
  await db.insert(moduleProgress).values(
    tracks.iniciante.steps
      .filter((s) => !s.optional)
      .map((s) => ({
        userId,
        moduleSlug: s.moduleSlug,
        lessonCompletedAt: now,
        completedAt: now,
        bestScorePercent: 80,
        lastActivityAt: now,
      })),
  );
}

/** Responde a avaliação acertando tudo, menos as questões indicadas. */
function answers(wrongIds: string[] = []) {
  return Object.fromEntries(
    finalAssessment.questions.map((q) => [
      q.id,
      wrongIds.includes(q.id) ? q.options.find((o) => o.id !== q.correctOptionId)!.id : q.correctOptionId,
    ]),
  );
}

afterAll(async () => {
  if (createdUsers.length) await db.delete(users).where(inArray(users.id, createdUsers));
});

describe("SP12 — avaliação final (banco real)", () => {
  it("fica bloqueada até concluir os módulos obrigatórios", async () => {
    const userId = await newUser();
    expect((await getAssessmentState(userId)).unlocked).toBe(false);
    await expect(saveAssessment(userId, answers())).rejects.toBeInstanceOf(AssessmentLockedError);
    expect(await getLatestAssessment(userId)).toBeNull();
  });

  it("depois de liberada, grava respostas, nota e revisão", async () => {
    const userId = await newUser();
    await completeRequiredModules(userId);
    expect((await getAssessmentState(userId)).unlocked).toBe(true);

    const result = await saveAssessment(userId, answers(["aval-q3", "aval-q4"]));
    expect(result).toMatchObject({ correct: 10, total: 12, percent: 83, passed: true });

    const latest = await getLatestAssessment(userId);
    expect(latest?.review).toHaveLength(12);
    expect(latest?.review.find((r) => r.question.id === "aval-q3")?.isCorrect).toBe(false);
    expect(latest?.bySkill.alucinacoes).toEqual({ correct: 0, total: 2 });
  });

  it("refazer guarda o histórico: a última e a melhor nota", async () => {
    const userId = await newUser();
    await completeRequiredModules(userId);
    await saveAssessment(userId, answers());
    await saveAssessment(userId, answers(["aval-q1", "aval-q2", "aval-q5", "aval-q6"]));

    const latest = await getLatestAssessment(userId);
    expect(latest).toMatchObject({ attemptCount: 2, percent: 67, passed: false, bestPercent: 100 });
  });

  it("recusa avaliação incompleta sem gravar nada", async () => {
    const userId = await newUser();
    await completeRequiredModules(userId);
    const partial = answers();
    delete partial["aval-q7"];
    await expect(saveAssessment(userId, partial)).rejects.toBeInstanceOf(IncompleteQuizError);
    expect(await getLatestAssessment(userId)).toBeNull();
  });
});

describe("SP10/SP11 — resultado consolidado e recomendações", () => {
  it("usa os dados reais e recomenda revisar os temas fracos", async () => {
    const userId = await newUser();
    await completeRequiredModules(userId);
    await saveAssessment(userId, answers(["aval-q5", "aval-q6", "aval-q7"])); // verificação: 0 de 3

    const results = await getResults(userId);
    expect(results.practiceAverage).toBe(80);
    expect(results.summary).toMatchObject({ requiredDone: 6, requiredTotal: 6 });
    expect(results.recommendations).toEqual([
      expect.objectContaining({ moduleSlug: "verificar-informacoes", kind: "revisar" }),
    ]);
  });

  it("sem atividade, não inventa resultado", async () => {
    const userId = await newUser();
    const results = await getResults(userId);
    expect(results.practiceAverage).toBeNull();
    expect(results.assessment).toBeNull();
    expect(results.placement).toBeNull();
    expect(results.recommendations.every((r) => r.kind === "concluir")).toBe(true);
  });
});
