import type { PublicQuestion } from "@/lib/learning/public-types";

import styles from "./learning.module.css";

type Props = {
  question: PublicQuestion;
  /** Nome do grupo de rádio (o formulário envia name=value). */
  name: string;
  /** Texto do cabeçalho, ex.: "Pergunta 3 de 10". */
  eyebrow?: string;
  selected?: string;
  onSelect?: (optionId: string) => void;
  /** Depois da resposta: marca a escolhida e a correta, e trava as alternativas. */
  reveal?: { chosen: string; correct: string };
  /** Alternativa "Ainda não sei", mostrada com estilo próprio. */
  dontKnowId?: string;
  required?: boolean;
};

/**
 * Uma questão de múltipla escolha acessível: grupo de rádios rotulado pelo
 * enunciado e descrito pelo cenário (quando houver).
 */
export function QuestionChoices({
  question,
  name,
  eyebrow,
  selected,
  onSelect,
  reveal,
  dontKnowId,
  required,
}: Props) {
  const legendId = `${name}-enunciado`;
  const scenarioId = question.scenario ? `${name}-cenario` : undefined;
  return (
    <div className={styles.question}>
      {eyebrow ? <p className="eyebrow-text">{eyebrow}</p> : null}
      {question.scenario ? (
        <p className={styles.scenario} id={scenarioId}>
          {question.scenario}
        </p>
      ) : null}
      {question.sample ? (
        <figure className={styles.sample}>
          <figcaption className={styles.sampleLabel}>{question.sample.label}</figcaption>
          <p className={styles.sampleText}>{question.sample.text}</p>
        </figure>
      ) : null}
      <p className={styles.legend} id={legendId}>
        {question.prompt}
      </p>
      <div
        className={styles.options}
        role="radiogroup"
        aria-labelledby={legendId}
        aria-describedby={scenarioId}
        aria-required={required || undefined}
      >
        {question.options.map((option) => {
          const isCorrect = reveal?.correct === option.id;
          const isWrongChoice = reveal && reveal.chosen === option.id && !isCorrect;
          const classes = [
            styles.option,
            option.id === dontKnowId ? styles.optionDontKnow : "",
            question.optionStyle === "prompt" ? styles.optionPrompt : "",
            reveal ? styles.optionDisabled : "",
            isCorrect ? styles.optionCorrect : "",
            isWrongChoice ? styles.optionWrong : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <label key={option.id} className={classes}>
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={reveal ? reveal.chosen === option.id : selected === option.id}
                onChange={() => onSelect?.(option.id)}
                disabled={Boolean(reveal)}
                required={required}
              />
              <span>
                {question.optionStyle === "prompt" ? (
                  <span className={styles.promptLabel}>Prompt {option.id.toUpperCase()}</span>
                ) : null}
                {option.text}
              </span>
              {isCorrect ? <span className={styles.optionTag}>Correta</span> : null}
              {isWrongChoice ? <span className={styles.optionTag}>Sua resposta</span> : null}
            </label>
          );
        })}
      </div>
    </div>
  );
}
