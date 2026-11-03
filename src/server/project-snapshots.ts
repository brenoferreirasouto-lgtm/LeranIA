import "server-only";

import { asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { projectAiLogs, projectReferences, projectStages, projectTasks, projects } from "@/db/schema";
import type { ProjectSnapshot } from "@/lib/projects";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = typeof db | Transaction;

export type LoadedProject = ProjectSnapshot & {
  id: string;
  userId: string;
  templateId: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Lê projetos completos (etapas, tarefas, referências e registros de IA).
 * Usado pelas telas do Laboratório e pelo cálculo da conquista "Projeto autoral".
 * Consultas em sequência: numa transação, todas usam a mesma conexão.
 */
export async function loadProjects(
  ex: Executor,
  filter: { userId: string } | { projectId: string },
): Promise<LoadedProject[]> {
  const rows = await ex
    .select()
    .from(projects)
    .where("userId" in filter ? eq(projects.userId, filter.userId) : eq(projects.id, filter.projectId))
    .orderBy(asc(projects.createdAt));
  if (rows.length === 0) return [];
  const ids = rows.map((p) => p.id);

  const stages = await ex
    .select()
    .from(projectStages)
    .where(inArray(projectStages.projectId, ids))
    .orderBy(asc(projectStages.position));
  const tasks = await ex
    .select()
    .from(projectTasks)
    .where(inArray(projectTasks.projectId, ids))
    .orderBy(asc(projectTasks.position), asc(projectTasks.createdAt));
  const references = await ex
    .select()
    .from(projectReferences)
    .where(inArray(projectReferences.projectId, ids))
    .orderBy(asc(projectReferences.createdAt), asc(projectReferences.id));
  const aiLogs = await ex
    .select()
    .from(projectAiLogs)
    .where(inArray(projectAiLogs.projectId, ids))
    .orderBy(asc(projectAiLogs.createdAt), asc(projectAiLogs.id));

  return rows.map((p) => ({
    id: p.id,
    userId: p.userId,
    templateId: p.templateId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    title: p.title,
    goal: p.goal,
    audience: p.audience,
    problem: p.problem,
    noAiMarkedAt: p.noAiMarkedAt,
    stages: stages
      .filter((s) => s.projectId === p.id)
      .map((s) => ({
        id: s.id,
        title: s.title,
        tasks: tasks
          .filter((t) => t.stageId === s.id)
          .map((t) => ({ id: t.id, text: t.text, doneAt: t.doneAt })),
      })),
    references: references
      .filter((r) => r.projectId === p.id)
      .map((r) => ({ id: r.id, title: r.title, url: r.url, note: r.note, verifiedAt: r.verifiedAt })),
    aiLogs: aiLogs
      .filter((l) => l.projectId === p.id)
      .map((l) => ({ id: l.id, tool: l.tool, purpose: l.purpose, change: l.whatChanged, createdAt: l.createdAt })),
  }));
}
