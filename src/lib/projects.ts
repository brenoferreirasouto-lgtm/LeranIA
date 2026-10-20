/*
 * Laboratório de Projetos Autorais (SP26, ADR 0002) — regras puras, sem
 * banco. Podem rodar no navegador (aviso de dados pessoais) e no servidor.
 */
import * as z from "zod";

import { listPt } from "@/lib/format";
import { type PersonalDataKind, findPersonalData } from "@/lib/prompt-builder";

export const PROJECT_LIMITS = {
  projectsPerUser: 20,
  tasksPerStage: 30,
  references: 30,
  aiLogs: 30,
  title: 120,
  about: 1000,
  task: 200,
  referenceTitle: 200,
  referenceUrl: 500,
  referenceNote: 300,
  aiTool: 80,
  aiPurpose: 300,
  aiChange: 500,
} as const;

const text = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, { error: `${label}: use até ${max} caracteres.` });

const required = (max: number, label: string, empty: string) =>
  text(max, label).min(1, { error: empty });

export const createProjectSchema = z.object({
  templateId: z.string().regex(/^[a-z0-9-]{1,40}$/, { error: "Escolha um modelo." }),
  title: required(PROJECT_LIMITS.title, "Título", "Dê um título ao projeto."),
});

export const aboutSchema = z.object({
  title: required(PROJECT_LIMITS.title, "Título", "Dê um título ao projeto."),
  goal: text(PROJECT_LIMITS.about, "Objetivo"),
  audience: text(PROJECT_LIMITS.about, "Público"),
  problem: text(PROJECT_LIMITS.about, "Problema"),
});

export const taskSchema = z.object({
  text: required(PROJECT_LIMITS.task, "Tarefa", "Escreva a tarefa."),
});

export const referenceSchema = z.object({
  title: required(PROJECT_LIMITS.referenceTitle, "Referência", "Diga qual é a referência (título, autor ou site)."),
  url: text(PROJECT_LIMITS.referenceUrl, "Link").refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), {
    error: "Use um link que comece com http:// ou https://, ou deixe em branco.",
  }),
  note: text(PROJECT_LIMITS.referenceNote, "Observação"),
});

export const aiLogSchema = z.object({
  tool: required(PROJECT_LIMITS.aiTool, "Ferramenta", "Diga qual ferramenta de IA você usou."),
  purpose: required(PROJECT_LIMITS.aiPurpose, "Para quê", "Diga para que usou a IA."),
  change: required(
    PROJECT_LIMITS.aiChange,
    "O que você fez",
    "Conte o que você mudou, conferiu ou decidiu a partir da resposta.",
  ),
});

/* ---------- Estado do projeto ---------- */

export type ProjectSnapshot = {
  title: string;
  goal: string;
  audience: string;
  problem: string;
  noAiMarkedAt: Date | null;
  stages: { id: string; title: string; tasks: { id: string; text: string; doneAt: Date | null }[] }[];
  references: { id: string; title: string; url: string | null; note: string; verifiedAt: Date | null }[];
  aiLogs: { id: string; tool: string; purpose: string; change: string; createdAt: Date }[];
};

/** Uma etapa está concluída quando tem tarefas e todas foram feitas. */
export function stageDone(stage: ProjectSnapshot["stages"][number]): boolean {
  return stage.tasks.length > 0 && stage.tasks.every((t) => t.doneAt);
}

export function projectDone(project: ProjectSnapshot): boolean {
  return project.stages.length > 0 && project.stages.every(stageDone);
}

function min(dates: Date[]): Date | null {
  return dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
}

function max(dates: Date[]): Date | null {
  return dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
}

/**
 * Conquista "Projeto autoral" (ADR 0002, decisão 12): todas as etapas
 * concluídas, pelo menos uma referência conferida e o uso de IA registrado
 * (ou "não usei IA"). Devolve quando o critério foi cumprido, ou null.
 */
export function authoredAt(project: ProjectSnapshot): Date | null {
  if (!projectDone(project)) return null;
  const firstVerified = min(project.references.flatMap((r) => (r.verifiedAt ? [r.verifiedAt] : [])));
  const aiEvidence = min([
    ...project.aiLogs.map((l) => l.createdAt),
    ...(project.noAiMarkedAt ? [project.noAiMarkedAt] : []),
  ]);
  const lastTask = max(project.stages.flatMap((s) => s.tasks.map((t) => t.doneAt as Date)));
  if (!firstVerified || !aiEvidence || !lastTask) return null;
  return max([firstVerified, aiEvidence, lastTask]);
}

/** Todo o texto escrito pela pessoa, para procurar dados pessoais. */
function allText(project: ProjectSnapshot): string {
  return [
    project.title,
    project.goal,
    project.audience,
    project.problem,
    ...project.stages.flatMap((s) => s.tasks.map((t) => t.text)),
    ...project.references.flatMap((r) => [r.title, r.url ?? "", r.note]),
    ...project.aiLogs.flatMap((l) => [l.tool, l.purpose, l.change]),
  ].join("\n");
}

export function projectPersonalData(project: ProjectSnapshot): PersonalDataKind[] {
  return findPersonalData(allText(project));
}

export type ChecklistItem = { id: string; label: string; ok: boolean; tip: string };

/** "Sugestões de melhoria" do card: regras fixas, sem IA (ADR 0002, decisão 9). */
export function projectChecklist(project: ProjectSnapshot): ChecklistItem[] {
  const personal = projectPersonalData(project);
  return [
    {
      id: "objetivo",
      label: "Objetivo em uma frase completa",
      ok: project.goal.trim().length >= 30,
      tip: "Diga o que você vai entregar e para quê, em uma frase completa.",
    },
    {
      id: "publico",
      label: "Público definido",
      ok: project.audience.trim().length >= 10,
      tip: "Para quem é o projeto? Quanto mais específico, melhor.",
    },
    {
      id: "problema",
      label: "Problema descrito",
      ok: project.problem.trim().length >= 30,
      tip: "Que problema ou pergunta o projeto responde?",
    },
    {
      id: "tarefas",
      label: "Toda etapa tem tarefas",
      ok: project.stages.length > 0 && project.stages.every((s) => s.tasks.length > 0),
      tip: "Acrescente pelo menos uma tarefa em cada etapa.",
    },
    {
      id: "referencia",
      label: "Pelo menos uma referência conferida",
      ok: project.references.some((r) => r.verifiedAt),
      tip: "Confira uma fonte na origem e marque como conferida.",
    },
    {
      id: "ia",
      label: "Uso de IA registrado",
      ok: project.aiLogs.length > 0 || Boolean(project.noAiMarkedAt),
      tip: "Registre como usou a IA, ou marque que não usou neste projeto.",
    },
    {
      id: "dados",
      label: "Sem dados pessoais",
      ok: personal.length === 0,
      tip:
        personal.length > 0
          ? `Encontramos ${listPt(personal)}. Troque por algo genérico.`
          : "Não coloque e-mail, telefone, CPF ou senha no projeto.",
    },
  ];
}

/* ---------- Histórico ---------- */

export type ProjectEventKind =
  | "criado"
  | "sobre-editado"
  | "tarefa-adicionada"
  | "tarefa-concluida"
  | "tarefa-reaberta"
  | "tarefa-removida"
  | "etapa-concluida"
  | "referencia-adicionada"
  | "referencia-conferida"
  | "referencia-removida"
  | "registro-ia-adicionado"
  | "registro-ia-removido"
  | "sem-ia-marcado"
  | "sem-ia-desmarcado"
  | "projeto-concluido";

/**
 * Texto de cada evento. O detalhe é sempre o nome de uma etapa do modelo,
 * nunca texto escrito pela pessoa: o histórico não duplica o conteúdo.
 */
export function projectEventLabel(kind: ProjectEventKind, detail: string | null): string {
  const stage = detail ? ` em "${detail}"` : "";
  switch (kind) {
    case "criado":
      return "Projeto criado";
    case "sobre-editado":
      return "Objetivo, público ou problema editados";
    case "tarefa-adicionada":
      return `Tarefa adicionada${stage}`;
    case "tarefa-concluida":
      return `Tarefa concluída${stage}`;
    case "tarefa-reaberta":
      return `Tarefa reaberta${stage}`;
    case "tarefa-removida":
      return `Tarefa removida${stage}`;
    case "etapa-concluida":
      return `Etapa concluída: ${detail ?? ""}`.trim();
    case "referencia-adicionada":
      return "Referência adicionada";
    case "referencia-conferida":
      return "Referência marcada como conferida";
    case "referencia-removida":
      return "Referência removida";
    case "registro-ia-adicionado":
      return "Uso de IA registrado";
    case "registro-ia-removido":
      return "Registro de uso de IA removido";
    case "sem-ia-marcado":
      return "Marcado: não usei IA neste projeto";
    case "sem-ia-desmarcado":
      return "Desmarcado: não usei IA neste projeto";
    case "projeto-concluido":
      return "Todas as etapas concluídas";
  }
}
