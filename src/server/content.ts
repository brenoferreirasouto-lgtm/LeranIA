import "server-only";

import {
  type Level,
  type Module,
  type Question,
  findModule,
  modules,
  placementQuestions,
  tracks,
} from "@/content";

import type { PublicQuestion } from "@/lib/learning/public-types";

export type { PublicQuestion };

export function toPublicQuestion(question: Question): PublicQuestion {
  return {
    id: question.id,
    scenario: question.scenario,
    sample: question.sample,
    prompt: question.prompt,
    options: question.options.map((o) => ({ id: o.id, text: o.text })),
  };
}

export function publicPlacementQuestions(): PublicQuestion[] {
  return placementQuestions.map(toPublicQuestion);
}

export type ModuleSummary = Pick<
  Module,
  "slug" | "title" | "summary" | "estimatedMinutes" | "storyIds"
> & { questionCount: number };

export function moduleSummary(module: Module): ModuleSummary {
  return {
    slug: module.slug,
    title: module.title,
    summary: module.summary,
    estimatedMinutes: module.estimatedMinutes,
    storyIds: module.storyIds,
    questionCount: module.practice.length,
  };
}

export function getModuleOrNull(slug: string): Module | null {
  return findModule(slug) ?? null;
}

export function trackFor(level: Level | null) {
  return tracks[level ?? "iniciante"];
}

export function moduleTitle(slug: string): string {
  return modules.find((m) => m.slug === slug)?.title ?? slug;
}
