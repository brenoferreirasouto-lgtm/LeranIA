import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Recommendations } from "@/components/learning/recommendations";
import { SkillBars } from "@/components/learning/skill-bars";
import { ASSESSMENT_PASS_PERCENT } from "@/content";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { getResults } from "@/server/assessment";

import styles from "../avaliacao.module.css";

export const metadata: Metadata = { title: "Correção da avaliação" };

/** SP12 — resultado da avaliação com correção comentada e recomendações (SP11). */
export default async function AssessmentResultPage() {
  const user = await requireUser("/avaliacao/resultado");
  const results = await getResults(user.id);
  const assessment = results.assessment;
  if (!assessment) redirect("/avaliacao");

  return (
    <div className={styles.page}>
      <section className={styles.score} aria-labelledby="nota">
        <p className={`eyebrow-text ${styles.eyebrowOnDark}`}>
          Avaliação final · {formatDate(assessment.createdAt)}
        </p>
        <h1 id="nota" className={styles.scoreValue}>
          {assessment.correct} de {assessment.total} ({assessment.percent}%)
        </h1>
        {assessment.passed ? (
          <p className={styles.passed}>Aprovado na avaliação final.</p>
        ) : (
          <p className={styles.failed}>
            Ainda não foi desta vez: a aprovação pede {ASSESSMENT_PASS_PERCENT}%. Revise os temas
            indicados abaixo e refaça quando quiser.
          </p>
        )}
        {assessment.attemptCount > 1 ? (
          <p>
            Tentativa {assessment.attemptCount} · melhor nota {assessment.bestPercent}%
          </p>
        ) : null}
      </section>

      <section className={styles.section} aria-labelledby="por-tema">
        <h2 id="por-tema" className={styles.sectionTitle}>
          Por tema
        </h2>
        <SkillBars bySkill={assessment.bySkill} />
      </section>

      <section className={styles.section} aria-labelledby="recomendacoes">
        <h2 id="recomendacoes" className={styles.sectionTitle}>
          O que revisar
        </h2>
        <Recommendations items={results.recommendations} />
      </section>

      <section className={styles.section} aria-labelledby="correcao">
        <h2 id="correcao" className={styles.sectionTitle}>
          Correção
        </h2>
        <ol className={styles.review}>
          {assessment.review.map(({ question, chosenOptionId, isCorrect }) => {
            const chosen = question.options.find((o) => o.id === chosenOptionId);
            const correct = question.options.find((o) => o.id === question.correctOptionId);
            return (
              <li key={question.id} className={`${styles.reviewItem} ${isCorrect ? styles.reviewRight : styles.reviewWrong}`}>
                <p className={styles.reviewHead}>
                  <span className={styles.reviewTag}>{isCorrect ? "Certa" : "Errada"}</span>
                </p>
                {question.sample ? <p className={styles.reviewAnswer}>“{question.sample.text}”</p> : null}
                {question.scenario ? <p className={styles.reviewAnswer}>{question.scenario}</p> : null}
                <p className={styles.reviewPrompt}>{question.prompt}</p>
                <p className={styles.reviewAnswer}>
                  <strong>Sua resposta:</strong> {chosen?.text}
                </p>
                {!isCorrect ? (
                  <p className={styles.reviewAnswer}>
                    <strong>Resposta correta:</strong> {correct?.text}
                  </p>
                ) : null}
                <p className={styles.reviewExplanation}>{question.explanation}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <div className={styles.actions}>
        <Link href="/resultado" className="btn btn-primary">
          Ver meu resultado geral
        </Link>
        <Link href="/avaliacao" className="btn btn-secondary">
          Refazer a avaliação
        </Link>
      </div>
    </div>
  );
}
