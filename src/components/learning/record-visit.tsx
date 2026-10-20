"use client";

import { useEffect } from "react";

import { recordVisitAction } from "@/app/(app)/learning-actions";

/**
 * SP05 — avisa o servidor que a pessoa abriu esta aula ou prática.
 * Roda no navegador (e não durante a renderização) para que pré-carregamentos
 * de links não contem como visita.
 */
export function RecordVisit({ slug, step }: { slug: string; step: "aula" | "pratica" }) {
  useEffect(() => {
    recordVisitAction(slug, step).catch(() => {
      // Registrar a visita é um detalhe: uma falha aqui não deve atrapalhar a aula.
    });
  }, [slug, step]);
  return null;
}
