import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LEVEL_LABEL, SKILL_LABEL, type Skill } from "@/content";
import { requireUser } from "@/lib/session";
import { moduleTitle, trackFor } from "@/server/content";
import { getLatestPlacement } from "@/server/learning";

import styles from "../nivelamento.module.css";

export const metadata: Metadata = { title: "Resultado do nivelamento" };

const SKILL_ORDER: Skill[] = ["conceitos", "alucinacoes", "prompts", "privacidade"];

/** SP03 — resultado do nivelamento e direcionamento para a trilha do nível. */
export default async function PlacementResultPage() {
  const user = await requireUser("/nivelamento/resultado");
  const result = await getLatestPlacement(user.id);
  if (!result) redirect("/nivelamento");

  const track = trackFor(result.level);

  return (
    <div className={styles.page}>
      <section className={styles.result} aria-labelledby="nivel">
        <p className={`eyebrow-text ${styles.eyebrowOnDark}`}>
          Resultado do nivelamento
        </p>
        <h1 id="nivel" className={styles.levelName}>
          Seu nível: <span>{LEVEL_LABEL[result.level]}</span>
        </h1>
        <p className={styles.score}>
          {result.correct} de {result.total} respostas certas ({result.percent}%)
        </p>
        <p className={styles.resultText}>{track.description}</p>
        <div className={styles.actions}>
          <Link href="/trilha" className="btn btn-primary">
            Começar a trilha
          </Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="por-tema">
        <h2 id="por-tema" className={styles.sectionTitle}>
          Por tema
        </h2>
        <ul className={styles.skills}>
          {SKILL_ORDER.filter((skill) => result.bySkill[skill]).map((skill) => {
            const score = result.bySkill[skill]!;
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
      </section>

      <section className={styles.section} aria-labelledby="sua-trilha">
        <h2 id="sua-trilha" className={styles.sectionTitle}>
          {track.title}
        </h2>
        <ol className={styles.trackList}>
          {track.steps.map((step) => (
            <li key={step.moduleSlug}>
              {moduleTitle(step.moduleSlug)}
              {step.optional ? <span className={styles.optional}> · revisão opcional</span> : null}
            </li>
          ))}
        </ol>
        <p>
          <Link href="/nivelamento">Refazer o nivelamento</Link>
        </p>
      </section>
    </div>
  );
}
