import { describe, expect, it } from "vitest";

import { finalAssessment, missions, modules, tracks } from "@/content";

import {
  type LearnerFacts,
  achievementEntitlements,
  entitledRewards,
  stageFor,
  xpEntitlements,
  xpEventLabel,
} from "./gamification";
import type { ModuleProgress } from "./scoring";

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
    ...overrides,
  };
}

function completed(slug: string, at: Date): ModuleProgress {
  return {
    moduleSlug: slug,
    lessonCompletedAt: at,
    completedAt: at,
    bestScorePercent: 80,
    lastStep: "pratica",
    lastActivityAt: at,
  };
}

const sum = (xs: { points: number }[]) => xs.reduce((s, x) => s + x.points, 0);

describe("XP — o que cada atividade paga", () => {
  it("sem atividade, nada a pagar e nenhuma conquista", () => {
    expect(entitledRewards(facts())).toEqual({ xp: [], achievements: [] });
  });

  it("nivelamento paga 20 XP fixos, ligados à primeira tentativa", () => {
    const xp = xpEntitlements(facts({ firstPlacement: { id: "p1", at: day(1) } }));
    expect(xp).toEqual([
      { source: "nivelamento", sourceId: "nivelamento", attemptId: "p1", points: 20, earnedAt: day(1) },
    ]);
  });

  it("módulo com 4 de 5 na primeira tentativa: aula 10 + prática 40 + conclusão 40", () => {
    const xp = xpEntitlements(
      facts({
        progress: [completed("alucinacoes", day(3))],
        firstPractices: [{ id: "a1", moduleSlug: "alucinacoes", correct: 4, total: 5, at: day(2) }],
      }),
    );
    expect(xp.map((x) => [x.source, x.points])).toEqual([
      ["aula", 10],
      ["modulo", 40],
      ["pratica", 40],
    ]);
    expect(sum(xp)).toBe(90);
  });

  it("os acertos que valem são os da primeira tentativa; quem refaz e passa ganha a conclusão", () => {
    // Primeira tentativa 3 de 5 (reprovada); a conclusão veio numa tentativa posterior.
    const xp = xpEntitlements(
      facts({
        progress: [completed("alucinacoes", day(5))],
        firstPractices: [{ id: "a1", moduleSlug: "alucinacoes", correct: 3, total: 5, at: day(2) }],
      }),
    );
    expect(xp.find((x) => x.source === "pratica")).toMatchObject({ attemptId: "a1", points: 30 });
    expect(xp.find((x) => x.source === "modulo")).toMatchObject({ points: 40, earnedAt: day(5) });
  });

  it("primeira tentativa sem acertos não gera pagamento de prática", () => {
    const xp = xpEntitlements(
      facts({ firstPractices: [{ id: "a1", moduleSlug: "alucinacoes", correct: 0, total: 5, at: day(2) }] }),
    );
    expect(xp).toEqual([]);
  });

  it("aula concluída sem prática paga só a aula", () => {
    const xp = xpEntitlements(
      facts({
        progress: [
          {
            moduleSlug: "alucinacoes",
            lessonCompletedAt: day(1),
            completedAt: null,
            bestScorePercent: null,
            lastStep: "aula",
            lastActivityAt: day(1),
          },
        ],
      }),
    );
    expect(xp).toEqual([{ source: "aula", sourceId: "alucinacoes", attemptId: null, points: 10, earnedAt: day(1) }]);
  });

  it("avaliação: acertos da primeira tentativa + 50 na primeira aprovação, cada um com sua tentativa", () => {
    const xp = xpEntitlements(
      facts({
        firstAssessment: { id: "t1", correct: 7, total: 12, at: day(10) },
        firstPassedAssessment: { id: "t2", at: day(11) },
      }),
    );
    expect(xp).toEqual([
      { source: "avaliacao", sourceId: finalAssessment.id, attemptId: "t1", points: 70, earnedAt: day(10) },
      { source: "aprovacao", sourceId: finalAssessment.id, attemptId: "t2", points: 50, earnedAt: day(11) },
    ]);
  });

  it("módulos que não existem mais no conteúdo são ignorados", () => {
    const xp = xpEntitlements(
      facts({
        progress: [completed("modulo-removido", day(1))],
        firstPractices: [{ id: "x", moduleSlug: "modulo-removido", correct: 5, total: 5, at: day(1) }],
      }),
    );
    expect(xp).toEqual([]);
  });

  it("o máximo da Trilha Iniciante é 790 XP, como na proposta aprovada", () => {
    const all = tracks.iniciante.steps.map((s) => s.moduleSlug);
    const xp = xpEntitlements(
      facts({
        firstPlacement: { id: "p", at: day(1) },
        progress: all.map((slug) => completed(slug, day(2))),
        firstPractices: all.map((slug) => ({
          id: slug,
          moduleSlug: slug,
          correct: 5,
          total: 5,
          at: day(2),
        })),
        firstAssessment: { id: "t", correct: 12, total: 12, at: day(3) },
        firstPassedAssessment: { id: "t", at: day(3) },
      }),
    );
    expect(sum(xp)).toBe(790);
  });
});

describe("conquistas — critérios", () => {
  const ids = (f: LearnerFacts) => achievementEntitlements(f).map((a) => a.achievementId);

  it("nivelamento concede Ponto de partida na data do primeiro nivelamento", () => {
    expect(achievementEntitlements(facts({ firstPlacement: { id: "p", at: day(4) } }))).toEqual([
      { achievementId: "ponto-de-partida", earnedAt: day(4) },
    ]);
  });

  it("Primeiro módulo usa a data do módulo concluído mais antigo", () => {
    const got = achievementEntitlements(
      facts({ progress: [completed("alucinacoes", day(9)), completed("privacidade-e-dados", day(6))] }),
    );
    expect(got).toContainEqual({ achievementId: "primeiro-modulo", earnedAt: day(6) });
  });

  it("acertar tudo só depois da primeira tentativa não concede Olho nas alucinações", () => {
    const first = { id: "a1", moduleSlug: "alucinacoes", total: 5, at: day(2) };
    expect(ids(facts({ firstPractices: [{ ...first, correct: 4 }] }))).not.toContain("olho-nas-alucinacoes");
    expect(ids(facts({ firstPractices: [{ ...first, correct: 5 }] }))).toContain("olho-nas-alucinacoes");
  });

  it("Checagem certeira depende da prática de Verificar informações", () => {
    const got = ids(
      facts({
        firstPractices: [{ id: "v", moduleSlug: "verificar-informacoes", correct: 5, total: 5, at: day(2) }],
      }),
    );
    expect(got).toEqual(["checagem-certeira"]);
  });

  it("Trilha concluída exige todos os obrigatórios da trilha atual, e não os opcionais", () => {
    const required = tracks.avancado.steps.filter((s) => !s.optional).map((s) => s.moduleSlug);
    const progress = required.map((slug, i) => completed(slug, day(i + 1)));

    expect(ids(facts({ level: "avancado", progress: progress.slice(1) }))).not.toContain("trilha-concluida");
    expect(achievementEntitlements(facts({ level: "avancado", progress }))).toContainEqual({
      achievementId: "trilha-concluida",
      earnedAt: day(required.length),
    });
    // Os mesmos módulos não fecham a Trilha Iniciante, que tem 6 obrigatórios.
    expect(ids(facts({ level: "iniciante", progress }))).not.toContain("trilha-concluida");
  });

  it("sem nivelamento, vale a Trilha Iniciante", () => {
    const progress = modules.map((m) => completed(m.slug, day(2)));
    expect(ids(facts({ progress }))).toContain("trilha-concluida");
  });

  it("Aprovado usa a primeira tentativa aprovada", () => {
    expect(
      achievementEntitlements(facts({ firstPassedAssessment: { id: "t2", at: day(12) } })),
    ).toEqual([{ achievementId: "aprovado", earnedAt: day(12) }]);
  });
});

describe("estágios", () => {
  it.each([
    [0, 1, 60],
    [59, 1, 60],
    [60, 2, 180],
    [179, 2, 180],
    [180, 3, 330],
    [330, 4, 480],
    [479, 4, 480],
  ])("%i XP → estágio %i (próximo em %i)", (xp, stage, nextMin) => {
    const info = stageFor(xp);
    expect(info.stage).toBe(stage);
    expect(info.next?.minXp).toBe(nextMin);
  });

  it("a partir de 480 XP é o último estágio", () => {
    expect(stageFor(480)).toEqual({ xp: 480, stage: 5, minXp: 480, next: null });
    expect(stageFor(790).next).toBeNull();
  });
});

describe("histórico — textos", () => {
  it("nomeia cada origem de XP com o título do módulo", () => {
    expect(xpEventLabel("aula", "alucinacoes")).toBe("Aula concluída: Como identificar alucinações");
    expect(xpEventLabel("nivelamento", "nivelamento")).toBe("Nivelamento concluído");
    expect(xpEventLabel("aprovacao", finalAssessment.id)).toBe("Aprovação na avaliação final");
  });
});

describe("C2 — missões no XP e nas conquistas", () => {
  const ids = (f: LearnerFacts) => achievementEntitlements(f).map((a) => a.achievementId);

  it("cada missão concluída paga o XP da própria missão, ligado à tentativa", () => {
    const xp = xpEntitlements(
      facts({
        missionsCompleted: [
          { missionId: "conserte-o-prompt", attemptId: "m1", at: day(5) },
          { missionId: "trabalho-em-grupo", attemptId: "m2", at: day(6) },
          { missionId: "missao-removida", attemptId: "m3", at: day(6) },
        ],
      }),
    );
    expect(xp).toEqual([
      { source: "missao", sourceId: "conserte-o-prompt", attemptId: "m1", points: 30, earnedAt: day(5) },
      { source: "missao", sourceId: "trabalho-em-grupo", attemptId: "m2", points: 60, earnedAt: day(6) },
    ]);
  });

  it("as seis missões somam 210 XP, como na proposta", () => {
    const xp = xpEntitlements(
      facts({ missionsCompleted: missions.map((m, i) => ({ missionId: m.id, attemptId: `m${i}`, at: day(1) })) }),
    );
    expect(sum(xp)).toBe(210);
  });

  it("Prompt completo vem da missão do construtor", () => {
    expect(ids(facts({ missionsCompleted: [{ missionId: "monte-um-prompt", attemptId: "m", at: day(3) }] }))).toEqual([
      "prompt-completo",
    ]);
  });

  it("Dados protegidos exige o módulo e a missão, na data do que veio por último", () => {
    const mission = { missionId: "o-que-nao-colar", attemptId: "m", at: day(8) };
    expect(ids(facts({ missionsCompleted: [mission] }))).not.toContain("dados-protegidos");
    expect(ids(facts({ progress: [completed("privacidade-e-dados", day(4))] }))).not.toContain("dados-protegidos");
    expect(
      achievementEntitlements(facts({ progress: [completed("privacidade-e-dados", day(4))], missionsCompleted: [mission] })),
    ).toContainEqual({ achievementId: "dados-protegidos", earnedAt: day(8) });
  });

  it("Todas as missões exige as seis", () => {
    const all = missions.map((m, i) => ({ missionId: m.id, attemptId: `m${i}`, at: day(i + 1) }));
    expect(ids(facts({ missionsCompleted: all.slice(1) }))).not.toContain("todas-as-missoes");
    expect(achievementEntitlements(facts({ missionsCompleted: all }))).toContainEqual({
      achievementId: "todas-as-missoes",
      earnedAt: day(all.length),
    });
  });

  it("nomeia a missão no histórico", () => {
    expect(xpEventLabel("missao", "conserte-o-prompt")).toBe("Missão concluída: Conserte o prompt");
  });
});
