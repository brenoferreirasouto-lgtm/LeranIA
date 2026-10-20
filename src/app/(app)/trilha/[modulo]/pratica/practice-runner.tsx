"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import learning from "@/components/learning/learning.module.css";
import { ProgressBar } from "@/components/learning/progress-bar";
import { QuestionChoices } from "@/components/learning/question-choices";
import type { Feedback, PracticeOutcome, PublicQuestion } from "@/lib/learning/public-types";

import { answerPracticeAction, startPracticeAction } from "../../../learning-actions";
import styles from "../modulo.module.css";

type Props = {
  slug: string;
  attemptId: string;
  questions: PublicQuestion[];
  /** Respostas já dadas nesta tentativa (para retomar de onde parou). */
  answered: Feedback[];
  lessonCompleted: boolean;
  passPercent: number;
};

/**
 * SP13 — responde uma questão por vez e mostra o feedback antes de seguir.
 * A correção acontece no servidor; o gabarito só chega depois da resposta.
 */
export function PracticeRunner({
  slug,
  attemptId,
  questions,
  answered,
  lessonCompleted,
  passPercent,
}: Props) {
  const [feedback, setFeedback] = useState<Record<string, Feedback>>(() =>
    Object.fromEntries(answered.map((a) => [a.questionId, a])),
  );
  const [index, setIndex] = useState(() => {
    const first = questions.findIndex((q) => !answered.some((a) => a.questionId === q.id));
    return first === -1 ? questions.length - 1 : first;
  });
  const [selected, setSelected] = useState<string>();
  const [outcome, setOutcome] = useState<PracticeOutcome | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const outcomeRef = useRef<HTMLDivElement>(null);
  const advanced = useRef(false);

  const total = questions.length;
  const current = questions[index];
  const currentFeedback = feedback[current.id];
  const answeredCount = Object.keys(feedback).length;
  const isLast = index === total - 1;

  useEffect(() => {
    if (advanced.current) questionRef.current?.focus();
  }, [index]);

  useEffect(() => {
    if (currentFeedback) feedbackRef.current?.focus();
  }, [currentFeedback]);

  useEffect(() => {
    if (showOutcome) outcomeRef.current?.focus();
  }, [showOutcome]);

  function submitAnswer() {
    if (!selected) {
      setError("Escolha uma alternativa antes de responder.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const response = await answerPracticeAction({
          slug,
          attemptId,
          questionId: current.id,
          optionId: selected,
        });
        if (!response.ok) {
          setError(response.message);
          return;
        }
        const { outcome: finished, ...result } = response.result;
        setFeedback((prev) => ({ ...prev, [current.id]: result }));
        if (finished) setOutcome(finished);
      } catch {
        setError("Não foi possível enviar sua resposta. Verifique sua conexão e tente de novo.");
      }
    });
  }

  function goNext() {
    advanced.current = true;
    setSelected(undefined);
    setError(null);
    setIndex((i) => i + 1);
  }

  if (showOutcome && outcome) {
    return (
      <section className={styles.runner} aria-labelledby="resultado-pratica">
        <div className={styles.outcome} ref={outcomeRef} tabIndex={-1}>
          <h2 id="resultado-pratica" className={styles.outcomeScore}>
            Você acertou {outcome.correct} de {outcome.total} ({outcome.percent}%)
          </h2>
          {outcome.moduleCompleted ? (
            <p className={styles.outcomePassed}>Módulo concluído.</p>
          ) : outcome.passed ? (
            <p className={styles.outcomePassed}>
              Prática aprovada. {lessonCompleted ? "" : "Conclua a aula para fechar o módulo."}
            </p>
          ) : (
            <p className={styles.outcomeRetry}>
              Para concluir o módulo, acerte pelo menos {passPercent}%. Revise a aula e tente de novo: as
              explicações ajudam a entender cada erro.
            </p>
          )}
          <div className={styles.runnerActions}>
            <Link href="/trilha" className="btn btn-primary">
              Voltar para a trilha
            </Link>
            {!outcome.passed || !lessonCompleted ? (
              <Link href={`/trilha/${slug}`} className="btn btn-secondary">
                {lessonCompleted ? "Revisar a aula" : "Ir para a aula"}
              </Link>
            ) : null}
            {!outcome.passed ? (
              <form action={startPracticeAction.bind(null, slug)}>
                <button type="submit" className="btn btn-secondary">
                  Tentar de novo
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.runner} aria-label="Prática">
      <ProgressBar value={answeredCount} max={total} label="Respondidas" detail={`${answeredCount} de ${total}`} />

      <div ref={questionRef} tabIndex={-1}>
        <QuestionChoices
          question={current}
          name={`pratica-${current.id}`}
          eyebrow={`Pergunta ${index + 1} de ${total}`}
          selected={selected}
          onSelect={(optionId) => {
            setSelected(optionId);
            setError(null);
          }}
          reveal={
            currentFeedback
              ? { chosen: currentFeedback.optionId, correct: currentFeedback.correctOptionId }
              : undefined
          }
        />
      </div>

      <div aria-live="polite">
        {currentFeedback ? (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            className={`${learning.feedback} ${
              currentFeedback.isCorrect ? learning.feedbackCorrect : learning.feedbackWrong
            }`}
          >
            <p className={learning.feedbackTitle}>
              {currentFeedback.isCorrect ? "Resposta certa." : "Não foi dessa vez."}
            </p>
            <p>{currentFeedback.explanation}</p>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.runnerActions}>
        {!currentFeedback ? (
          <button type="button" className="btn btn-primary" onClick={submitAnswer} disabled={pending}>
            {pending ? "Enviando…" : "Responder"}
          </button>
        ) : isLast || outcome ? (
          <button type="button" className="btn btn-primary" onClick={() => setShowOutcome(true)} disabled={!outcome}>
            Ver resultado
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={goNext}>
            Próxima pergunta
          </button>
        )}
      </div>
    </section>
  );
}
