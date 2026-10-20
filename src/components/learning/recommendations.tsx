import Link from "next/link";

import type { Recommendation } from "@/lib/learning/scoring";
import { moduleTitle } from "@/server/content";

import styles from "./results.module.css";

/** SP11 — o que revisar ou concluir, com o motivo de cada recomendação. */
export function Recommendations({
  items,
  emptyText = "Nenhuma revisão necessária agora. Bom trabalho!",
}: {
  items: Recommendation[];
  emptyText?: string;
}) {
  if (items.length === 0) return <p className={styles.empty}>{emptyText}</p>;

  return (
    <ul className={styles.recs}>
      {items.map((rec) => (
        <li key={rec.moduleSlug} className={styles.rec}>
          <span className={rec.kind === "revisar" ? styles.recReview : styles.recFinish}>
            {rec.kind === "revisar" ? "Revisar" : "Concluir"}
          </span>
          <Link href={`/trilha/${rec.moduleSlug}`} className={styles.recTitle}>
            {moduleTitle(rec.moduleSlug)}
          </Link>
          <p className={styles.recReason}>{rec.reason}</p>
        </li>
      ))}
    </ul>
  );
}
