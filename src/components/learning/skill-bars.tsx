import { SKILL_LABEL, type Skill } from "@/content";
import type { SkillScore } from "@/lib/learning/scoring";

import styles from "./results.module.css";

const ORDER: Skill[] = ["conceitos", "alucinacoes", "verificacao", "prompts", "privacidade"];

/** Acertos por tema, como barras acessíveis (nivelamento e avaliação final). */
export function SkillBars({ bySkill }: { bySkill: Partial<Record<Skill, SkillScore>> }) {
  return (
    <ul className={styles.skills}>
      {ORDER.filter((skill) => bySkill[skill]).map((skill) => {
        const score = bySkill[skill]!;
        const percent = Math.round((score.correct / score.total) * 100);
        return (
          <li key={skill} className={styles.skill}>
            <div className={styles.skillHead}>
              <span>{SKILL_LABEL[skill]}</span>
              <span className={styles.skillValue}>
                {score.correct} de {score.total}
              </span>
            </div>
            <div
              className={styles.skillTrack}
              role="progressbar"
              aria-label={SKILL_LABEL[skill]}
              aria-valuemin={0}
              aria-valuemax={score.total}
              aria-valuenow={score.correct}
              aria-valuetext={`${score.correct} de ${score.total}`}
            >
              <div className={styles.skillFill} style={{ width: `${percent}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
