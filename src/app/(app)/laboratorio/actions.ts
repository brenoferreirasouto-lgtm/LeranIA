"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";

import { type FieldErrors, toFieldErrors } from "@/lib/validation/auth";
import {
  aboutSchema,
  aiLogSchema,
  createProjectSchema,
  referenceSchema,
  taskSchema,
} from "@/lib/projects";
import { requireUser } from "@/lib/session";
import { NotFoundError } from "@/server/learning";
import {
  ProjectLimitError,
  ProjectLockedError,
  addAiLog,
  addReference,
  addTask,
  createProject,
  deleteProject,
  removeAiLog,
  removeReference,
  removeTask,
  setNoAi,
  toggleReferenceVerified,
  toggleTask,
  updateAbout,
} from "@/server/projects";

/*
 * Server Actions do Laboratório (SP26). Cada uma confere a sessão de novo e
 * valida a entrada; o servidor também confere que o projeto é da pessoa.
 * Erros nunca são registrados com o texto escrito pela pessoa.
 */

export type LabFormState = {
  message?: string;
  fieldErrors?: FieldErrors<Record<string, string>>;
  /** O que a pessoa escreveu, para o formulário não perder o texto num erro. */
  values?: Record<string, string>;
  saved?: boolean;
};

function textValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) if (typeof value === "string" && !key.startsWith("$")) values[key] = value;
  return values;
}

function invalid(error: z.ZodError, formData: FormData): LabFormState {
  return { fieldErrors: toFieldErrors(error), values: textValues(formData) };
}

const uuid = z.uuid();

function ids(...values: string[]) {
  for (const value of values) if (!uuid.safeParse(value).success) throw new NotFoundError("Id inválido.");
}

function knownError(error: unknown): LabFormState | null {
  if (error instanceof ProjectLimitError || error instanceof ProjectLockedError) return { message: error.message };
  if (error instanceof NotFoundError) return { message: "Este projeto não está mais disponível. Recarregue a página." };
  return null;
}

function logFailure(what: string, error: unknown) {
  console.error(`Falha no Laboratório: ${what}`, (error as Error)?.name ?? "erro");
}

export async function createProjectAction(_prev: LabFormState, formData: FormData): Promise<LabFormState> {
  const user = await requireUser("/laboratorio");
  const parsed = createProjectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);

  let id: string;
  try {
    id = await createProject(user.id, parsed.data);
  } catch (error) {
    const known = knownError(error);
    if (known) return { ...known, values: textValues(formData) };
    logFailure("criar projeto", error);
    return { message: "Não foi possível criar o projeto agora. Tente de novo em instantes.", values: textValues(formData) };
  }
  redirect(`/laboratorio/${id}`);
}

export async function updateAboutAction(
  projectId: string,
  _prev: LabFormState,
  formData: FormData,
): Promise<LabFormState> {
  const user = await requireUser(`/laboratorio/${projectId}`);
  const parsed = aboutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);
  try {
    ids(projectId);
    await updateAbout(user.id, projectId, parsed.data);
  } catch (error) {
    const known = knownError(error);
    if (known) return { ...known, values: textValues(formData) };
    logFailure("salvar projeto", error);
    return { message: "Não foi possível salvar agora. Tente de novo em instantes.", values: textValues(formData) };
  }
  refresh();
  return { saved: true, values: parsed.data };
}

export async function addTaskAction(
  projectId: string,
  stageId: string,
  _prev: LabFormState,
  formData: FormData,
): Promise<LabFormState> {
  const user = await requireUser(`/laboratorio/${projectId}`);
  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);
  try {
    ids(projectId, stageId);
    await addTask(user.id, projectId, stageId, parsed.data.text);
  } catch (error) {
    const known = knownError(error);
    if (known) return { ...known, values: textValues(formData) };
    logFailure("adicionar tarefa", error);
    return { message: "Não foi possível adicionar a tarefa. Tente de novo.", values: textValues(formData) };
  }
  refresh();
  return {};
}

export async function addReferenceAction(
  projectId: string,
  _prev: LabFormState,
  formData: FormData,
): Promise<LabFormState> {
  const user = await requireUser(`/laboratorio/${projectId}`);
  const parsed = referenceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);
  try {
    ids(projectId);
    await addReference(user.id, projectId, parsed.data);
  } catch (error) {
    const known = knownError(error);
    if (known) return { ...known, values: textValues(formData) };
    logFailure("adicionar referência", error);
    return { message: "Não foi possível adicionar a referência. Tente de novo.", values: textValues(formData) };
  }
  refresh();
  return {};
}

export async function addAiLogAction(
  projectId: string,
  _prev: LabFormState,
  formData: FormData,
): Promise<LabFormState> {
  const user = await requireUser(`/laboratorio/${projectId}`);
  const parsed = aiLogSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);
  try {
    ids(projectId);
    await addAiLog(user.id, projectId, parsed.data);
  } catch (error) {
    const known = knownError(error);
    if (known) return { ...known, values: textValues(formData) };
    logFailure("registrar uso de IA", error);
    return { message: "Não foi possível registrar agora. Tente de novo.", values: textValues(formData) };
  }
  refresh();
  return {};
}

export async function deleteProjectAction(
  projectId: string,
  _prev: LabFormState,
  formData: FormData,
): Promise<LabFormState> {
  const user = await requireUser(`/laboratorio/${projectId}`);
  if (formData.get("confirmDelete") !== "on") {
    return { fieldErrors: { confirmDelete: "Marque que você entende que a exclusão é permanente." } };
  }
  try {
    ids(projectId);
    await deleteProject(user.id, projectId);
  } catch (error) {
    const known = knownError(error);
    if (known) return { ...known, values: textValues(formData) };
    logFailure("excluir projeto", error);
    return { message: "Não foi possível excluir agora. Tente de novo.", values: textValues(formData) };
  }
  redirect("/laboratorio");
}

/* ---------- Ações de um clique (marcar, conferir, remover) ---------- */

async function quick(projectId: string, what: string, run: (userId: string) => Promise<unknown>) {
  const user = await requireUser(`/laboratorio/${projectId}`);
  try {
    await run(user.id);
  } catch (error) {
    if (error instanceof NotFoundError) redirect("/laboratorio");
    if (!(error instanceof ProjectLimitError)) {
      logFailure(what, error);
      throw error;
    }
  }
  refresh();
}

export async function toggleTaskAction(projectId: string, taskId: string): Promise<void> {
  await quick(projectId, "marcar tarefa", (userId) => {
    ids(projectId, taskId);
    return toggleTask(userId, projectId, taskId);
  });
}

export async function removeTaskAction(projectId: string, taskId: string): Promise<void> {
  await quick(projectId, "remover tarefa", (userId) => {
    ids(projectId, taskId);
    return removeTask(userId, projectId, taskId);
  });
}

export async function toggleReferenceAction(projectId: string, referenceId: string): Promise<void> {
  await quick(projectId, "conferir referência", (userId) => {
    ids(projectId, referenceId);
    return toggleReferenceVerified(userId, projectId, referenceId);
  });
}

export async function removeReferenceAction(projectId: string, referenceId: string): Promise<void> {
  await quick(projectId, "remover referência", (userId) => {
    ids(projectId, referenceId);
    return removeReference(userId, projectId, referenceId);
  });
}

export async function removeAiLogAction(projectId: string, logId: string): Promise<void> {
  await quick(projectId, "remover registro de IA", (userId) => {
    ids(projectId, logId);
    return removeAiLog(userId, projectId, logId);
  });
}

export async function setNoAiAction(projectId: string, value: boolean): Promise<void> {
  await quick(projectId, "marcar sem IA", (userId) => {
    ids(projectId);
    return setNoAi(userId, projectId, value);
  });
}
