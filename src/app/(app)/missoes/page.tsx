import type { Metadata } from "next";
import Link from "next/link";

import { MISSION_PASS_PERCENT, SKILL_LABEL } from "@/content";
import { formatDate } from "@/lib/format";
import type { MissionStatus } from "@/lib/learning/missions";
import { requireUser } from "@/lib/session";
import { getMissionsOverview } from "@/server/missions";

import styles from "./missoes.module.css";

export const metadata: Metadata = { title: "Missões" };

const STATUS_LABEL: Record<MissionStatus, string> = {
  bloqueada: "Bloqueada",
  disponivel: "Disponível",
  "em-andamento": "Em andamento",
  concluida: "Concluída",
};

/** Fase C2 — Missões e Desafios Práticos. */
export default async function MissionsPage() {
  const user = await requireUser("/missoes");
  const items = await getMissionsOverview(user.id);
  const done = items.filter((m) => m.status === "concluida").length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className="eyebrow-text">
          Missões · {done} de {items.length} concluídas
        </p>
        <h1 className={styles.title}>Missões</h1>
        <p className={styles.lead}>
          Casos práticos que juntam o que você aprendeu nos módulos. Cada missão libera quando você conclui o
          módulo que ela pratica e conta como concluída com {MISSION_PASS_PERCENT}% dos passos certos.
        </p>
      </header>

      <ul className={styles.list}>
        {items.map((m) => {
          const locked = m.status === "bloqueada";
          return (
            <li key={m.id} className={`${styles.item} ${locked ? styles.itemLocked : ""}`}>
              <div className={styles.itemHead}>
                <h2 className={styles.itemTitle}>
                  {locked ? m.title : <Link href={`/missoes/${m.id}`}>{m.title}</Link>}
                </h2>
                <span className={styles.status} data-status={m.status}>
                  {STATUS_LABEL[m.status]}
                </span>
              </div>
              <p className={styles.itemText}>{m.summary}</p>
              <p className={styles.meta}>
                <span>{m.skill === "integradora" ? "Todas as habilidades" : SKILL_LABEL[m.skill]}</span>
                <span>{m.stepCount ? `${m.stepCount} passos` : "Construtor de prompt"}</span>
                <span>{m.xp} XP</span>
                {m.completedAt ? <span>Concluída em {formatDate(m.completedAt)}</span> : null}
              </p>
              {locked ? <p className={styles.itemText}>{m.unlockText}</p> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
