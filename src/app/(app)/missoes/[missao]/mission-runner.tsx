"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { RewardNote } from "@/components/journey/reward-note";
import learning from "@/components/learning/learning.module.css";
import { ProgressBar } from "@/components/learning/progress-bar";
import { StepChoices } from "@/components/missions/step-choices";
import type { MissionFeedback, MissionOutcome, PublicMissionStep } from "@/lib/learning/public-types";

import { answerMissionStepAction, startMissionAction } from "../actions";
import styles from "../missoes.module.css";

type Props = {
  missionId: string;
  attemptId: string;
  steps: PublicMissionStep[];
  answered: MissionFeedback[];
  passPercent: number;
  hintOpen: boolean;
};

/**
 * Missão em passos: um passo por vez, com explicação depois de cada
 * resposta. A correção acontece no servidor; o gabarito só chega depois.
 */
export function MissionRunner({ missionId, attemptId, steps, answered, passPercent, hintOpen }: Props) {
  const [feedback, setFeedback] = useState<Record<string, MissionFeedback>>(() =>
    Object.fromEntries(answered.map((a) => [a.stepId, a])),
  );
  const [index, setIndex] = useState(() => {
    const first = steps.findIndex((s) => !answered.some((a) => a.stepId === s.id));
    return first === -1 ? steps.length - 1 : first;
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<MissionOutcome | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const outcomeRef = useRef<HTMLDivElement>(null);
  const advanced = useRef(false);

  const total = steps.length;
  const current = steps[index];
  const currentFeedback = feedback[current.id];
  const answeredCount = Object.keys(feedback).length;
  const isLast = index === total - 1;

  useEffect(() => {
    if (advanced.current) stepRef.current?.focus();
  }, [index]);

  useEffect(() => {
    if (currentFeedback) feedbackRef.current?.focus();
  }, [currentFeedback]);

  useEffect(() => {
    if (showOutcome) outcomeRef.current?.focus();
  }, [showOutcome]);

  function submit() {
    if (selected.length === 0) {
      setError(current.multiple ? "Marque pelo menos uma alternativa." : "Escolha uma alternativa antes de responder.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const response = await answerMissionStepAction({
          missionId,
          attemptId,
          stepId: current.id,
          optionIds: selected,
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
    setSelected([]);
    setError(null);
    setIndex((i) => i + 1);
  }

  if (showOutcome && outcome) {
    return (
      <section className={styles.runner} aria-labelledby="resultado-missao">
        <div className={styles.outcome} ref={outcomeRef} tabIndex={-1}>
          <h2 id="resultado-missao" className={styles.outcomeScore}>
            {outcome.correct} de {outcome.total} passos certos ({outcome.percent}%)
          </h2>
          {outcome.passed ? (
            <p className={styles.passed}>Missão concluída.</p>
          ) : (
            <p className={styles.retry}>
              Para concluir a missão, acerte pelo menos {passPercent}% dos passos. Releia as explicações e
              tente de novo.
            </p>
          )}
          <RewardNote
            rewards={outcome.rewards}
            emptyText={outcome.passed ? "Esta tentativa não rendeu XP: cada missão paga uma vez." : undefined}
          />
          <div className={styles.actions}>
            <Link href="/missoes" className="btn btn-primary">
              Voltar para as missões
            </Link>
            {!outcome.passed ? (
              <form action={startMissionAction.bind(null, missionId)}>
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
    <section className={styles.runner} aria-label="Missão">
      <ProgressBar value={answeredCount} max={total} label="Passos respondidos" detail={`${answeredCount} de ${total}`} />

      <div ref={stepRef} tabIndex={-1}>
        <StepChoices
          step={current}
          name={`missao-${current.id}`}
          eyebrow={`Passo ${index + 1} de ${total}`}
          selected={selected}
          onChange={(ids) => {
            setSelected(ids);
            setError(null);
          }}
          reveal={
            currentFeedback
              ? { chosen: currentFeedback.optionIds, correct: currentFeedback.correctOptionIds }
              : undefined
          }
          hintOpen={hintOpen}
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
              {currentFeedback.isCorrect ? "Passo certo." : "Não foi dessa vez."}
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

      <div className={styles.actions}>
        {!currentFeedback ? (
          <button type="button" className="btn btn-primary" onClick={submit} disabled={pending}>
            {pending ? "Enviando…" : "Responder"}
          </button>
        ) : isLast || outcome ? (
          <button type="button" className="btn btn-primary" onClick={() => setShowOutcome(true)} disabled={!outcome}>
            Ver resultado
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={goNext}>
            Próximo passo
          </button>
        )}
      </div>
    </section>
  );
}
