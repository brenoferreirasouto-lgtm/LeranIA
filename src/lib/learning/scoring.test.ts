import { describe, expect, it } from "vitest";

import { DONT_KNOW_OPTION_ID, placementQuestions, tracks } from "@/content";

import {
  IncompletePlacementError,
  type ModuleProgress,
  gradePlacement,
  levelForPercent,
  moduleStatus,
  nextActivity,
  percentOf,
  practicePassed,
  summarizeTrack,
} from "./scoring";

/** Responde o nivelamento acertando as `n` primeiras questões e marcando "Ainda não sei" nas demais. */
function answersWithCorrect(n: number) {
  return Object.fromEntries(
    placementQuestions.map((q, i) => [q.id, i < n ? q.correctOptionId : DONT_KNOW_OPTION_ID]),
  );
}

function progress(partial: Partial<ModuleProgress> & { moduleSlug: string }): ModuleProgress {
  return {
    lessonCompletedAt: null,
    completedAt: null,
    bestScorePercent: null,
    lastStep: null,
    lastActivityAt: null,
    ...partial,
  };
}

describe("SP02/SP03 — nivelamento", () => {
  it("calcula percentual arredondado", () => {
    expect(percentOf(2, 3)).toBe(67);
    expect(percentOf(0, 0)).toBe(0);
  });

  it.each([
    [0, "iniciante"],
    [40, "iniciante"],
    [41, "intermediario"],
    [75, "intermediario"],
    [76, "avancado"],
    [100, "avancado"],
  ] as const)("%i%% resulta em %s", (percent, level) => {
    expect(levelForPercent(percent)).toBe(level);
  });

  it.each([
    [4, "iniciante"],
    [5, "intermediario"],
    [7, "intermediario"],
    [8, "avancado"],
  ] as const)("%i acertos em 10 resultam em %s", (correct, level) => {
    const result = gradePlacement(answersWithCorrect(correct));
    expect(result.correct).toBe(correct);
    expect(result.total).toBe(placementQuestions.length);
    expect(result.level).toBe(level);
  });

  it("conta \"Ainda não sei\" como resposta errada", () => {
    const result = gradePlacement(answersWithCorrect(0));
    expect(result.correct).toBe(0);
    expect(result.graded.every((g) => g.optionId === DONT_KNOW_OPTION_ID)).toBe(true);
  });

  it("recusa nivelamento com questão sem resposta e diz quais faltam", () => {
    const answers = answersWithCorrect(10);
    delete answers["niv-q3"];
    delete answers["niv-q7"];
    expect(() => gradePlacement(answers)).toThrow(IncompletePlacementError);
    try {
      gradePlacement(answers);
    } catch (error) {
      expect((error as IncompletePlacementError).missing).toEqual(["niv-q3", "niv-q7"]);
    }
  });

  it("recusa alternativa que não existe na questão", () => {
    expect(() => gradePlacement({ ...answersWithCorrect(10), "niv-q1": "z" })).toThrow(
      IncompletePlacementError,
    );
  });

  it("agrupa acertos por habilidade", () => {
    const result = gradePlacement(answersWithCorrect(10));
    const totals = Object.values(result.bySkill).reduce((sum, s) => sum + (s?.total ?? 0), 0);
    expect(totals).toBe(placementQuestions.length);
    expect(result.bySkill.conceitos).toEqual({ correct: 3, total: 3 });
  });
});

describe("prática", () => {
  it("aprova a partir de 70%", () => {
    expect(practicePassed(80)).toBe(true);
    expect(practicePassed(70)).toBe(true);
    expect(practicePassed(60)).toBe(false);
  });
});

describe("U03/SP09 — situação dos módulos e da trilha", () => {
  it("classifica o módulo pelo que foi feito", () => {
    expect(moduleStatus(undefined)).toBe("disponivel");
    expect(moduleStatus(progress({ moduleSlug: "x", lastActivityAt: new Date() }))).toBe("em-andamento");
    expect(moduleStatus(progress({ moduleSlug: "x", completedAt: new Date() }))).toBe("concluido");
  });

  it("calcula o progresso só com módulos obrigatórios", () => {
    const summary = summarizeTrack(tracks.intermediario, [
      progress({ moduleSlug: "introducao-ia-generativa", completedAt: new Date() }), // opcional
      progress({ moduleSlug: "alucinacoes", completedAt: new Date() }),
    ]);
    expect(summary.requiredTotal).toBe(3);
    expect(summary.requiredDone).toBe(1);
    expect(summary.percent).toBe(33);
  });
});

describe("SP05 — continuar de onde parou", () => {
  const t = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000);

  it("sem atividade, começa pelo primeiro módulo obrigatório", () => {
    expect(nextActivity(tracks.iniciante, [])).toEqual({
      moduleSlug: "introducao-ia-generativa",
      step: "aula",
      kind: "comecar",
    });
  });

  it("retoma a atividade mais recente não concluída", () => {
    const result = nextActivity(tracks.iniciante, [
      progress({ moduleSlug: "introducao-ia-generativa", lastActivityAt: t(60), lastStep: "aula" }),
      progress({
        moduleSlug: "alucinacoes",
        lastActivityAt: t(5),
        lessonCompletedAt: t(6),
        lastStep: "pratica",
      }),
    ]);
    expect(result).toEqual({ moduleSlug: "alucinacoes", step: "pratica", kind: "continuar" });
  });

  it("ignora módulos concluídos e segue para o próximo obrigatório", () => {
    const result = nextActivity(tracks.iniciante, [
      progress({ moduleSlug: "introducao-ia-generativa", completedAt: t(10), lastActivityAt: t(10) }),
    ]);
    expect(result).toEqual({ moduleSlug: "estrutura-de-um-bom-prompt", step: "aula", kind: "comecar" });
  });

  it("depois dos obrigatórios, sugere os opcionais; no fim, nada", () => {
    const required = tracks.avancado.steps.filter((s) => !s.optional);
    const done = required.map((s) => progress({ moduleSlug: s.moduleSlug, completedAt: t(1) }));
    expect(nextActivity(tracks.avancado, done)?.moduleSlug).toBe("estrutura-de-um-bom-prompt");

    const all = tracks.avancado.steps.map((s) => progress({ moduleSlug: s.moduleSlug, completedAt: t(1) }));
    expect(nextActivity(tracks.avancado, all)).toBeNull();
  });
});
