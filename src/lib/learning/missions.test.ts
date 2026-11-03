import { describe, expect, it } from "vitest";

import { type MissionStep, type StepMission, findMission, tracks } from "@/content";
import { EMPTY_FIELDS } from "@/lib/prompt-builder";

import {
  checkPromptMission,
  gradeStep,
  missionPassed,
  missionUnlocked,
  unlockText,
  validStepAnswer,
} from "./missions";
import type { ModuleProgress } from "./scoring";

const multi: MissionStep = {
  id: "t-1",
  skill: "prompts",
  prompt: "Marque todas",
  multiple: true,
  options: [
    { id: "a", text: "A" },
    { id: "b", text: "B" },
    { id: "c", text: "C" },
  ],
  correctOptionIds: ["a", "c"],
  explanation: "",
  hint: "",
};

const single: MissionStep = { ...multi, id: "t-2", multiple: false, correctOptionIds: ["b"] };

function done(slug: string): ModuleProgress {
  const at = new Date();
  return { moduleSlug: slug, lessonCompletedAt: at, completedAt: at, bestScorePercent: 80, lastStep: "pratica", lastActivityAt: at };
}

describe("missões — correção dos passos", () => {
  it("\"marque todas\" só conta com exatamente as alternativas corretas, em qualquer ordem", () => {
    expect(gradeStep(multi, ["c", "a"])).toBe(true);
    expect(gradeStep(multi, ["a"])).toBe(false); // faltou uma
    expect(gradeStep(multi, ["a", "b", "c"])).toBe(false); // marcou uma a mais
  });

  it("passo de uma alternativa", () => {
    expect(gradeStep(single, ["b"])).toBe(true);
    expect(gradeStep(single, ["a"])).toBe(false);
  });

  it("recusa respostas vazias, repetidas, inexistentes ou várias num passo de uma alternativa", () => {
    expect(validStepAnswer(multi, [])).toBe(false);
    expect(validStepAnswer(multi, ["a", "a"])).toBe(false);
    expect(validStepAnswer(multi, ["z"])).toBe(false);
    expect(validStepAnswer(single, ["a", "b"])).toBe(false);
    expect(validStepAnswer(multi, ["a", "b"])).toBe(true);
  });

  it("conclui com 70% dos passos: 3 de 4 e 4 de 5", () => {
    expect(missionPassed(3, 4)).toBe(true);
    expect(missionPassed(2, 4)).toBe(false);
    expect(missionPassed(4, 5)).toBe(true);
    expect(missionPassed(3, 5)).toBe(false);
  });
});

describe("missões — liberação", () => {
  const prompt = findMission("monte-um-prompt")!;
  const integradora = findMission("trabalho-em-grupo") as StepMission;

  it("a missão de módulo libera com o módulo concluído", () => {
    expect(missionUnlocked(prompt, tracks.iniciante, [])).toBe(false);
    expect(missionUnlocked(prompt, tracks.iniciante, [done("estrutura-de-um-bom-prompt")])).toBe(true);
    expect(unlockText(prompt)).toBe('Libera ao concluir o módulo "Estrutura de um bom prompt".');
  });

  it("a integradora libera com todos os obrigatórios da trilha", () => {
    const required = tracks.avancado.steps.filter((s) => !s.optional).map((s) => s.moduleSlug);
    expect(missionUnlocked(integradora, tracks.avancado, required.slice(1).map(done))).toBe(false);
    expect(missionUnlocked(integradora, tracks.avancado, required.map(done))).toBe(true);
  });
});

describe("missões — conferência do prompt", () => {
  const good = {
    contexto: "Sou estudante do ensino médio e tenho um seminário na semana que vem.",
    objetivo: "Monte um roteiro de 10 minutos sobre o ciclo da água.",
    formato: "Introdução, três partes e conclusão, em tópicos curtos.",
    restricoes: "Linguagem simples e diga o que devo conferir em fontes oficiais.",
  };

  it("passa com os quatro elementos e sem dados pessoais", () => {
    expect(checkPromptMission(good)).toEqual({ passed: true, problems: [] });
  });

  it("aponta cada elemento vazio ou curto", () => {
    const result = checkPromptMission({ ...EMPTY_FIELDS, objetivo: "Resuma." });
    expect(result.passed).toBe(false);
    expect(result.problems).toEqual([
      "Preencha o contexto.",
      "O objetivo está curto demais.",
      "Preencha o formato.",
      "Preencha as restrições.",
    ]);
  });

  it("não conclui com dados pessoais, mesmo com a estrutura completa", () => {
    const result = checkPromptMission({ ...good, contexto: `${good.contexto} Meu e-mail é ana@exemplo.com.` });
    expect(result.passed).toBe(false);
    expect(result.problems).toEqual(["Tire os dados pessoais: encontramos e-mail."]);
  });
});
