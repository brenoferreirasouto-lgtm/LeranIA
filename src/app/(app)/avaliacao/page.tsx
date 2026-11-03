import type { Metadata } from "next";
import Link from "next/link";

import { ProgressBar } from "@/components/learning/progress-bar";
import { QuizForm } from "@/components/learning/quiz-form";
import { ASSESSMENT_PASS_PERCENT, finalAssessment } from "@/content";
import { requireUser } from "@/lib/session";
import { getAssessmentState } from "@/server/assessment";
import { toPublicQuestion } from "@/server/content";

import { submitAssessmentAction } from "../learning-actions";
import styles from "./avaliacao.module.css";

export const metadata: Metadata = { title: "Avaliação final" };

/** SP12 — Quiz de avaliação do aprendizado, ao final da trilha. */
export default async function AssessmentPage() {
  const user = await requireUser("/avaliacao");
  const { unlocked, summary, latest } = await getAssessmentState(user.id);

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className="eyebrow-text">Avaliação final</p>
        <h1 className={styles.title}>{finalAssessment.title}</h1>
        <p className={styles.lead}>{finalAssessment.description}</p>
        {latest ? (
          <p className={styles.note}>
            Sua última nota: {latest.correct} de {latest.total} ({latest.percent}%).{" "}
            <Link href="/avaliacao/resultado">Ver a correção</Link>
          </p>
        ) : null}
      </header>

      {unlocked ? (
        <>
          <p className={styles.note}>
            Responda todas as perguntas; a correção aparece no final. Para ser aprovado, acerte pelo
            menos {ASSESSMENT_PASS_PERCENT}%. Você pode refazer quando quiser.
          </p>
          <QuizForm
            questions={finalAssessment.questions.map(toPublicQuestion)}
            action={submitAssessmentAction}
            submitLabel="Enviar avaliação"
            pendingLabel="Corrigindo…"
          />
        </>
      ) : (
        <section className={styles.locked} aria-labelledby="bloqueada">
          <h2 id="bloqueada" className={styles.lockedTitle}>
            Disponível ao concluir os módulos obrigatórios
          </h2>
          <ProgressBar
            value={summary.requiredDone}
            max={summary.requiredTotal}
            label="Módulos obrigatórios concluídos"
            detail={`${summary.requiredDone} de ${summary.requiredTotal}`}
          />
          <div>
            <Link href="/trilha" className="btn btn-primary">
              Ir para a trilha
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
