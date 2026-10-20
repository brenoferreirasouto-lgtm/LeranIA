import "server-only";

import { and, count, desc, eq, sql } from "drizzle-orm";

import { findProjectTemplate, projectTemplates } from "@/content";
import { db } from "@/db";
import {
  missionAttempts,
  projectAiLogs,
  projectEvents,
  projectReferences,
  projectStages,
  projectTasks,
  projects,
} from "@/db/schema";
import { PROJECT_LIMITS, type ProjectEventKind, projectDone, stageDone } from "@/lib/projects";
import { NotFoundError } from "@/server/learning";
import { type LoadedProject, loadProjects } from "@/server/project-snapshots";
import { syncRewards } from "@/server/rewards";

/*
 * Laboratório de Projetos Autorais (SP26, ADR 0002). Toda função recebe o id
 * da pessoa logada e só lê ou altera projetos dela: um projeto de outra
 * pessoa responde "não encontrado".
 */

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class ProjectLockedError extends Error {
  constructor() {
    super("O Laboratório libera quando você concluir a sua primeira missão.");
  }
}

export class ProjectLimitError extends Error {}

/** Libera ao concluir a primeira missão (ADR 0002, decisão 11). */
export async function isLabUnlocked(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ n: count() })
    .from(missionAttempts)
    .where(and(eq(missionAttempts.userId, userId), eq(missionAttempts.passed, true)));
  return (row?.n ?? 0) > 0;
}

async function requireUnlocked(userId: string) {
  if (!(await isLabUnlocked(userId))) throw new ProjectLockedError();
}

export type ProjectListItem = {
  id: string;
  title: string;
  templateTitle: string;
  stagesDone: number;
  stagesTotal: number;
  updatedAt: Date;
};

export async function listProjects(userId: string): Promise<ProjectListItem[]> {
  const loaded = await loadProjects(db, { userId });
  return loaded
    .map((p) => ({
      id: p.id,
      title: p.title,
      templateTitle: findProjectTemplate(p.templateId)?.title ?? p.templateId,
      stagesDone: p.stages.filter(stageDone).length,
      stagesTotal: p.stages.length,
      updatedAt: p.updatedAt,
    }))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export type ProjectView = LoadedProject & {
  templateTitle: string;
  events: { id: string; kind: ProjectEventKind; detail: string | null; createdAt: Date }[];
};

export async function getProject(userId: string, projectId: string): Promise<ProjectView | null> {
  const [loaded] = await loadProjects(db, { projectId });
  if (!loaded || loaded.userId !== userId) return null;
  const events = await db
    .select()
    .from(projectEvents)
    .where(eq(projectEvents.projectId, projectId))
    .orderBy(desc(projectEvents.createdAt), desc(projectEvents.id))
    .limit(50);
  return {
    ...loaded,
    templateTitle: findProjectTemplate(loaded.templateId)?.title ?? loaded.templateId,
    events: events.map((e) => ({ id: e.id, kind: e.kind as ProjectEventKind, detail: e.detail, createdAt: e.createdAt })),
  };
}

/* ---------- Escrita ---------- */

/** Trava o projeto da própria pessoa até o fim da transação; de outra pessoa, "não encontrado". */
async function lockOwnProject(tx: Transaction, userId: string, projectId: string) {
  const [row] = await tx
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .for("update");
  if (!row) throw new NotFoundError("Projeto não encontrado.");
}

async function logEvent(tx: Transaction, projectId: string, kind: ProjectEventKind, detail: string | null = null) {
  await tx.insert(projectEvents).values({ projectId, kind, detail });
}

async function touch(tx: Transaction, projectId: string) {
  await tx.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, projectId));
}

export async function createProject(userId: string, input: { templateId: string; title: string }): Promise<string> {
  await requireUnlocked(userId);
  const template = findProjectTemplate(input.templateId);
  if (!template) throw new NotFoundError("Modelo inexistente.");

  return db.transaction(async (tx) => {
    // Serializa a criação por pessoa, para o limite valer com duas abas abertas.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`projects:${userId}`}, 0))`);
    const [{ n }] = await tx.select({ n: count() }).from(projects).where(eq(projects.userId, userId));
    if (n >= PROJECT_LIMITS.projectsPerUser) {
      throw new ProjectLimitError(`Você pode ter até ${PROJECT_LIMITS.projectsPerUser} projetos. Exclua um para criar outro.`);
    }

    const [project] = await tx
      .insert(projects)
      .values({ userId, templateId: template.id, title: input.title })
      .returning({ id: projects.id });

    for (const [position, stage] of template.stages.entries()) {
      const [created] = await tx
        .insert(projectStages)
        .values({ projectId: project.id, position, title: stage.title })
        .returning({ id: projectStages.id });
      if (stage.tasks.length) {
        await tx
          .insert(projectTasks)
          .values(stage.tasks.map((text, i) => ({ projectId: project.id, stageId: created.id, text, position: i })));
      }
    }
    await logEvent(tx, project.id, "criado");
    return project.id;
  });
}

export async function updateAbout(
  userId: string,
  projectId: string,
  input: { title: string; goal: string; audience: string; problem: string },
) {
  await db.transaction(async (tx) => {
    await lockOwnProject(tx, userId, projectId);
    await tx.update(projects).set({ ...input, updatedAt: new Date() }).where(eq(projects.id, projectId));
    await logEvent(tx, projectId, "sobre-editado");
  });
}

async function stageOf(tx: Transaction, projectId: string, stageId: string) {
  const [stage] = await tx
    .select()
    .from(projectStages)
    .where(and(eq(projectStages.id, stageId), eq(projectStages.projectId, projectId)));
  if (!stage) throw new NotFoundError("Etapa não encontrada.");
  return stage;
}

export async function addTask(userId: string, projectId: string, stageId: string, text: string) {
  await db.transaction(async (tx) => {
    await lockOwnProject(tx, userId, projectId);
    const stage = await stageOf(tx, projectId, stageId);
    const [{ n, last }] = await tx
      .select({ n: count(), last: sql<number>`coalesce(max(${projectTasks.position}), -1)`.mapWith(Number) })
      .from(projectTasks)
      .where(eq(projectTasks.stageId, stageId));
    if (n >= PROJECT_LIMITS.tasksPerStage) {
      throw new ProjectLimitError(`Cada etapa pode ter até ${PROJECT_LIMITS.tasksPerStage} tarefas.`);
    }
    await tx.insert(projectTasks).values({ projectId, stageId, text, position: last + 1 });
    await logEvent(tx, projectId, "tarefa-adicionada", stage.title);
    await touch(tx, projectId);
  });
}

/**
 * Marca ou desmarca uma tarefa. Registra no histórico quando uma etapa ou o
 * projeto inteiro fica concluído, e confere a conquista "Projeto autoral".
 */
export async function toggleTask(userId: string, projectId: string, taskId: string) {
  return db.transaction(async (tx) => {
    await lockOwnProject(tx, userId, projectId);
    const [task] = await tx
      .select()
      .from(projectTasks)
      .where(and(eq(projectTasks.id, taskId), eq(projectTasks.projectId, projectId)));
    if (!task) throw new NotFoundError("Tarefa não encontrada.");
    const stage = await stageOf(tx, projectId, task.stageId);

    const [before] = await loadProjects(tx, { projectId });
    const wasStageDone = stageDone(before.stages.find((s) => s.id === stage.id)!);
    const wasProjectDone = projectDone(before);

    await tx
      .update(projectTasks)
      .set({ doneAt: task.doneAt ? null : new Date() })
      .where(eq(projectTasks.id, taskId));
    await logEvent(tx, projectId, task.doneAt ? "tarefa-reaberta" : "tarefa-concluida", stage.title);

    const [after] = await loadProjects(tx, { projectId });
    if (!wasStageDone && stageDone(after.stages.find((s) => s.id === stage.id)!)) {
      await logEvent(tx, projectId, "etapa-concluida", stage.title);
    }
    if (!wasProjectDone && projectDone(after)) await logEvent(tx, projectId, "projeto-concluido");
    await touch(tx, projectId);
    return syncRewards(tx, userId);
  });
}

export async function removeTask(userId: string, projectId: string, taskId: string) {
  await db.transaction(async (tx) => {
    await lockOwnProject(tx, userId, projectId);
    const [task] = await tx
      .delete(projectTasks)
      .where(and(eq(projectTasks.id, taskId), eq(projectTasks.projectId, projectId)))
      .returning({ stageId: projectTasks.stageId });
    if (!task) throw new NotFoundError("Tarefa não encontrada.");
    const stage = await stageOf(tx, projectId, task.stageId);
    await logEvent(tx, projectId, "tarefa-removida", stage.title);
    await touch(tx, projectId);
  });
}

export async function addReference(
  userId: string,
  projectId: string,
  input: { title: string; url: string; note: string },
) {
  await db.transaction(async (tx) => {
    await lockOwnProject(tx, userId, projectId);
    const [{ n }] = await tx
      .select({ n: count() })
      .from(projectReferences)
      .where(eq(projectReferences.projectId, projectId));
    if (n >= PROJECT_LIMITS.references) {
      throw new ProjectLimitError(`Cada projeto pode ter até ${PROJECT_LIMITS.references} referências.`);
    }
    await tx.insert(projectReferences).values({ projectId, title: input.title, url: input.url || null, note: input.note });
    await logEvent(tx, projectId, "referencia-adicionada");
    await touch(tx, projectId);
  });
}

export async function toggleReferenceVerified(userId: string, projectId: string, referenceId: string) {
  return db.transaction(async (tx) => {
    await lockOwnProject(tx, userId, projectId);
    const [reference] = await tx
      .select()
      .from(projectReferences)
      .where(and(eq(projectReferences.id, referenceId), eq(projectReferences.projectId, projectId)));
    if (!reference) throw new NotFoundError("Referência não encontrada.");
    await tx
      .update(projectReferences)
      .set({ verifiedAt: reference.verifiedAt ? null : new Date() })
      .where(eq(projectReferences.id, referenceId));
    if (!reference.verifiedAt) await logEvent(tx, projectId, "referencia-conferida");
    await touch(tx, projectId);
    return syncRewards(tx, userId);
  });
}

export async function removeReference(userId: string, projectId: string, referenceId: string) {
  await db.transaction(async (tx) => {
    await lockOwnProject(tx, userId, projectId);
    const removed = await tx
      .delete(projectReferences)
      .where(and(eq(projectReferences.id, referenceId), eq(projectReferences.projectId, projectId)))
      .returning({ id: projectReferences.id });
    if (removed.length === 0) throw new NotFoundError("Referência não encontrada.");
    await logEvent(tx, projectId, "referencia-removida");
    await touch(tx, projectId);
  });
}

/** Registrar um uso de IA desfaz o "não usei IA". */
export async function addAiLog(
  userId: string,
  projectId: string,
  input: { tool: string; purpose: string; change: string },
) {
  return db.transaction(async (tx) => {
    await lockOwnProject(tx, userId, projectId);
    const [{ n }] = await tx.select({ n: count() }).from(projectAiLogs).where(eq(projectAiLogs.projectId, projectId));
    if (n >= PROJECT_LIMITS.aiLogs) {
      throw new ProjectLimitError(`Cada projeto pode ter até ${PROJECT_LIMITS.aiLogs} registros de uso de IA.`);
    }
    await tx
      .insert(projectAiLogs)
      .values({ projectId, tool: input.tool, purpose: input.purpose, whatChanged: input.change });
    await tx.update(projects).set({ noAiMarkedAt: null, updatedAt: new Date() }).where(eq(projects.id, projectId));
    await logEvent(tx, projectId, "registro-ia-adicionado");
    return syncRewards(tx, userId);
  });
}

export async function removeAiLog(userId: string, projectId: string, logId: string) {
  await db.transaction(async (tx) => {
    await lockOwnProject(tx, userId, projectId);
    const removed = await tx
      .delete(projectAiLogs)
      .where(and(eq(projectAiLogs.id, logId), eq(projectAiLogs.projectId, projectId)))
      .returning({ id: projectAiLogs.id });
    if (removed.length === 0) throw new NotFoundError("Registro não encontrado.");
    await logEvent(tx, projectId, "registro-ia-removido");
    await touch(tx, projectId);
  });
}

/** "Não usei IA neste projeto": só vale enquanto não houver registro de uso. */
export async function setNoAi(userId: string, projectId: string, value: boolean) {
  return db.transaction(async (tx) => {
    await lockOwnProject(tx, userId, projectId);
    if (value) {
      const [{ n }] = await tx
        .select({ n: count() })
        .from(projectAiLogs)
        .where(eq(projectAiLogs.projectId, projectId));
      if (n > 0) throw new ProjectLimitError("Você registrou usos de IA neste projeto. Remova-os antes de marcar que não usou.");
    }
    await tx
      .update(projects)
      .set({ noAiMarkedAt: value ? new Date() : null, updatedAt: new Date() })
      .where(eq(projects.id, projectId));
    await logEvent(tx, projectId, value ? "sem-ia-marcado" : "sem-ia-desmarcado");
    return syncRewards(tx, userId);
  });
}

/** Excluir apaga o projeto e tudo o que é dele (etapas, tarefas, referências, registros, histórico). */
export async function deleteProject(userId: string, projectId: string) {
  const removed = await db
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .returning({ id: projects.id });
  if (removed.length === 0) throw new NotFoundError("Projeto não encontrado.");
}

export function templateOptions() {
  return projectTemplates.map((t) => ({
    id: t.id,
    title: t.title,
    summary: t.summary,
    stages: t.stages.map((s) => s.title),
  }));
}
