import Link from "next/link";

import { formatDate } from "@/lib/format";
import type { SkillState } from "@/lib/learning/skills";

import styles from "./journey.module.css";

export type SkillMapItem = {
  skill: string;
  label: string;
  state: SkillState;
  pending: { slug: string; title: string }[];
  confirmedAt: Date | null;
};

const STATE_LABEL: Record<SkillState, string> = {
  "nao-praticada": "Ainda não praticada",
  dispensada: "Dispensada pelo nivelamento",
  "em-pratica": "Em prática",
  praticada: "Praticada",
  confirmada: "Confirmada na avaliação",
};

/** Quantos dos três passos (em prática, praticada, confirmada) já foram dados. */
const STEP: Record<SkillState, number> = {
  "nao-praticada": 0,
  dispensada: 0,
  "em-pratica": 1,
  praticada: 2,
  confirmada: 3,
};

function NextStep({ item, passPercent }: { item: SkillMapItem; passPercent: number }) {
  switch (item.state) {
    case "confirmada":
      return <>Confirmada em {formatDate(item.confirmedAt as Date)}.</>;
    case "praticada":
      return (
        <>
          Para confirmar, acerte pelo menos {passPercent}% das questões deste tema na{" "}
          <Link href="/avaliacao">avaliação final</Link>.
        </>
      );
    case "dispensada":
      return (
        <>
          O nivelamento indicou que você já domina o tema; a revisão é opcional:{" "}
          <ModuleLinks modules={item.pending} />.
        </>
      );
    default:
      return (
        <>
          {item.state === "em-pratica" ? "Falta concluir" : "Comece por"}: <ModuleLinks modules={item.pending} />.
        </>
      );
  }
}

function ModuleLinks({ modules }: { modules: SkillMapItem["pending"] }) {
  return (
    <>
      {modules.map((m, i) => (
        <span key={m.slug}>
          {i > 0 ? (i === modules.length - 1 ? " e " : ", ") : null}
          <Link href={`/trilha/${m.slug}`}>{m.title}</Link>
        </span>
      ))}
    </>
  );
}

/** Mapa de habilidades (ADR 0002): o que a pessoa já demonstrou em cada tema. */
export function SkillMap({ items, passPercent }: { items: SkillMapItem[]; passPercent: number }) {
  return (
    <ul className={styles.skills}>
      {items.map((item) => (
        <li key={item.skill} className={styles.skill} data-state={item.state}>
          <div className={styles.skillHead}>
            <h3 className={styles.skillName}>{item.label}</h3>
            <span className={styles.skillState}>{STATE_LABEL[item.state]}</span>
          </div>
          <div className={styles.skillSteps} aria-hidden="true">
            {[1, 2, 3].map((n) => (
              <span key={n} data-on={STEP[item.state] >= n || undefined} />
            ))}
          </div>
          <p className={styles.skillText}>
            <NextStep item={item} passPercent={passPercent} />
          </p>
        </li>
      ))}
    </ul>
  );
}
