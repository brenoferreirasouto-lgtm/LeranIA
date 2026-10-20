"use client";

import { type ReactNode, useOptimistic, useTransition } from "react";
import { useFormStatus } from "react-dom";

import styles from "./lab.module.css";

type ToggleProps = {
  checked: boolean;
  action: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
  describedBy?: string;
};

/**
 * Caixa de seleção que salva sozinha (tarefa feita, referência conferida,
 * "não usei IA"). Mostra a mudança na hora e confirma com o servidor.
 */
export function ToggleCheck({ checked, action, children, disabled, describedBy }: ToggleProps) {
  const [optimistic, setOptimistic] = useOptimistic(checked);
  const [pending, startTransition] = useTransition();

  return (
    <label className={styles.toggle} data-checked={optimistic} aria-busy={pending || undefined}>
      <input
        type="checkbox"
        checked={optimistic}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={() =>
          startTransition(async () => {
            setOptimistic(!optimistic);
            await action();
          })
        }
      />
      <span>{children}</span>
    </label>
  );
}

function RemoveSubmit({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.remove} disabled={pending} aria-disabled={pending}>
      {pending ? "Removendo…" : children}
    </button>
  );
}

/** Botão "Remover" de uma tarefa, referência ou registro. O nome completo vai para leitores de tela. */
export function RemoveButton({ action, what }: { action: () => Promise<void>; what: string }) {
  return (
    <form action={action}>
      <RemoveSubmit>
        Remover<span className="visually-hidden"> {what}</span>
      </RemoveSubmit>
    </form>
  );
}
