import type { Metadata } from "next";
import Link from "next/link";

import { ProgressBar } from "@/components/learning/progress-bar";
import { StatusBadge } from "@/components/learning/status-badge";
import { LEVEL_LABEL, findModule } from "@/content";
import { nextActivity, summarizeTrack } from "@/lib/learning/scoring";
import { requireUser } from "@/lib/session";
import { trackFor } from "@/server/content";
import { getLevel, getProgress } from "@/server/learning";

import styles from "./trilha.module.css";

export const metadata: Metadata = { title: "Trilha de aprendizagem" };

/** U03 — Visualizar a trilha: módulos, situação de cada um e acesso a eles. */
export default async function TrackPage() {
  const user = await requireUser("/trilha");
  const [level, progress] = await Promise.all([getLevel(user.id), getProgress(user.id)]);
  const track = trackFor(level);
  const summary = summarizeTrack(track, progress);
  const next = nextActivity(track, progress);
  const bestScore = new Map(progress.map((p) => [p.moduleSlug, p.bestScorePercent]));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className="eyebrow-text">{level ? `Nível ${LEVEL_LABEL[level]}` : "Sem nivelamento"}</p>
        <h1 className={styles.title}>{track.title}</h1>
        <p className={styles.lead}>{track.description}</p>
        <ProgressBar
          value={summary.requiredDone}
          max={summary.requiredTotal}
          label="Módulos obrigatórios concluídos"
          detail={`${summary.requiredDone} de ${summary.requiredTotal}`}
        />
      </header>

      {!level ? (
        <p className={styles.notice} role="note">
          Você ainda não fez o nivelamento, então mostramos a trilha Iniciante.{" "}
          <Link href="/nivelamento">Fazer o nivelamento</Link> para ver a trilha do seu nível.
        </p>
      ) : null}

      {summary.requiredDone === summary.requiredTotal ? (
        <p className={styles.done} role="status">
          Você concluiu todos os módulos obrigatórios desta trilha. Os opcionais continuam
          disponíveis para revisão.
        </p>
      ) : null}

      <ol className={styles.modules}>
        {summary.steps.map((step) => {
          const learningModule = findModule(step.moduleSlug)!;
          const isNext = next?.moduleSlug === step.moduleSlug;
          const score = bestScore.get(step.moduleSlug);
          return (
            <li key={step.moduleSlug} className={`${styles.module} ${isNext ? styles.moduleNext : ""}`}>
              <div className={styles.moduleHead}>
                <StatusBadge status={step.status} />
                {step.optional ? <span className={styles.optional}>Revisão opcional</span> : null}
                {isNext ? <span className={styles.nextTag}>Próximo passo</span> : null}
              </div>
              <h2 className={styles.moduleTitle}>
                <Link href={`/trilha/${learningModule.slug}`} className={styles.moduleLink}>
                  {learningModule.title}
                </Link>
              </h2>
              <p className={styles.summary}>{learningModule.summary}</p>
              <p className={styles.meta}>
                Aula de ~{learningModule.estimatedMinutes} min · {learningModule.practice.length} perguntas de
                prática
                {score != null ? ` · melhor nota ${score}%` : ""}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
