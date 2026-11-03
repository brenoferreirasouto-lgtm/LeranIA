import styles from "./journey.module.css";

type Props = {
  xp: number;
  stage: number;
  stages: { stage: number; minXp: number }[];
  /** "dark" para usar sobre o fundo azul-marinho. */
  tone?: "light" | "dark";
};

/** Texto do que falta, usado na barra e ao lado dela. */
export function stageProgressText(xp: number, stage: number, stages: Props["stages"]): string {
  const next = stages.find((s) => s.stage === stage + 1);
  if (!next) return `Estágio ${stage}, o último. ${xp} XP.`;
  return `Estágio ${stage} de ${stages.length}, ${xp} XP. Faltam ${next.minXp - xp} XP para o Estágio ${next.stage}.`;
}

/**
 * Os cinco estágios em segmentos iguais. Os já alcançados ficam cheios; o
 * atual enche na proporção do caminho até o próximo limiar.
 */
export function StageMeter({ xp, stage, stages, tone = "light" }: Props) {
  const ordered = [...stages].sort((a, b) => a.minXp - b.minXp);
  const text = stageProgressText(xp, stage, ordered);

  return (
    <div
      className={`${styles.meter} ${tone === "dark" ? styles.meterDark : ""}`}
      role="progressbar"
      aria-label="Estágio da jornada"
      aria-valuemin={1}
      aria-valuemax={ordered.length}
      aria-valuenow={stage}
      aria-valuetext={text}
    >
      {ordered.map((s, i) => {
        const next = ordered[i + 1];
        let fill = 0;
        if (s.stage < stage) fill = 100;
        else if (s.stage === stage) {
          fill = next ? Math.round(((xp - s.minXp) / (next.minXp - s.minXp)) * 100) : 100;
        }
        return (
          <div key={s.stage} className={styles.segment} data-current={s.stage === stage || undefined}>
            <div className={styles.segmentTrack}>
              <div className={styles.segmentFill} style={{ width: `${Math.max(0, Math.min(100, fill))}%` }} />
            </div>
            <span className={styles.segmentLabel} aria-hidden="true">
              {s.stage}
              <span className={styles.segmentXp}>{s.minXp} XP</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
