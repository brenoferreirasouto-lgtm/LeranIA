"use server";

import { redirect } from "next/navigation";

import type { PromptMissionResult } from "@/lib/learning/public-types";
import { requireUser } from "@/lib/session";
import { NotFoundError } from "@/server/learning";
import {
  MissionLockedError,
  type MissionAnswerResult,
  answerMissionStep,
  startMission,
  submitPromptMission,
} from "@/server/missions";
import { z } from "@/lib/zod";

/*
 * Server Actions das missões (Fase C2). Cada uma confere a sessão de novo e
 * valida a entrada: o navegador não decide o que está certo nem o que está
 * liberado.
 */

const missionIdSchema = z.string().regex(/^[a-z0-9-]{1,80}$/);

export async function startMissionAction(missionId: string): Promise<void> {
  const id = missionIdSchema.parse(missionId);
  const user = await requireUser(`/missoes/${id}`);
  try {
    await startMission(user.id, id);
  } catch (error) {
    // Missão bloqueada ou inexistente: a página explica o que falta.
    if (!(error instanceof NotFoundError || error instanceof MissionLockedError)) throw error;
  }
  redirect(`/missoes/${id}`);
}

const answerSchema = z.object({
  missionId: missionIdSchema,
  attemptId: z.uuid(),
  stepId: z.string().min(1).max(80),
  optionIds: z.array(z.string().min(1).max(80)).min(1).max(10),
});

export type MissionAnswerActionResult =
  | { ok: true; result: MissionAnswerResult }
  | { ok: false; message: string };

export async function answerMissionStepAction(input: unknown): Promise<MissionAnswerActionResult> {
  const parsed = answerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Resposta inválida. Recarregue a página." };

  const user = await requireUser("/missoes");
  const { missionId, attemptId, stepId, optionIds } = parsed.data;
  try {
    const result = await answerMissionStep(user.id, missionId, attemptId, stepId, optionIds);
    return { ok: true, result };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { ok: false, message: "Esta missão não está mais disponível. Recarregue a página." };
    }
    console.error("Falha ao registrar resposta da missão", error);
    return { ok: false, message: "Não foi possível enviar sua resposta. Tente de novo." };
  }
}

const promptSchema = z.object({
  missionId: missionIdSchema,
  fields: z.object({
    contexto: z.string().max(1000),
    objetivo: z.string().max(1000),
    formato: z.string().max(1000),
    restricoes: z.string().max(1000),
  }),
});

export type PromptMissionActionResult =
  | { ok: true; result: PromptMissionResult }
  | { ok: false; message: string };

/** O texto do prompt é conferido e descartado; os registros de erro nunca incluem o texto. */
export async function submitPromptMissionAction(input: unknown): Promise<PromptMissionActionResult> {
  const parsed = promptSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Cada elemento pode ter até 1.000 caracteres." };

  const user = await requireUser("/missoes");
  try {
    const result = await submitPromptMission(user.id, parsed.data.missionId, parsed.data.fields);
    return { ok: true, result };
  } catch (error) {
    if (error instanceof MissionLockedError) return { ok: false, message: error.message };
    if (error instanceof NotFoundError) {
      return { ok: false, message: "Esta missão não está disponível. Recarregue a página." };
    }
    console.error("Falha ao conferir a missão de prompt", (error as Error)?.name ?? "erro");
    return { ok: false, message: "Não foi possível conferir agora. Tente de novo em instantes." };
  }
}
