/*
 * Missões (Fase C2) — regras puras, sem banco.
 */
import { MISSION_PASS_PERCENT, type Mission, type MissionStep, type Track, findModule } from "@/content";
import { type PromptFields, findPersonalData } from "@/lib/prompt-builder";

import { type ModuleProgress, percentOf, summarizeTrack } from "./scoring";

/** Um passo de várias respostas só conta como certo com exatamente as alternativas corretas. */
export function gradeStep(step: MissionStep, optionIds: string[]): boolean {
  const chosen = new Set(optionIds);
  if (chosen.size !== step.correctOptionIds.length) return false;
  return step.correctOptionIds.every((id) => chosen.has(id));
}

/** As alternativas enviadas existem no passo e respeitam o tipo (uma só, ou várias). */
export function validStepAnswer(step: MissionStep, optionIds: string[]): boolean {
  if (optionIds.length === 0) return false;
  if (new Set(optionIds).size !== optionIds.length) return false;
  if (!step.multiple && optionIds.length !== 1) return false;
  return optionIds.every((id) => step.options.some((o) => o.id === id));
}

export function missionPassed(correct: number, total: number): boolean {
  return percentOf(correct, total) >= MISSION_PASS_PERCENT;
}

export type MissionStatus = "bloqueada" | "disponivel" | "em-andamento" | "concluida";

export function missionUnlocked(mission: Mission, track: Track, progress: ModuleProgress[]): boolean {
  if (mission.unlock.kind === "module") {
    const slug = mission.unlock.moduleSlug;
    return progress.some((p) => p.moduleSlug === slug && p.completedAt);
  }
  const summary = summarizeTrack(track, progress);
  return summary.requiredTotal > 0 && summary.requiredDone === summary.requiredTotal;
}

/** Texto curto do que falta para liberar a missão. */
export function unlockText(mission: Mission): string {
  if (mission.unlock.kind === "module") {
    const title = findModule(mission.unlock.moduleSlug)?.title ?? mission.unlock.moduleSlug;
    return `Libera ao concluir o módulo "${title}".`;
  }
  return "Libera ao concluir todos os módulos obrigatórios da sua trilha.";
}

/* ---------- Missão do construtor de prompt ---------- */

/** Tamanhos mínimos para cada elemento contar como preenchido. */
export const PROMPT_MISSION_MIN = { contexto: 10, objetivo: 15, formato: 10, restricoes: 10 } as const;

const FIELD_MESSAGES: Record<keyof PromptFields, { empty: string; short: string }> = {
  contexto: { empty: "Preencha o contexto.", short: "O contexto está curto demais." },
  objetivo: { empty: "Preencha o objetivo.", short: "O objetivo está curto demais." },
  formato: { empty: "Preencha o formato.", short: "O formato está curto demais." },
  restricoes: { empty: "Preencha as restrições.", short: "As restrições estão curtas demais." },
};

export type PromptMissionCheck = {
  passed: boolean;
  /** O que impede de concluir; vazio quando passou. */
  problems: string[];
};

/**
 * Confere só a estrutura: os quatro elementos preenchidos e nenhum dado
 * pessoal. Não avalia a qualidade do prompt (isso exigiria revisão humana
 * ou uma IA avaliadora). O texto não é gravado.
 */
export function checkPromptMission(fields: PromptFields): PromptMissionCheck {
  const problems: string[] = [];
  for (const key of Object.keys(PROMPT_MISSION_MIN) as (keyof PromptFields)[]) {
    const length = fields[key].trim().length;
    if (length === 0) problems.push(FIELD_MESSAGES[key].empty);
    else if (length < PROMPT_MISSION_MIN[key]) problems.push(FIELD_MESSAGES[key].short);
  }
  const personal = findPersonalData(Object.values(fields).join("\n"));
  if (personal.length > 0) {
    problems.push(`Tire os dados pessoais: encontramos ${personal.join(", ")}.`);
  }
  return { passed: problems.length === 0, problems };
}
