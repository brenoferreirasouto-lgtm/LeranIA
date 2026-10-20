import { describe, expect, it } from "vitest";

import {
  DONT_KNOW_OPTION_ID,
  finalAssessment,
  LEVEL_RULES,
  type Level,
  type Question,
  modules,
  placementQuestions,
  tracks,
} from "./index";

/*
 * Protege o conteúdo contra erros de edição: ids repetidos, gabarito
 * apontando para alternativa inexistente, trilha com módulo que não existe.
 */

const allQuestions: Question[] = [
  ...placementQuestions,
  ...modules.flatMap((m) => m.practice),
  ...finalAssessment.questions,
];

describe("conteúdo — integridade", () => {
  it("os módulos têm slugs únicos", () => {
    const slugs = modules.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("as questões têm ids únicos em todo o conteúdo", () => {
    const ids = allQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(allQuestions.map((q) => [q.id, q] as const))(
    "%s: gabarito válido, alternativas únicas e explicação",
    (_id, question) => {
      const optionIds = question.options.map((o) => o.id);
      expect(new Set(optionIds).size).toBe(optionIds.length);
      // Comparação de prompts (SP07) usa pares; as demais têm ao menos 3 alternativas.
      expect(question.options.length).toBeGreaterThanOrEqual(question.optionStyle === "prompt" ? 2 : 3);
      expect(optionIds).toContain(question.correctOptionId);
      expect(question.correctOptionId).not.toBe(DONT_KNOW_OPTION_ID);
      expect(question.explanation.trim().length).toBeGreaterThan(20);
    },
  );

  it("todas as questões do nivelamento oferecem \"Ainda não sei\"", () => {
    for (const q of placementQuestions) {
      expect(q.options.map((o) => o.id)).toContain(DONT_KNOW_OPTION_ID);
    }
  });

  it("os módulos citam histórias com IDs do backlog (SP/U)", () => {
    for (const m of modules) {
      expect(m.storyIds.length).toBeGreaterThan(0);
      for (const id of m.storyIds) expect(id).toMatch(/^(SP\d{2}|U\d{2})$/);
    }
  });

  it("a avaliação final cobre todos os temas dos módulos, com pelo menos 2 questões cada", () => {
    const skills = new Set(modules.map((m) => m.skill));
    for (const skill of skills) {
      const count = finalAssessment.questions.filter((q) => q.skill === skill).length;
      expect(count, skill).toBeGreaterThanOrEqual(2);
    }
  });

  it("a avaliação final não repete questões da prática", () => {
    const key = (q: Question) => [q.scenario, q.sample?.text, q.prompt].join("|");
    const practice = new Set(modules.flatMap((m) => m.practice.map(key)));
    for (const q of finalAssessment.questions) {
      expect(practice.has(key(q)), q.id).toBe(false);
    }
  });

  it("todo módulo está em todas as trilhas", () => {
    for (const level of ["iniciante", "intermediario", "avancado"] as const) {
      const slugs = tracks[level].steps.map((s) => s.moduleSlug).sort();
      expect(slugs).toEqual(modules.map((m) => m.slug).sort());
    }
  });

  it("cada módulo tem aula e prática", () => {
    for (const m of modules) {
      expect(m.lesson.length).toBeGreaterThan(0);
      expect(m.practice.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("trilhas", () => {
  const levels: Level[] = ["iniciante", "intermediario", "avancado"];

  it.each(levels)("a trilha %s usa só módulos existentes, cada um uma vez", (level) => {
    const slugs = tracks[level].steps.map((s) => s.moduleSlug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(modules.map((m) => m.slug)).toContain(slug);
  });

  it.each(levels)("a trilha %s tem pelo menos um módulo obrigatório", (level) => {
    expect(tracks[level].steps.some((s) => !s.optional)).toBe(true);
  });

  it("as faixas de nível cobrem de 0 a 100% em ordem", () => {
    const limits = LEVEL_RULES.map((r) => r.maxPercent);
    expect([...limits].sort((a, b) => a - b)).toEqual(limits);
    expect(limits.at(-1)).toBe(100);
  });
});
