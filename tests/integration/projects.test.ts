import { randomUUID } from "node:crypto";
import { and, count, eq, inArray } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { findProjectTemplate } from "@/content";
import { db } from "@/db";
import {
  missionAttempts,
  projectAiLogs,
  projectEvents,
  projectReferences,
  projectStages,
  projectTasks,
  projects,
  userAchievements,
  users,
} from "@/db/schema";
import { PROJECT_LIMITS } from "@/lib/projects";
import { exportUserData } from "@/server/account";
import { NotFoundError } from "@/server/learning";
import {
  ProjectLimitError,
  ProjectLockedError,
  addAiLog,
  addReference,
  addTask,
  createProject,
  deleteProject,
  getProject,
  isLabUnlocked,
  listProjects,
  removeAiLog,
  removeTask,
  setNoAi,
  toggleReferenceVerified,
  toggleTask,
  updateAbout,
} from "@/server/projects";
import { ensureRewards, getTotalXp } from "@/server/rewards";

// Fase D — Laboratório de Projetos Autorais, no banco de teste (ver vitest.config.mts).
const createdUsers: string[] = [];

async function newUser() {
  const id = randomUUID();
  await db.insert(users).values({ id, name: "Pessoa Teste", email: `${id}@teste.learnai.dev` });
  createdUsers.push(id);
  return id;
}

afterAll(async () => {
  if (createdUsers.length) await db.delete(users).where(inArray(users.id, createdUsers));
});

/** Atalho: uma missão concluída libera o Laboratório (ADR 0002, decisão 11). */
async function unlockedUser() {
  const userId = await newUser();
  const now = new Date();
  await db
    .insert(missionAttempts)
    .values({ userId, missionId: "checagem-de-fonte", total: 4, correct: 4, passed: true, startedAt: now, finishedAt: now });
  // O XP da missão entra agora, para isolar o que o projeto rende (nada).
  await ensureRewards(userId);
  return userId;
}

async function eventKinds(projectId: string) {
  const rows = await db
    .select({ kind: projectEvents.kind })
    .from(projectEvents)
    .where(eq(projectEvents.projectId, projectId))
    .orderBy(projectEvents.createdAt, projectEvents.id);
  return rows.map((r) => r.kind);
}

async function hasAuthored(userId: string) {
  const [row] = await db
    .select({ n: count() })
    .from(userAchievements)
    .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, "projeto-autoral")));
  return row.n === 1;
}

describe("Laboratório — liberação", () => {
  it("fica bloqueado até a primeira missão concluída", async () => {
    const userId = await newUser();
    expect(await isLabUnlocked(userId)).toBe(false);
    await expect(createProject(userId, { templateId: "seminario", title: "Energia" })).rejects.toBeInstanceOf(
      ProjectLockedError,
    );

    // Uma missão sem aprovação não libera.
    const now = new Date();
    await db
      .insert(missionAttempts)
      .values({ userId, missionId: "checagem-de-fonte", total: 4, correct: 1, passed: false, finishedAt: now });
    expect(await isLabUnlocked(userId)).toBe(false);

    await db
      .insert(missionAttempts)
      .values({ userId, missionId: "checagem-de-fonte", total: 4, correct: 4, passed: true, finishedAt: now });
    expect(await isLabUnlocked(userId)).toBe(true);
  });
});

describe("Laboratório — projetos", () => {
  it("cria as etapas e as tarefas do modelo, na ordem, e registra no histórico", async () => {
    const userId = await unlockedUser();
    const id = await createProject(userId, { templateId: "pesquisa", title: "Água na escola" });
    const project = (await getProject(userId, id))!;
    const template = findProjectTemplate("pesquisa")!;

    expect(project.templateTitle).toBe(template.title);
    expect(project.stages.map((s) => s.title)).toEqual(template.stages.map((s) => s.title));
    expect(project.stages.map((s) => s.tasks.map((t) => t.text))).toEqual(template.stages.map((s) => s.tasks));
    expect(project.events.map((e) => e.kind)).toEqual(["criado"]);
    expect(await listProjects(userId)).toEqual([
      expect.objectContaining({ id, title: "Água na escola", stagesDone: 0, stagesTotal: template.stages.length }),
    ]);
  });

  it("modelo inexistente é recusado", async () => {
    const userId = await unlockedUser();
    await expect(createProject(userId, { templateId: "nao-existe", title: "X" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("tarefas novas entram no fim da etapa", async () => {
    const userId = await unlockedUser();
    const id = await createProject(userId, { templateId: "pratico", title: "Horta" });
    const stage = (await getProject(userId, id))!.stages[0];
    await addTask(userId, id, stage.id, "Primeira nova");
    await addTask(userId, id, stage.id, "Segunda nova");
    const after = (await getProject(userId, id))!.stages[0];
    expect(after.tasks.map((t) => t.text).slice(-2)).toEqual(["Primeira nova", "Segunda nova"]);
    expect((await eventKinds(id)).filter((k) => k === "tarefa-adicionada")).toHaveLength(2);
  });

  it("outra pessoa não vê nem altera o projeto", async () => {
    const owner = await unlockedUser();
    const other = await unlockedUser();
    const id = await createProject(owner, { templateId: "seminario", title: "Meu tema" });
    const project = (await getProject(owner, id))!;
    const stage = project.stages[0];
    const task = stage.tasks[0];

    expect(await getProject(other, id)).toBeNull();
    expect(await listProjects(other)).toEqual([]);
    const about = { title: "Invadido", goal: "", audience: "", problem: "" };
    await expect(updateAbout(other, id, about)).rejects.toBeInstanceOf(NotFoundError);
    await expect(addTask(other, id, stage.id, "x")).rejects.toBeInstanceOf(NotFoundError);
    await expect(toggleTask(other, id, task.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(removeTask(other, id, task.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(addReference(other, id, { title: "x", url: "", note: "" })).rejects.toBeInstanceOf(NotFoundError);
    await expect(setNoAi(other, id, true)).rejects.toBeInstanceOf(NotFoundError);
    await expect(deleteProject(other, id)).rejects.toBeInstanceOf(NotFoundError);

    // Uma etapa de outro projeto também não serve, mesmo sendo da mesma pessoa.
    const otherProject = await createProject(owner, { templateId: "seminario", title: "Outro" });
    await expect(addTask(owner, otherProject, stage.id, "x")).rejects.toBeInstanceOf(NotFoundError);
    await expect(toggleTask(owner, otherProject, task.id)).rejects.toBeInstanceOf(NotFoundError);

    expect((await getProject(owner, id))!.title).toBe("Meu tema");
  });

  it("respeita o limite de projetos por pessoa e de tarefas por etapa", async () => {
    const userId = await unlockedUser();
    const ids: string[] = [];
    for (let i = 0; i < PROJECT_LIMITS.projectsPerUser; i++) {
      ids.push(await createProject(userId, { templateId: "pratico", title: `Projeto ${i + 1}` }));
    }
    await expect(createProject(userId, { templateId: "pratico", title: "Um a mais" })).rejects.toBeInstanceOf(
      ProjectLimitError,
    );

    const stage = (await getProject(userId, ids[0]))!.stages[0];
    for (let i = stage.tasks.length; i < PROJECT_LIMITS.tasksPerStage; i++) await addTask(userId, ids[0], stage.id, `T${i}`);
    await expect(addTask(userId, ids[0], stage.id, "Uma a mais")).rejects.toBeInstanceOf(ProjectLimitError);

    // Excluir um projeto libera espaço para outro.
    await deleteProject(userId, ids[1]);
    await expect(createProject(userId, { templateId: "pratico", title: "Agora cabe" })).resolves.toEqual(
      expect.any(String),
    );
  });
});

describe("Laboratório — conquista Projeto autoral", () => {
  it("só vem com etapas concluídas, referência conferida e uso de IA registrado, e não rende XP", async () => {
    const userId = await unlockedUser();
    const xpBefore = await getTotalXp(userId);
    const id = await createProject(userId, { templateId: "seminario", title: "Energia solar" });
    const project = (await getProject(userId, id))!;

    // Conclui todas as tarefas: etapas e projeto concluídos, mas ainda sem a conquista.
    for (const stage of project.stages) for (const task of stage.tasks) await toggleTask(userId, id, task.id);
    const kinds = await eventKinds(id);
    expect(kinds.filter((k) => k === "etapa-concluida")).toHaveLength(project.stages.length);
    expect(kinds.filter((k) => k === "projeto-concluido")).toHaveLength(1);
    expect(await hasAuthored(userId)).toBe(false);

    // Referência conferida: ainda falta o registro de IA.
    await addReference(userId, id, { title: "Balanço Energético Nacional — EPE", url: "https://www.epe.gov.br", note: "" });
    const [ref] = (await getProject(userId, id))!.references;
    expect(ref.url).toBe("https://www.epe.gov.br");
    await toggleReferenceVerified(userId, id, ref.id);
    expect(await hasAuthored(userId)).toBe(false);

    // "Não usei IA" completa o critério.
    const granted = await setNoAi(userId, id, true);
    expect(granted).toEqual({ xp: [], achievementIds: ["projeto-autoral"] });
    expect(await hasAuthored(userId)).toBe(true);
    expect(await getTotalXp(userId)).toBe(xpBefore);

    // Reabrir uma tarefa registra no histórico; a conquista obtida fica.
    await toggleTask(userId, id, project.stages[0].tasks[0].id);
    expect((await eventKinds(id)).at(-1)).toBe("tarefa-reaberta");
    expect(await hasAuthored(userId)).toBe(true);
  });

  it("um registro de uso de IA também vale, e desfaz o \"não usei IA\"", async () => {
    const userId = await unlockedUser();
    const id = await createProject(userId, { templateId: "pratico", title: "Horta" });
    await setNoAi(userId, id, true);
    expect((await getProject(userId, id))!.noAiMarkedAt).not.toBeNull();

    await addAiLog(userId, id, { tool: "Assistente", purpose: "Ideias de nomes", change: "Escolhi um e mudei" });
    const project = (await getProject(userId, id))!;
    expect(project.noAiMarkedAt).toBeNull();
    expect(project.aiLogs).toEqual([
      expect.objectContaining({ tool: "Assistente", purpose: "Ideias de nomes", change: "Escolhi um e mudei" }),
    ]);

    // Com uso registrado, não dá para marcar "não usei IA".
    await expect(setNoAi(userId, id, true)).rejects.toBeInstanceOf(ProjectLimitError);
    await removeAiLog(userId, id, project.aiLogs[0].id);
    await expect(setNoAi(userId, id, true)).resolves.toEqual({ xp: [], achievementIds: [] });
  });
});

describe("Laboratório — histórico, exportação e exclusão", () => {
  it("o histórico guarda só o tipo e o nome da etapa, nunca o texto escrito", async () => {
    const userId = await unlockedUser();
    const id = await createProject(userId, { templateId: "seminario", title: "Tema" });
    const stage = (await getProject(userId, id))!.stages[0];
    await updateAbout(userId, id, { title: "Tema", goal: "Texto secreto do objetivo", audience: "", problem: "" });
    await addTask(userId, id, stage.id, "Tarefa com texto próprio");
    const rows = await db.select().from(projectEvents).where(eq(projectEvents.projectId, id));
    const detail = rows.map((r) => r.detail ?? "").join(" ");
    expect(detail).not.toContain("secreto");
    expect(detail).not.toContain("texto próprio");
    expect(rows.find((r) => r.kind === "tarefa-adicionada")?.detail).toBe(stage.title);
  });

  it("os projetos entram na exportação dos dados, com o histórico", async () => {
    const userId = await unlockedUser();
    const id = await createProject(userId, { templateId: "pesquisa", title: "Pergunta" });
    const data = (await exportUserData(userId))!;
    expect(data.projetos).toHaveLength(1);
    expect(data.projetos[0]).toMatchObject({ id, title: "Pergunta", templateId: "pesquisa" });
    expect(data.projetos[0]).not.toHaveProperty("userId");
    expect(data.projetos[0].historico.map((e) => e.kind)).toEqual(["criado"]);
  });

  it("excluir o projeto apaga etapas, tarefas, referências, registros e histórico", async () => {
    const userId = await unlockedUser();
    const id = await createProject(userId, { templateId: "seminario", title: "Apagar" });
    await addReference(userId, id, { title: "Fonte", url: "", note: "" });
    await addAiLog(userId, id, { tool: "Chat", purpose: "Resumo", change: "Conferi" });
    await deleteProject(userId, id);

    for (const table of [projectStages, projectTasks, projectReferences, projectAiLogs, projectEvents]) {
      const [row] = await db.select({ n: count() }).from(table).where(eq(table.projectId, id));
      expect(row.n).toBe(0);
    }
    expect(await getProject(userId, id)).toBeNull();
    await expect(deleteProject(userId, id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("excluir a conta apaga os projetos", async () => {
    const userId = await unlockedUser();
    const id = await createProject(userId, { templateId: "pratico", title: "Conta" });
    await db.delete(users).where(eq(users.id, userId));
    const [row] = await db.select({ n: count() }).from(projects).where(eq(projects.id, id));
    expect(row.n).toBe(0);
  });
});
