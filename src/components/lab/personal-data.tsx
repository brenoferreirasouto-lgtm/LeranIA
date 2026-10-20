"use client";

import { type FormEvent, useState } from "react";

import { listPt } from "@/lib/format";
import { type PersonalDataKind, findPersonalData } from "@/lib/prompt-builder";

import styles from "./lab.module.css";

function formText(form: HTMLFormElement): string {
  return Array.from(form.elements)
    .flatMap((el) =>
      (el instanceof HTMLInputElement && (el.type === "text" || el.type === "url")) || el instanceof HTMLTextAreaElement
        ? [el.value]
        : [],
    )
    .join("\n");
}

/**
 * Avisa, enquanto a pessoa escreve, quando o texto parece ter dados pessoais
 * (mesma detecção do construtor de prompt). Só avisa: nada é bloqueado.
 */
export function usePersonalData(initialText = "") {
  const [kinds, setKinds] = useState<PersonalDataKind[]>(() => findPersonalData(initialText));
  const onInput = (event: FormEvent<HTMLFormElement>) => setKinds(findPersonalData(formText(event.currentTarget)));
  return { kinds, onInput };
}

/** Região anunciada por leitores de tela; fica vazia quando não há aviso. */
export function PersonalDataWarning({ kinds }: { kinds: PersonalDataKind[] }) {
  return (
    <p role="status" className={styles.privacy}>
      {kinds.length > 0
        ? `Parece que há ${listPt(kinds)} no texto. Troque por algo genérico: o projeto não precisa de dados pessoais.`
        : null}
    </p>
  );
}
