import { describe, expect, it } from "vitest";

import type { LearnerFacts } from "./gamification";
import { achievementEntitlements } from "./gamification";
import type { ModuleProgress } from "./scoring";
import { skillMap } from "./skills";

const day = (n: number) => new Date(Date.UTC(2026, 9, n, 12));

function facts(overrides: Partial<LearnerFacts> = {}): LearnerFacts {
  return {
    level: null,
    firstPlacement: null,
    progress: [],
    firstPractices: [],
    firstAssessment: null,
    firstPassedAssessment: null,
    missionsCompleted: [],
    assessmentSkillPasses: [],
    authoredProjects: [],
    ...overrides,
  };
}

function done(slug: string, at: Date): ModuleProgress {
  return { moduleSlug: slug, lessonCompletedAt: at, completedAt: at, bestScorePercent: 80, lastStep: "pratica", lastActivityAt: at };
}

const practiced = (slug: string, at = day(1)) => ({ id: slug, moduleSlug: slug, correct: 2, total: 5, at });

const stateOf = (f: LearnerFacts, skill: string) => skillMap(f).find((e) => e.skill === skill)!.state;

describe("mapa de habilidades — estados", () => {
  it("sem atividade, todas ainda não praticadas, na ordem das trilhas", () => {
    const map = skillMap(facts());
    expect(map.map((e) => e.skill)).toEqual(["conceitos", "prompts", "alucinacoes", "verificacao", "privacidade"]);
    expect(map.every((e) => e.state === "nao-praticada")).toBe(true);
  });

  it("na Trilha Avançada, conceitos fica dispensada pelo nivelamento até ser praticada", () => {
    expect(stateOf(facts({ level: "avancado" }), "conceitos")).toBe("dispensada");
    // Prompts tem um módulo obrigatório na Avançada, então não é dispensada.
    expect(stateOf(facts({ level: "avancado" }), "prompts")).toBe("nao-praticada");
    expect(stateOf(facts({ level: "avancado", firstPractices: [practiced("introducao-ia-generativa")] }), "conceitos")).toBe(
      "em-pratica",
    );
  });

  it("prompts tem dois módulos: com um só concluído, segue em prática e diz o que falta", () => {
    const entry = skillMap(
      facts({ progress: [done("estrutura-de-um-bom-prompt", day(2))], firstPractices: [practiced("estrutura-de-um-bom-prompt")] }),
    ).find((e) => e.skill === "prompts")!;
    expect(entry.state).toBe("em-pratica");
    expect(entry.pendingSlugs).toEqual(["comparacao-de-prompts"]);
  });

  it("um módulo concluído conta como prática feita, mesmo sem a tentativa gravada", () => {
    expect(stateOf(facts({ progress: [done("estrutura-de-um-bom-prompt", day(2))] }), "prompts")).toBe("em-pratica");
  });

  it("todos os módulos concluídos: praticada; com 70% no tema da avaliação: confirmada", () => {
    const progress = [done("alucinacoes", day(3))];
    expect(stateOf(facts({ progress }), "alucinacoes")).toBe("praticada");

    const confirmed = skillMap(facts({ progress, assessmentSkillPasses: [{ skill: "alucinacoes", at: day(5) }] })).find(
      (e) => e.skill === "alucinacoes",
    )!;
    expect(confirmed).toMatchObject({ state: "confirmada", confirmedAt: day(5) });
  });

  it("acertar na avaliação antes de concluir o módulo opcional confirma só quando o módulo é concluído", () => {
    const entry = skillMap(
      facts({
        level: "avancado",
        progress: [done("introducao-ia-generativa", day(9))],
        assessmentSkillPasses: [{ skill: "conceitos", at: day(5) }],
      }),
    ).find((e) => e.skill === "conceitos")!;
    expect(entry).toMatchObject({ state: "confirmada", confirmedAt: day(9) });
  });
});

describe("conquista Todas as habilidades", () => {
  it("exige as cinco confirmadas, na data da última", () => {
    const slugs = [
      "introducao-ia-generativa",
      "estrutura-de-um-bom-prompt",
      "comparacao-de-prompts",
      "alucinacoes",
      "verificar-informacoes",
      "privacidade-e-dados",
    ];
    const progress = slugs.map((slug) => done(slug, day(2)));
    const passes = (["conceitos", "prompts", "alucinacoes", "verificacao", "privacidade"] as const).map((skill, i) => ({
      skill,
      at: day(10 + i),
    }));

    const four = achievementEntitlements(facts({ progress, assessmentSkillPasses: passes.slice(1) }));
    expect(four.map((a) => a.achievementId)).not.toContain("todas-as-habilidades");

    const all = achievementEntitlements(facts({ progress, assessmentSkillPasses: passes }));
    expect(all).toContainEqual({ achievementId: "todas-as-habilidades", earnedAt: day(14) });
  });
});
