import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SkillBars } from "@/components/learning/skill-bars";
import { LEVEL_LABEL } from "@/content";
import { requireUser } from "@/lib/session";
import { moduleTitle, trackFor } from "@/server/content";
import { getLatestPlacement } from "@/server/learning";
import { getAttemptXp } from "@/server/rewards";

import styles from "../nivelamento.module.css";

export const metadata: Metadata = { title: "Resultado do nivelamento" };

/** SP03 — resultado do nivelamento e direcionamento para a trilha do nível. */
export default async function PlacementResultPage() {
  const user = await requireUser("/nivelamento/resultado");
  const result = await getLatestPlacement(user.id);
  if (!result) redirect("/nivelamento");

  const track = trackFor(result.level);
  const xp = await getAttemptXp(user.id, result.attemptId);

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
        <p className={styles.score}>
          {xp > 0 ? `Este nivelamento rendeu ${xp} XP.` : "Refazer o nivelamento não rende XP de novo."}{" "}
          <Link href="/jornada" className={styles.linkOnDark}>
            Ver minha jornada
          </Link>
        </p>
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
        <SkillBars bySkill={result.bySkill} />
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
