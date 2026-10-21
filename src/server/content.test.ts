import { describe, expect, it } from "vitest";

import { finalAssessment, missions, modules, placementQuestions } from "@/content";
import { toPublicStep } from "@/server/missions";

import { toPublicQuestion } from "./content";

/*
 * O gabarito e as explicações ficam no servidor: o que vai para o navegador
 * antes da resposta não pode dizer qual alternativa é a certa.
 */
const FORBIDDEN = ["correctOptionId", "correctOptionIds", "explanation", "skill"];

function keysDeep(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keysDeep);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => [k, ...keysDeep(v)]);
  }
  return [];
}

describe("conteúdo público, sem gabarito", () => {
  const questions = [...placementQuestions, ...modules.flatMap((m) => m.practice), ...finalAssessment.questions];

  it("nenhuma questão chega ao navegador com a resposta certa ou a explicação", () => {
    for (const q of questions) {
      const keys = keysDeep(toPublicQuestion(q));
      for (const key of FORBIDDEN) expect(keys, q.id).not.toContain(key);
      expect(JSON.stringify(toPublicQuestion(q)), q.id).not.toContain(q.explanation);
    }
  });

  it("nenhum passo de missão chega ao navegador com o gabarito ou a explicação", () => {
    for (const m of missions) {
      if (m.kind !== "steps") continue;
      for (const step of m.steps) {
        const keys = keysDeep(toPublicStep(step));
        for (const key of FORBIDDEN) expect(keys, step.id).not.toContain(key);
        expect(JSON.stringify(toPublicStep(step)), step.id).not.toContain(step.explanation);
      }
    }
  });
});
