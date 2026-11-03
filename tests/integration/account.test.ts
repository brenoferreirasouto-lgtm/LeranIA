import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { DONT_KNOW_OPTION_ID, findModule, placementQuestions } from "@/content";
import { db } from "@/db";
import {
  missionAttempts,
  moduleProgress,
  placementAnswers,
  placementAttempts,
  practiceAnswers,
  practiceAttempts,
  sessions,
  userAchievements,
  users,
  xpEvents,
} from "@/db/schema";
import { confirmAge, exportUserData, getAccount } from "@/server/account";
import { answerPractice, completeLesson, savePlacement, startPractice } from "@/server/learning";
import { submitPromptMission } from "@/server/missions";

// ADR 0002 — conta, exportação e exclusão (banco de teste, ver vitest.config.mts).
const createdUsers: string[] = [];

async function newUser(ageConfirmed = true) {
  const id = randomUUID();
  await db.insert(users).values({
    id,
    name: "Pessoa Teste",
    email: `${id}@teste.learnai.dev`,
    termsAcceptedAt: new Date(),
    ageConfirmedAt: ageConfirmed ? new Date() : null,
  });
  createdUsers.push(id);
  return id;
}

afterAll(async () => {
  if (createdUsers.length) await db.delete(users).where(inArray(users.id, createdUsers));
});

/** Uma pessoa com atividade em quase todas as tabelas. */
async function activeUser() {
  const userId = await newUser();
  await savePlacement(
    userId,
    Object.fromEntries(placementQuestions.map((q) => [q.id, DONT_KNOW_OPTION_ID])),
  );
  await completeLesson(userId, "estrutura-de-um-bom-prompt");
  const practice = findModule("estrutura-de-um-bom-prompt")!.practice;
  const { attemptId } = await startPractice(userId, "estrutura-de-um-bom-prompt");
  for (const q of practice) await answerPractice(userId, "estrutura-de-um-bom-prompt", attemptId, q.id, q.correctOptionId);
  await submitPromptMission(userId, "monte-um-prompt", {
    contexto: "Sou estudante do ensino médio e tenho um seminário.",
    objetivo: "Monte um roteiro de 10 minutos sobre o ciclo da água.",
    formato: "Introdução, três partes e conclusão.",
    restricoes: "Linguagem simples e fontes oficiais.",
  });
  await db.insert(sessions).values({
    id: randomUUID(),
    token: `token-secreto-${randomUUID()}`,
    userId,
    expiresAt: new Date(Date.now() + 3600_000),
    ipAddress: "203.0.113.7",
    userAgent: "Navegador de teste",
  });
  return userId;
}

describe("ADR 0002 — idade mínima", () => {
  it("conta antiga registra a declaração de idade", async () => {
    const userId = await newUser(false);
    expect((await getAccount(userId))?.ageConfirmedAt).toBeNull();
    await confirmAge(userId);
    expect((await getAccount(userId))?.ageConfirmedAt).toBeInstanceOf(Date);
  });
});

describe("ADR 0002 — baixar meus dados", () => {
  it("traz tudo o que é da pessoa, sem senha nem tokens de sessão", async () => {
    const userId = await activeUser();
    const other = await activeUser();

    const data = await exportUserData(userId);
    expect(data).not.toBeNull();
    expect(data!.conta.email).toBe(`${userId}@teste.learnai.dev`);
    expect(data!.nivelamentos).toHaveLength(1);
    expect(data!.nivelamentos[0].respostas).toHaveLength(placementQuestions.length);
    expect(data!.praticas[0].respostas).toHaveLength(5);
    expect(data!.missoes).toHaveLength(1);
    expect(data!.xp.length).toBeGreaterThan(0);
    expect(data!.conquistas.map((c) => c.achievementId)).toContain("prompt-completo");
    expect(data!.sessoes).toEqual([
      expect.objectContaining({ ipAddress: "203.0.113.7", userAgent: "Navegador de teste" }),
    ]);

    const json = JSON.stringify(data);
    expect(json).not.toContain("token-secreto");
    expect(json).not.toMatch(/"password"/);
    expect(json).not.toContain(other); // nada de outra pessoa
  });
});

describe("ADR 0002 — excluir a conta apaga tudo", () => {
  it("a exclusão do usuário remove os dados de todas as tabelas", async () => {
    const userId = await activeUser();
    const attempts = await db.select({ id: placementAttempts.id }).from(placementAttempts).where(eq(placementAttempts.userId, userId));
    const practices = await db.select({ id: practiceAttempts.id }).from(practiceAttempts).where(eq(practiceAttempts.userId, userId));

    // Mesmo comando que o Better Auth executa ao excluir a conta.
    await db.delete(users).where(eq(users.id, userId));

    const leftovers = await Promise.all([
      db.select().from(moduleProgress).where(eq(moduleProgress.userId, userId)),
      db.select().from(placementAttempts).where(eq(placementAttempts.userId, userId)),
      db.select().from(placementAnswers).where(inArray(placementAnswers.attemptId, attempts.map((a) => a.id))),
      db.select().from(practiceAttempts).where(eq(practiceAttempts.userId, userId)),
      db.select().from(practiceAnswers).where(inArray(practiceAnswers.attemptId, practices.map((p) => p.id))),
      db.select().from(missionAttempts).where(eq(missionAttempts.userId, userId)),
      db.select().from(xpEvents).where(eq(xpEvents.userId, userId)),
      db.select().from(userAchievements).where(eq(userAchievements.userId, userId)),
      db.select().from(sessions).where(eq(sessions.userId, userId)),
    ]);
    expect(leftovers.map((rows) => rows.length)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(await exportUserData(userId)).toBeNull();
  });
});
