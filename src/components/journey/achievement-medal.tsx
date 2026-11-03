import styles from "./journey.module.css";

/** Medalha da conquista. Obtida: cheia. Ainda não: só o contorno. O texto ao lado diz qual é o caso. */
export function AchievementMedal({ earned }: { earned: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`${styles.medal} ${earned ? styles.medalEarned : styles.medalLocked}`}
      aria-hidden="true"
    >
      <path d="M16 4h16l-4 12H20z" className={styles.medalRibbon} />
      <circle cx="24" cy="29" r="15" className={styles.medalDisc} />
      {earned ? (
        <path d="M17.5 29.5l4.5 4.5 8.5-9" className={styles.medalMark} />
      ) : (
        <circle cx="24" cy="29" r="9" className={styles.medalInner} />
      )}
    </svg>
  );
}
