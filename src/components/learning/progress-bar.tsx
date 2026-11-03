import styles from "./learning.module.css";

type Props = {
  value: number;
  max: number;
  label: string;
  /** Texto à direita, ex.: "2 de 4 módulos". */
  detail?: string;
};

/** Barra de progresso acessível: o leitor de tela anuncia rótulo e valor. */
export function ProgressBar({ value, max, label, detail }: Props) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={styles.progress}>
      <div className={styles.progressLabel}>
        <span>{label}</span>
        {detail ? <span>{detail}</span> : null}
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={detail ?? `${percent}%`}
      >
        <div className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
