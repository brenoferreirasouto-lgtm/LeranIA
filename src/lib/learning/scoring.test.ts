import { describe, expect, it } from "vitest";

import { DONT_KNOW_OPTION_ID, finalAssessment, placementQuestions, tracks } from "@/content";

import {
  IncompletePlacementError,
  IncompleteQuizError,
  type ModuleProgress,
  assessmentUnlocked,
  gradeAssessment,
  gradePlacement,
  levelForPercent,
  moduleStatus,
  nextActivity,
  percentOf,
  practiceAverage,
  practicePassed,
  recommend,
  skillScoresFrom,
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
    expect(summary.requiredTotal).toBe(5);
    expect(summary.requiredDone).toBe(1);
    expect(summary.percent).toBe(20);
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

describe("SP12 — avaliação final", () => {
  const allCorrect = () => Object.fromEntries(finalAssessment.questions.map((q) => [q.id, q.correctOptionId]));

  it("aprova com 70% ou mais", () => {
    const answers = allCorrect();
    const wrong = (id: string) => finalAssessment.questions.find((q) => q.id === id)!.options.find((o) => o.id !== answers[id])!.id;
    for (const id of ["aval-q1", "aval-q2", "aval-q3"]) answers[id] = wrong(id); // 9/12 = 75%
    const result = gradeAssessment(answers);
    expect(result).toMatchObject({ correct: 9, total: 12, percent: 75, passed: true });

    answers["aval-q4"] = wrong("aval-q4"); // 8/12 = 67%
    expect(gradeAssessment(answers).passed).toBe(false);
  });

  it("exige todas as respostas", () => {
    const answers = allCorrect();
    delete answers["aval-q12"];
    expect(() => gradeAssessment(answers)).toThrow(IncompleteQuizError);
  });

  it("só libera com todos os módulos obrigatórios concluídos", () => {
    const required = tracks.avancado.steps.filter((s) => !s.optional);
    const almost = required.slice(1).map((s) => progress({ moduleSlug: s.moduleSlug, completedAt: new Date() }));
    expect(assessmentUnlocked(summarizeTrack(tracks.avancado, almost))).toBe(false);
    const all = required.map((s) => progress({ moduleSlug: s.moduleSlug, completedAt: new Date() }));
    expect(assessmentUnlocked(summarizeTrack(tracks.avancado, all))).toBe(true);
  });

  it("recalcula acertos por tema a partir das respostas gravadas", () => {
    const bySkill = skillScoresFrom(finalAssessment.questions, [
      { questionId: "aval-q3", isCorrect: false },
      { questionId: "aval-q4", isCorrect: true },
      { questionId: "questao-removida", isCorrect: true },
    ]);
    expect(bySkill).toEqual({ alucinacoes: { correct: 1, total: 2 } });
  });
});

describe("SP10 — aproveitamento nas práticas", () => {
  it("faz a média das melhores notas dos módulos obrigatórios praticados", () => {
    const average = practiceAverage(tracks.intermediario, [
      progress({ moduleSlug: "alucinacoes", bestScorePercent: 80 }),
      progress({ moduleSlug: "privacidade-e-dados", bestScorePercent: 100 }),
      progress({ moduleSlug: "introducao-ia-generativa", bestScorePercent: 0 }), // opcional, fica de fora
    ]);
    expect(average).toBe(90);
  });

  it("sem práticas, não inventa número", () => {
    expect(practiceAverage(tracks.iniciante, [])).toBeNull();
  });
});

describe("SP11 — recomendações", () => {
  const allDone = (level: keyof typeof tracks) =>
    tracks[level].steps.map((s) => progress({ moduleSlug: s.moduleSlug, completedAt: new Date() }));

  it("recomenda revisar os módulos dos temas abaixo de 70% na avaliação, do mais fraco ao menos fraco", () => {
    const recs = recommend({
      track: tracks.iniciante,
      progress: allDone("iniciante"),
      assessmentBySkill: {
        alucinacoes: { correct: 1, total: 2 },
        prompts: { correct: 0, total: 3 },
        privacidade: { correct: 2, total: 2 },
      },
    });
    expect(recs.map((r) => r.moduleSlug)).toEqual([
      "estrutura-de-um-bom-prompt",
      "comparacao-de-prompts",
      "alucinacoes",
    ]);
    expect(recs[0]).toMatchObject({ kind: "revisar" });
    expect(recs[0].reason).toBe("Na avaliação final, você acertou 0 de 3 sobre prompts.");
  });

  it("sem avaliação, recomenda concluir os obrigatórios que faltam", () => {
    const recs = recommend({
      track: tracks.avancado,
      progress: [progress({ moduleSlug: "alucinacoes", completedAt: new Date() })],
      assessmentBySkill: null,
    });
    expect(recs.map((r) => r.moduleSlug)).toEqual([
      "verificar-informacoes",
      "comparacao-de-prompts",
      "privacidade-e-dados",
    ]);
    expect(recs.every((r) => r.kind === "concluir")).toBe(true);
  });

  it("com tudo concluído e bom desempenho, não recomenda nada", () => {
    const recs = recommend({
      track: tracks.iniciante,
      progress: allDone("iniciante"),
      assessmentBySkill: { prompts: { correct: 3, total: 3 } },
    });
    expect(recs).toEqual([]);
  });
});
