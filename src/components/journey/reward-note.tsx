import Link from "next/link";

import type { RewardSummary } from "@/lib/learning/public-types";

import { AchievementMedal } from "./achievement-medal";
import styles from "./journey.module.css";

type Props = {
  rewards: RewardSummary;
  /** Texto quando a atividade não rendeu XP (ex.: refazer). */
  emptyText?: string;
};

/** O que a atividade acabou de render: XP e conquistas novas. */
export function RewardNote({ rewards, emptyText }: Props) {
  if (rewards.xp === 0 && rewards.achievements.length === 0) {
    return emptyText ? <p className={styles.rewardEmpty}>{emptyText}</p> : null;
  }
  return (
    <div className={styles.reward}>
      {rewards.xp > 0 ? (
        <p className={styles.rewardXp}>
          <span className={styles.xpPill}>+{rewards.xp} XP</span>
        </p>
      ) : null}
      {rewards.achievements.length > 0 ? (
        <ul className={styles.rewardList}>
          {rewards.achievements.map((a) => (
            <li key={a.id} className={styles.rewardItem}>
              <AchievementMedal earned />
              <span>
                Conquista nova: <strong>{a.title}</strong>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <Link href="/jornada" className={styles.rewardLink}>
        Ver minha jornada
      </Link>
    </div>
  );
}
