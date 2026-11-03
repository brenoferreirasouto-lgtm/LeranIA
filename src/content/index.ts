import "server-only";

/*
 * Catálogo do conteúdo. ATENÇÃO: este módulo contém as respostas corretas.
 * O "server-only" acima faz o build falhar se um componente de cliente o
 * importar, e o eslint.config.mjs proíbe importar os arquivos internos
 * (@/content/...) diretamente. As telas recebem versões sem gabarito via
 * src/server/content.ts.
 */
import { alucinacoes } from "./modules/alucinacoes";
import { comparacaoDePrompts } from "./modules/comparacao-de-prompts";
import { estruturaDeUmBomPrompt } from "./modules/estrutura-de-um-bom-prompt";
import { introducaoIaGenerativa } from "./modules/introducao-ia-generativa";
import { privacidadeEDados } from "./modules/privacidade-e-dados";
import { verificarInformacoes } from "./modules/verificar-informacoes";
import type { Module } from "./types";

export { ASSESSMENT_PASS_PERCENT, finalAssessment } from "./assessment";
export { DONT_KNOW_OPTION_ID, LEVEL_RULES, placementQuestions } from "./placement";
export * from "./gamification";
export { MISSION_PASS_PERCENT, findMission, missions } from "./missions";
export { findProjectTemplate, projectTemplates } from "./project-templates";
export { tracks } from "./tracks";
export * from "./types";

export const modules: Module[] = [
  introducaoIaGenerativa,
  estruturaDeUmBomPrompt,
  comparacaoDePrompts,
  alucinacoes,
  verificarInformacoes,
  privacidadeEDados,
];

/**
 * Nota mínima para concluir a prática de um módulo — PROPOSTA PARA VALIDAÇÃO.
 * Com 5 questões, 4 acertos (80%) concluem; 3 (60%) pedem nova tentativa.
 */
export const PRACTICE_PASS_PERCENT = 70;

export function findModule(slug: string): Module | undefined {
  return modules.find((m) => m.slug === slug);
}
