import type { Metadata } from "next";

import { requireUser } from "@/lib/session";

import styles from "./construtor.module.css";
import { PromptBuilder } from "./prompt-builder";

export const metadata: Metadata = { title: "Construtor de prompt" };

/** SP06 — Construtor guiado de prompts. */
export default async function PromptBuilderPage() {
  await requireUser("/construtor");

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className="eyebrow-text">Ferramenta</p>
        <h1 className={styles.title}>Construtor de prompt</h1>
        <p className={styles.lead}>
          Transforme uma necessidade em uma instrução clara, uma etapa por vez: contexto, objetivo,
          formato e restrições.
        </p>
        <p className={styles.privacy}>
          O que você escreve aqui fica só no seu navegador: nada é salvo nem enviado.
        </p>
      </header>
      <PromptBuilder />
    </div>
  );
}
