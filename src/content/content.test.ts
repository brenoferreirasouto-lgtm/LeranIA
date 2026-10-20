import { describe, expect, it } from "vitest";

import {
  DONT_KNOW_OPTION_ID,
  MISSION_PASS_PERCENT,
  STAGES,
  XP_RULES,
  achievements,
  missions,
  finalAssessment,
  LEVEL_RULES,
  type Level,
  type Question,
  modules,
  placementQuestions,
  projectTemplates,
  tracks,
} from "./index";
import { PROJECT_LIMITS, createProjectSchema } from "../lib/projects";

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

describe("gamificação — catálogo", () => {
  it("as conquistas têm ids únicos e em formato de slug", () => {
    const ids = achievements.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it("conquistas de prática apontam para módulos existentes", () => {
    for (const a of achievements) {
      if (a.criterion.kind === "perfect-first-practice") {
        expect(modules.some((m) => m.slug === (a.criterion as { moduleSlug: string }).moduleSlug)).toBe(true);
      }
    }
  });

  it("os estágios começam em 0 XP, em ordem crescente e sem repetir", () => {
    expect(STAGES[0]).toEqual({ stage: 1, minXp: 0 });
    for (let i = 1; i < STAGES.length; i++) {
      expect(STAGES[i].stage).toBe(STAGES[i - 1].stage + 1);
      expect(STAGES[i].minXp).toBeGreaterThan(STAGES[i - 1].minXp);
    }
  });

  it("todos os valores de XP são inteiros positivos", () => {
    for (const value of Object.values(XP_RULES)) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
    }
  });
});

describe("missões — integridade", () => {
  const steps = missions.flatMap((m) => (m.kind === "steps" ? m.steps : []));

  it("missões e passos têm ids únicos, e os passos não repetem ids de questões", () => {
    const ids = missions.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    const stepIds = steps.map((s) => s.id);
    expect(new Set(stepIds).size).toBe(stepIds.length);
    const questionIds = new Set(allQuestions.map((q) => q.id));
    for (const id of stepIds) expect(questionIds.has(id)).toBe(false);
  });

  it("cada passo tem gabarito válido, explicação e dica", () => {
    for (const step of steps) {
      const optionIds = step.options.map((o) => o.id);
      expect(new Set(optionIds).size, step.id).toBe(optionIds.length);
      expect(step.correctOptionIds.length, step.id).toBeGreaterThan(0);
      for (const id of step.correctOptionIds) expect(optionIds, step.id).toContain(id);
      if (!step.multiple) expect(step.correctOptionIds, step.id).toHaveLength(1);
      // "Marque todas" precisa de pelo menos uma alternativa que não se aplica.
      if (step.multiple) expect(step.correctOptionIds.length, step.id).toBeLessThan(optionIds.length);
      expect(step.explanation.length, step.id).toBeGreaterThan(20);
      expect(step.hint.length, step.id).toBeGreaterThan(10);
    }
  });

  it("toda missão em passos pode ser concluída e tem tolerância a erro", () => {
    for (const m of missions) {
      if (m.kind !== "steps") continue;
      // Com 4 ou mais passos, dá para errar um e ainda concluir (70%).
      expect(m.steps.length, m.id).toBeGreaterThanOrEqual(4);
      expect(Math.round(((m.steps.length - 1) / m.steps.length) * 100), m.id).toBeGreaterThanOrEqual(
        MISSION_PASS_PERCENT,
      );
    }
  });

  it("as missões liberam por módulos que existem e pagam XP positivo", () => {
    for (const m of missions) {
      if (m.unlock.kind === "module") {
        const slug = m.unlock.moduleSlug;
        expect(modules.some((mod) => mod.slug === slug), m.id).toBe(true);
      }
      expect(Number.isInteger(m.xp) && m.xp > 0, m.id).toBe(true);
    }
  });

  it("conquistas de missão apontam para missões e módulos existentes", () => {
    for (const a of achievements) {
      const c = a.criterion;
      if (c.kind === "mission-completed" || c.kind === "module-and-mission") {
        expect(missions.some((m) => m.id === c.missionId), a.id).toBe(true);
      }
      if (c.kind === "module-and-mission") {
        expect(modules.some((m) => m.slug === c.moduleSlug), a.id).toBe(true);
      }
    }
  });
});

describe("modelos do Laboratório — integridade", () => {
  it("os modelos têm ids únicos, aceitos pelo formulário de criação", () => {
    const ids = projectTemplates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of projectTemplates) {
      expect(createProjectSchema.safeParse({ templateId: t.id, title: "Teste" }).success, t.id).toBe(true);
    }
  });

  it("cada modelo tem etapas com nomes únicos e tarefas sugeridas dentro dos limites", () => {
    for (const t of projectTemplates) {
      expect(t.stages.length, t.id).toBeGreaterThanOrEqual(3);
      const titles = t.stages.map((s) => s.title);
      expect(new Set(titles).size, t.id).toBe(titles.length);
      for (const stage of t.stages) {
        expect(stage.tasks.length, stage.title).toBeGreaterThan(0);
        expect(stage.tasks.length, stage.title).toBeLessThanOrEqual(PROJECT_LIMITS.tasksPerStage);
        for (const task of stage.tasks) expect(task.length, task).toBeLessThanOrEqual(PROJECT_LIMITS.task);
      }
    }
  });
});
