/*
 * Mapa de habilidades (ADR 0002, decisão 6) — regras puras, sem banco.
 * O estado de cada habilidade vem do que a pessoa já demonstrou; nunca desce.
 */
import { type Skill, modules, tracks } from "@/content";

import type { LearnerFacts } from "./gamification";

export type SkillState = "nao-praticada" | "dispensada" | "em-pratica" | "praticada" | "confirmada";

/** Ordem em que as habilidades aparecem (a mesma das trilhas). */
export const SKILL_ORDER: Skill[] = ["conceitos", "prompts", "alucinacoes", "verificacao", "privacidade"];

export type SkillMapEntry = {
  skill: Skill;
  state: SkillState;
  /** Módulos que praticam a habilidade. */
  moduleSlugs: string[];
  /** Módulos da habilidade ainda não concluídos. */
  pendingSlugs: string[];
  /** Quando ficou confirmada (o mais tarde entre concluir os módulos e acertar na avaliação). */
  confirmedAt: Date | null;
};

function latest(dates: Date[]): Date {
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

/**
 * Estado de cada habilidade:
 * - confirmada: todos os módulos concluídos e 70% ou mais nas questões do tema em alguma tentativa da avaliação;
 * - praticada: todos os módulos da habilidade concluídos;
 * - em prática: já há prática finalizada, mas falta concluir algum módulo;
 * - dispensada: os módulos são revisão opcional na trilha e não foram praticados;
 * - não praticada: nenhuma prática finalizada.
 */
export function skillMap(facts: LearnerFacts): SkillMapEntry[] {
  const track = tracks[facts.level ?? "iniciante"];
  const optional = new Set(track.steps.filter((s) => s.optional).map((s) => s.moduleSlug));
  const progress = new Map(facts.progress.map((p) => [p.moduleSlug, p]));
  // Praticado: tem prática finalizada ou o módulo já foi concluído (o que exige a prática).
  const practiced = new Set([
    ...facts.firstPractices.map((p) => p.moduleSlug),
    ...facts.progress.filter((p) => p.completedAt).map((p) => p.moduleSlug),
  ]);

  return SKILL_ORDER.map((skill) => {
    const moduleSlugs = modules.filter((m) => m.skill === skill).map((m) => m.slug);
    const completedAt = moduleSlugs.map((slug) => progress.get(slug)?.completedAt ?? null);
    const pendingSlugs = moduleSlugs.filter((_slug, i) => !completedAt.at(i));
    const allCompleted = pendingSlugs.length === 0;
    const pass = facts.assessmentSkillPasses.find((p) => p.skill === skill);

    let state: SkillState;
    let confirmedAt: Date | null = null;
    if (allCompleted && pass) {
      state = "confirmada";
      confirmedAt = latest([...(completedAt as Date[]), pass.at]);
    } else if (allCompleted) {
      state = "praticada";
    } else if (moduleSlugs.some((slug) => practiced.has(slug))) {
      state = "em-pratica";
    } else if (moduleSlugs.every((slug) => optional.has(slug))) {
      state = "dispensada";
    } else {
      state = "nao-praticada";
    }
    return { skill, state, moduleSlugs, pendingSlugs, confirmedAt };
  });
}
