"use server";

import { redirect } from "next/navigation";
import * as z from "zod";

import { IncompletePlacementError } from "@/lib/learning/scoring";
import { requireUser } from "@/lib/session";
import {
  type AnswerResult,
  NotFoundError,
  answerPractice,
  completeLesson,
  recordVisit,
  savePlacement,
  startPractice,
} from "@/server/learning";

/*
 * Server Actions do núcleo educacional. Cada uma confere a sessão de novo:
 * nunca confiamos no navegador para dizer quem é a pessoa nem o que ela
 * pode alterar.
 */

const slugSchema = z.string().regex(/^[a-z0-9-]{1,80}$/);

/* ---------- SP02 — nivelamento ---------- */

export type PlacementFormState = { missing?: string[]; message?: string };

export async function submitPlacementAction(
  _prev: PlacementFormState,
  formData: FormData,
): Promise<PlacementFormState> {
  const user = await requireUser("/nivelamento");

  const answers: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("q:") && typeof value === "string") answers[key.slice(2)] = value;
  }

  try {
    await savePlacement(user.id, answers);
  } catch (error) {
    if (error instanceof IncompletePlacementError) {
      return {
        missing: error.missing,
        message: "Responda todas as perguntas. Se não souber, escolha \"Ainda não sei\".",
      };
    }
    console.error("Falha ao salvar o nivelamento", error);
    return { message: "Não foi possível salvar suas respostas agora. Tente de novo em instantes." };
  }

  redirect("/nivelamento/resultado");
}

/* ---------- SP01, U07, U08 — aula ---------- */

export async function completeLessonAction(slug: string): Promise<void> {
  const parsed = slugSchema.parse(slug);
  const user = await requireUser(`/trilha/${parsed}`);
  try {
    await completeLesson(user.id, parsed);
  } catch (error) {
    if (error instanceof NotFoundError) redirect("/trilha");
    throw error;
  }
  redirect(`/trilha/${parsed}/pratica`);
}

/** SP05 — registra a última atividade quando a pessoa abre uma aula ou prática. */
export async function recordVisitAction(slug: string, step: "aula" | "pratica"): Promise<void> {
  const parsed = z.object({ slug: slugSchema, step: z.enum(["aula", "pratica"]) }).safeParse({ slug, step });
  if (!parsed.success) return;
  const user = await requireUser("/trilha");
  try {
    await recordVisit(user.id, parsed.data.slug, parsed.data.step);
  } catch (error) {
    if (!(error instanceof NotFoundError)) throw error;
  }
}

/* ---------- SP04, SP13 — prática com feedback ---------- */

export async function startPracticeAction(slug: string): Promise<void> {
  const parsed = slugSchema.parse(slug);
  const user = await requireUser(`/trilha/${parsed}/pratica`);
  try {
    await startPractice(user.id, parsed);
  } catch (error) {
    if (error instanceof NotFoundError) redirect("/trilha");
    throw error;
  }
  redirect(`/trilha/${parsed}/pratica`);
}

const answerSchema = z.object({
  slug: slugSchema,
  attemptId: z.uuid(),
  questionId: z.string().min(1).max(80),
  optionId: z.string().min(1).max(80),
});

export type AnswerActionResult =
  | { ok: true; result: AnswerResult }
  | { ok: false; message: string };

export async function answerPracticeAction(input: unknown): Promise<AnswerActionResult> {
  const parsed = answerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Resposta inválida. Recarregue a página." };

  const user = await requireUser("/trilha");
  const { slug, attemptId, questionId, optionId } = parsed.data;
  try {
    const result = await answerPractice(user.id, slug, attemptId, questionId, optionId);
    return { ok: true, result };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { ok: false, message: "Esta prática não está mais disponível. Recarregue a página." };
    }
    console.error("Falha ao registrar resposta", error);
    return { ok: false, message: "Não foi possível enviar sua resposta. Tente de novo." };
  }
}
