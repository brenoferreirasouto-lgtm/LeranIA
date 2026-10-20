import { describe, expect, it } from "vitest";

import {
  DONT_KNOW_OPTION_ID,
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
      expect(question.options.length).toBeGreaterThanOrEqual(3);
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
