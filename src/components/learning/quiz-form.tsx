"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { QuestionChoices } from "@/components/learning/question-choices";
import { ProgressBar } from "@/components/learning/progress-bar";
import type { PublicQuestion } from "@/lib/learning/public-types";

import styles from "./quiz.module.css";

/** Estado devolvido pela Server Action quando o envio não pôde ser aceito. */
export type QuizFormState = { missing?: string[]; message?: string };

type Props = {
  questions: PublicQuestion[];
  action: (state: QuizFormState, formData: FormData) => Promise<QuizFormState>;
  submitLabel: string;
  pendingLabel: string;
  /** Alternativa "Ainda não sei" (só no nivelamento). */
  dontKnowId?: string;
};

/**
 * Questionário respondido de uma vez (SP02 nivelamento, SP12 avaliação):
 * uma pergunta por tela, com progresso. Todas as respostas vão juntas no
 * envio; o servidor corrige e recusa o envio se faltar alguma.
 */
export function QuizForm({ questions, action: serverAction, submitLabel, pendingLabel, dontKnowId }: Props) {
  const chooseFirst = dontKnowId
    ? "Escolha uma alternativa para continuar. Se não souber, marque “Ainda não sei”."
    : "Escolha uma alternativa para continuar.";
  const [state, action, pending] = useActionState<QuizFormState, FormData>(serverAction, {});
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [warning, setWarning] = useState<string | null>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  // Aumenta a cada troca de pergunta feita pela pessoa; o efeito move o foco.
  const [focusTick, setFocusTick] = useState(0);
  const [handledState, setHandledState] = useState(state);

  const total = questions.length;
  const current = questions[index];
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const isLast = index === total - 1;

  // O servidor apontou questões sem resposta: leva a pessoa até a primeira.
  if (state !== handledState) {
    setHandledState(state);
    const first = questions.findIndex((q) => state.missing?.includes(q.id));
    if (first >= 0) {
      setIndex(first);
      setFocusTick((t) => t + 1);
    }
  }

  // Ao trocar de pergunta, o foco vai para ela (teclado e leitor de tela).
  useEffect(() => {
    if (focusTick > 0) questionRef.current?.focus();
  }, [focusTick]);

  function goTo(next: number) {
    setWarning(null);
    setIndex(next);
    setFocusTick((t) => t + 1);
  }

  function handleNext() {
    if (!answers[current.id]) {
      setWarning(chooseFirst);
      return;
    }
    goTo(index + 1);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const missing = questions.findIndex((q) => !answers[q.id]);
    if (missing >= 0) {
      event.preventDefault();
      goTo(missing);
      setWarning(chooseFirst);
    }
  }

  const message = warning ?? state.message;

  return (
    <form action={action} onSubmit={handleSubmit} className={styles.form}>
      <ProgressBar
        value={answeredCount}
        max={total}
        label="Respondidas"
        detail={`${answeredCount} de ${total}`}
      />

      <div className={styles.card}>
        {questions.map((question, i) => (
          <div
            key={question.id}
            hidden={i !== index}
            ref={i === index ? questionRef : undefined}
            tabIndex={-1}
            className={styles.questionSlot}
          >
            <QuestionChoices
              question={question}
              name={`q:${question.id}`}
              eyebrow={`Pergunta ${i + 1} de ${total}`}
              selected={answers[question.id]}
              onSelect={(optionId) => {
                setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
                setWarning(null);
              }}
              dontKnowId={dontKnowId}
            />
          </div>
        ))}

        {message ? (
          <p className="alert alert-error" role="alert">
            {message}
          </p>
        ) : null}

        <div className={styles.nav}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
          >
            Anterior
          </button>
          {isLast ? (
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? pendingLabel : submitLabel}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleNext}>
              Próxima
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
