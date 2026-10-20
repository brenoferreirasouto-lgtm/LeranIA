import { describe, expect, it } from "vitest";

import {
  PROJECT_LIMITS,
  type ProjectSnapshot,
  aboutSchema,
  aiLogSchema,
  authoredAt,
  createProjectSchema,
  projectChecklist,
  projectDone,
  projectEventLabel,
  projectPersonalData,
  referenceSchema,
  stageDone,
  taskSchema,
} from "./projects";

const d = (iso: string) => new Date(iso);

function project(overrides: Partial<ProjectSnapshot> = {}): ProjectSnapshot {
  return {
    title: "Energia solar",
    goal: "",
    audience: "",
    problem: "",
    noAiMarkedAt: null,
    stages: [
      { id: "s1", title: "Pesquisar", tasks: [{ id: "t1", text: "Ler", doneAt: null }] },
      { id: "s2", title: "Produzir", tasks: [{ id: "t2", text: "Escrever", doneAt: null }] },
    ],
    references: [],
    aiLogs: [],
    ...overrides,
  };
}

/** Projeto com todas as etapas feitas, uma referência conferida e "não usei IA". */
function finished(): ProjectSnapshot {
  return project({
    noAiMarkedAt: d("2026-10-20T10:00:00Z"),
    stages: [
      { id: "s1", title: "Pesquisar", tasks: [{ id: "t1", text: "Ler", doneAt: d("2026-10-20T11:00:00Z") }] },
      { id: "s2", title: "Produzir", tasks: [{ id: "t2", text: "Escrever", doneAt: d("2026-10-20T12:00:00Z") }] },
    ],
    references: [{ id: "r1", title: "IBGE", url: null, note: "", verifiedAt: d("2026-10-20T09:00:00Z") }],
  });
}

describe("etapas", () => {
  it("uma etapa sem tarefas não está concluída", () => {
    expect(stageDone({ id: "s", title: "Vazia", tasks: [] })).toBe(false);
  });

  it("a etapa conclui quando todas as tarefas estão feitas, e o projeto quando todas as etapas concluem", () => {
    const p = finished();
    expect(p.stages.every(stageDone)).toBe(true);
    expect(projectDone(p)).toBe(true);
    expect(projectDone(project())).toBe(false);
    expect(projectDone(project({ stages: [] }))).toBe(false);
  });
});

describe("conquista Projeto autoral (ADR 0002, decisão 12)", () => {
  it("vale na data em que o último critério foi cumprido", () => {
    expect(authoredAt(finished())).toEqual(d("2026-10-20T12:00:00Z"));
  });

  it("exige todas as etapas concluídas", () => {
    const p = finished();
    p.stages[1].tasks[0].doneAt = null;
    expect(authoredAt(p)).toBeNull();
  });

  it("exige pelo menos uma referência conferida", () => {
    const p = finished();
    p.references[0].verifiedAt = null;
    expect(authoredAt(p)).toBeNull();
    expect(authoredAt({ ...finished(), references: [] })).toBeNull();
  });

  it("exige o uso de IA registrado, ou \"não usei IA\"", () => {
    expect(authoredAt({ ...finished(), noAiMarkedAt: null })).toBeNull();
    const withLog = {
      ...finished(),
      noAiMarkedAt: null,
      aiLogs: [{ id: "l1", tool: "Chat", purpose: "Ideias", change: "Conferi", createdAt: d("2026-10-20T13:00:00Z") }],
    };
    expect(authoredAt(withLog)).toEqual(d("2026-10-20T13:00:00Z"));
  });
});

describe("lista de conferência", () => {
  it("começa com o que falta e explica como resolver", () => {
    const list = projectChecklist(project());
    expect(list.map((c) => c.id)).toEqual(["objetivo", "publico", "problema", "tarefas", "referencia", "ia", "dados"]);
    expect(list.filter((c) => c.ok).map((c) => c.id)).toEqual(["tarefas", "dados"]);
    expect(list.every((c) => c.tip.length > 0)).toBe(true);
  });

  it("fica toda em dia num projeto completo", () => {
    const p = {
      ...finished(),
      goal: "Apresentar um seminário de dez minutos para a turma",
      audience: "Turma do 2º ano",
      problem: "Como a energia do sol vira eletricidade em casa?",
    };
    expect(projectChecklist(p).every((c) => c.ok)).toBe(true);
  });

  it("aponta dados pessoais em qualquer campo do projeto", () => {
    const p = project({
      references: [{ id: "r1", title: "Contato", url: null, note: "ana@escola.com", verifiedAt: null }],
      stages: [{ id: "s1", title: "Produzir", tasks: [{ id: "t1", text: "Ligar para (11) 98765-4321", doneAt: null }] }],
    });
    expect(projectPersonalData(p)).toEqual(["e-mail", "telefone"]);
    const item = projectChecklist(p).find((c) => c.id === "dados")!;
    expect(item.ok).toBe(false);
    expect(item.tip).toBe("Encontramos e-mail e telefone. Troque por algo genérico.");
  });

  it("uma etapa sem tarefas fica pendente", () => {
    const p = project({ stages: [{ id: "s1", title: "Vazia", tasks: [] }] });
    expect(projectChecklist(p).find((c) => c.id === "tarefas")!.ok).toBe(false);
  });
});

describe("validação dos formulários", () => {
  it("exige título e limita o tamanho", () => {
    expect(createProjectSchema.safeParse({ templateId: "seminario", title: "  " }).success).toBe(false);
    expect(createProjectSchema.safeParse({ templateId: "../x", title: "Ok" }).success).toBe(false);
    const long = "a".repeat(PROJECT_LIMITS.title + 1);
    expect(createProjectSchema.safeParse({ templateId: "seminario", title: long }).success).toBe(false);
    expect(createProjectSchema.parse({ templateId: "seminario", title: "  Energia  " }).title).toBe("Energia");
  });

  it("objetivo, público e problema podem ficar vazios, mas têm limite", () => {
    expect(aboutSchema.safeParse({ title: "T", goal: "", audience: "", problem: "" }).success).toBe(true);
    const long = "a".repeat(PROJECT_LIMITS.about + 1);
    expect(aboutSchema.safeParse({ title: "T", goal: long, audience: "", problem: "" }).success).toBe(false);
  });

  it("tarefa não pode ser vazia", () => {
    expect(taskSchema.safeParse({ text: "   " }).success).toBe(false);
    expect(taskSchema.safeParse({ text: "Ler o enunciado" }).success).toBe(true);
  });

  it("link da referência é opcional, mas só http ou https", () => {
    expect(referenceSchema.safeParse({ title: "IBGE", url: "", note: "" }).success).toBe(true);
    expect(referenceSchema.safeParse({ title: "IBGE", url: "https://www.ibge.gov.br", note: "" }).success).toBe(true);
    expect(referenceSchema.safeParse({ title: "IBGE", url: "javascript:alert(1)", note: "" }).success).toBe(false);
    expect(referenceSchema.safeParse({ title: "IBGE", url: "ibge.gov.br", note: "" }).success).toBe(false);
  });

  it("o registro de IA pede ferramenta, para quê e o que a pessoa fez", () => {
    expect(aiLogSchema.safeParse({ tool: "Chat", purpose: "Ideias", change: "" }).success).toBe(false);
    expect(aiLogSchema.safeParse({ tool: "Chat", purpose: "Ideias", change: "Conferi as datas" }).success).toBe(true);
  });
});

describe("histórico", () => {
  it("descreve cada evento sem repetir o texto escrito pela pessoa", () => {
    expect(projectEventLabel("tarefa-concluida", "Pesquisar")).toBe('Tarefa concluída em "Pesquisar"');
    expect(projectEventLabel("etapa-concluida", "Pesquisar")).toBe("Etapa concluída: Pesquisar");
    expect(projectEventLabel("referencia-conferida", null)).toBe("Referência marcada como conferida");
    expect(projectEventLabel("projeto-concluido", null)).toBe("Todas as etapas concluídas");
  });
});
