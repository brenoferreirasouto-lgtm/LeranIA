import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { type StepMission, findMission } from "@/content";
import { db } from "@/db";
import { missionAttempts, moduleProgress, userAchievements, users } from "@/db/schema";
import { NotFoundError } from "@/server/learning";
import {
  MissionLockedError,
  answerMissionStep,
  getMissionsOverview,
  startMission,
  submitPromptMission,
} from "@/server/missions";
import { ensureRewards, getTotalXp } from "@/server/rewards";

// Fase C2 — missões gravadas no banco de teste (ver vitest.config.mts).
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

async function seedCompleted(userId: string, slugs: string[]) {
  const now = new Date();
  for (const slug of slugs) {
    await db.insert(moduleProgress).values({
      userId,
      moduleSlug: slug,
      lessonCompletedAt: now,
      completedAt: now,
      bestScorePercent: 80,
      lastStep: "pratica",
      lastActivityAt: now,
    });
  }
  // Os módulos semeados rendem XP retroativo; concede agora para isolar o XP da missão.
  await ensureRewards(userId);
}

const conserte = findMission("conserte-o-prompt") as StepMission;

/** Faz uma tentativa completa acertando os `n` primeiros passos. */
async function missionRound(userId: string, mission: StepMission, correctCount: number) {
  const { attemptId } = await startMission(userId, mission.id);
  let last;
  for (const [i, step] of mission.steps.entries()) {
    const wrong = step.options.find((o) => !step.correctOptionIds.includes(o.id))!.id;
    const answer = i < correctCount ? step.correctOptionIds : [wrong];
    last = await answerMissionStep(userId, mission.id, attemptId, step.id, answer);
  }
  return { attemptId, outcome: last!.outcome! };
}

const goodPrompt = {
  contexto: "Sou estudante do ensino médio e tenho um seminário na semana que vem.",
  objetivo: "Monte um roteiro de 10 minutos sobre o ciclo da água.",
  formato: "Introdução, três partes e conclusão, em tópicos curtos.",
  restricoes: "Use linguagem simples e diga o que devo conferir em fontes oficiais.",
};

describe("C2 — missões em passos", () => {
  it("bloqueada até concluir o módulo que ela pratica", async () => {
    const userId = await newUser();
    await expect(startMission(userId, conserte.id)).rejects.toBeInstanceOf(MissionLockedError);
    const overview = await getMissionsOverview(userId);
    expect(overview.find((m) => m.id === conserte.id)?.status).toBe("bloqueada");
  });

  it("3 de 4 conclui e paga 30 XP; refazer não paga de novo", async () => {
    const userId = await newUser();
    await seedCompleted(userId, ["comparacao-de-prompts"]);

    const first = await missionRound(userId, conserte, 3);
    expect(first.outcome).toMatchObject({ correct: 3, total: 4, percent: 75, passed: true });
    expect(first.outcome.rewards.xp).toBe(30);

    const again = await missionRound(userId, conserte, 4);
    expect(again.outcome.passed).toBe(true);
    expect(again.outcome.rewards).toEqual({ xp: 0, achievements: [] });

    const overview = await getMissionsOverview(userId);
    expect(overview.find((m) => m.id === conserte.id)?.status).toBe("concluida");
  });

  it("2 de 4 não conclui nem paga; a primeira conclusão depois paga", async () => {
    const userId = await newUser();
    await seedCompleted(userId, ["comparacao-de-prompts"]);

    const failed = await missionRound(userId, conserte, 2);
    expect(failed.outcome.passed).toBe(false);
    expect(failed.outcome.rewards.xp).toBe(0);

    const passed = await missionRound(userId, conserte, 3);
    expect(passed.outcome.rewards.xp).toBe(30);
  });

  it("\"marque todas\" exige exatamente as corretas, e repetir a resposta devolve o mesmo feedback", async () => {
    const userId = await newUser();
    await seedCompleted(userId, ["comparacao-de-prompts"]);
    const { attemptId } = await startMission(userId, conserte.id);
    const step = conserte.steps[0]; // marque todas: a, b, c

    const partial = await answerMissionStep(userId, conserte.id, attemptId, step.id, ["a", "b"]);
    expect(partial.isCorrect).toBe(false);
    expect(partial.correctOptionIds).toEqual(["a", "b", "c"]);

    const repeated = await answerMissionStep(userId, conserte.id, attemptId, step.id, ["a", "b", "c"]);
    expect(repeated.isCorrect).toBe(false);
    expect(repeated.optionIds).toEqual(["a", "b"]);
  });

  it("recusa alternativa inválida e tentativa de outra pessoa", async () => {
    const userId = await newUser();
    const other = await newUser();
    await seedCompleted(userId, ["comparacao-de-prompts"]);
    const { attemptId } = await startMission(userId, conserte.id);
    const step = conserte.steps[1];

    await expect(answerMissionStep(userId, conserte.id, attemptId, step.id, ["z"])).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(answerMissionStep(userId, conserte.id, attemptId, step.id, ["a", "b"])).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(answerMissionStep(other, conserte.id, attemptId, step.id, ["b"])).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("Dados protegidos sai com o módulo de Privacidade e a missão dele", async () => {
    const userId = await newUser();
    await seedCompleted(userId, ["privacidade-e-dados"]);
    const mission = findMission("o-que-nao-colar") as StepMission;
    const { outcome } = await missionRound(userId, mission, 4);
    expect(outcome.rewards.achievements.map((a) => a.id)).toContain("dados-protegidos");
  });
});

describe("C2 — missão do construtor de prompt", () => {
  const missionId = "monte-um-prompt";

  it("bloqueada sem o módulo de estrutura de prompt", async () => {
    const userId = await newUser();
    await expect(submitPromptMission(userId, missionId, goodPrompt)).rejects.toBeInstanceOf(MissionLockedError);
  });

  it("com dados pessoais não conclui; completo conclui uma vez, com Prompt completo, e o texto não é gravado", async () => {
    const userId = await newUser();
    await seedCompleted(userId, ["estrutura-de-um-bom-prompt"]);

    const withEmail = await submitPromptMission(userId, missionId, {
      ...goodPrompt,
      contexto: `${goodPrompt.contexto} Meu e-mail é ana@exemplo.com.`,
    });
    expect(withEmail).toEqual({
      passed: false,
      problems: ["Tire os dados pessoais: encontramos e-mail."],
      rewards: { xp: 0, achievements: [] },
    });

    const ok = await submitPromptMission(userId, missionId, goodPrompt);
    expect(ok).toEqual({
      passed: true,
      problems: [],
      rewards: { xp: 30, achievements: [{ id: "prompt-completo", title: "Prompt completo" }] },
    });
    expect((await submitPromptMission(userId, missionId, goodPrompt)).rewards.xp).toBe(0);

    // Só o resultado fica gravado: nenhuma coluna guarda o texto.
    const rows = await db.select().from(missionAttempts).where(eq(missionAttempts.userId, userId));
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(Object.keys(row).sort()).toEqual(
        ["correct", "finishedAt", "id", "missionId", "passed", "startedAt", "total", "userId"].sort(),
      );
      expect(JSON.stringify(row)).not.toContain("ana@exemplo.com");
    }

    expect(await getTotalXp(userId)).toBe(30 + 50); // missão + o módulo semeado (aula 10 + conclusão 40)
    const earned = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
    expect(earned.map((e) => e.achievementId)).toContain("prompt-completo");
  });
});
