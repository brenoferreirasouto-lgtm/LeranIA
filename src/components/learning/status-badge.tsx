import type { ModuleStatus } from "@/lib/learning/status";

import styles from "./learning.module.css";

const LABEL: Record<ModuleStatus, string> = {
  concluido: "Concluído",
  "em-andamento": "Em andamento",
  disponivel: "Disponível",
};

/** Situação do módulo com ícone e texto (nunca só cor). */
export function StatusBadge({ status }: { status: ModuleStatus }) {
  const className =
    status === "concluido"
      ? styles.statusDone
      : status === "em-andamento"
        ? styles.statusDoing
        : styles.statusTodo;

  return (
    <span className={`${styles.status} ${className}`}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        {status === "concluido" ? (
          <>
            <circle cx="8" cy="8" r="7" fill="currentColor" />
            <path d="m4.8 8.2 2.1 2.1 4.3-4.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : status === "em-andamento" ? (
          <>
            <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 1.8a6.2 6.2 0 0 1 0 12.4Z" fill="currentColor" />
          </>
        ) : (
          <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        )}
      </svg>
      {LABEL[status]}
    </span>
  );
}
