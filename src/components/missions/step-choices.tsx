import learning from "@/components/learning/learning.module.css";
import type { PublicMissionStep } from "@/lib/learning/public-types";

import styles from "./missions.module.css";

type Props = {
  step: PublicMissionStep;
  name: string;
  eyebrow: string;
  selected: string[];
  onChange: (optionIds: string[]) => void;
  /** Depois da resposta: marca as escolhidas e as corretas, e trava as alternativas. */
  reveal?: { chosen: string[]; correct: string[] };
  /** Dica aberta (Trilha Iniciante) ou fechada (outras trilhas). */
  hintOpen: boolean;
};

/**
 * Um passo de missão: uma alternativa (rádios) ou "marque todas as que se
 * aplicam" (caixas de seleção). O grupo é rotulado pelo enunciado.
 */
export function StepChoices({ step, name, eyebrow, selected, onChange, reveal, hintOpen }: Props) {
  const legendId = `${name}-enunciado`;
  const scenarioId = step.scenario ? `${name}-cenario` : undefined;
  const type = step.multiple ? "checkbox" : "radio";

  function toggle(optionId: string) {
    if (!step.multiple) {
      onChange([optionId]);
      return;
    }
    onChange(selected.includes(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId]);
  }

  return (
    <div className={learning.question}>
      <p className="eyebrow-text">{eyebrow}</p>
      {step.scenario ? (
        <p className={learning.scenario} id={scenarioId}>
          {step.scenario}
        </p>
      ) : null}
      {step.sample ? (
        <figure className={learning.sample}>
          <figcaption className={learning.sampleLabel}>{step.sample.label}</figcaption>
          <p className={learning.sampleText}>{step.sample.text}</p>
        </figure>
      ) : null}
      <p className={learning.legend} id={legendId}>
        {step.prompt}
      </p>
      {step.multiple && !reveal ? <p className={styles.multiHelp}>Você pode marcar mais de uma.</p> : null}
      <div
        className={learning.options}
        role={step.multiple ? "group" : "radiogroup"}
        aria-labelledby={legendId}
        aria-describedby={scenarioId}
      >
        {step.options.map((option) => {
          const isCorrect = reveal?.correct.includes(option.id) ?? false;
          const isChosen = reveal ? reveal.chosen.includes(option.id) : selected.includes(option.id);
          const isWrongChoice = Boolean(reveal) && isChosen && !isCorrect;
          const classes = [
            learning.option,
            step.optionStyle === "prompt" ? learning.optionPrompt : "",
            reveal ? learning.optionDisabled : "",
            isCorrect ? learning.optionCorrect : "",
            isWrongChoice ? learning.optionWrong : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <label key={option.id} className={classes}>
              <input
                type={type}
                name={name}
                value={option.id}
                checked={isChosen}
                onChange={() => toggle(option.id)}
                disabled={Boolean(reveal)}
              />
              <span>
                {step.optionStyle === "prompt" ? (
                  <span className={learning.promptLabel}>Prompt {option.id.toUpperCase()}</span>
                ) : null}
                {option.text}
              </span>
              {isCorrect ? (
                <span className={learning.optionTag}>{isChosen || !step.multiple ? "Correta" : "Faltou marcar"}</span>
              ) : null}
              {isWrongChoice ? (
                <span className={learning.optionTag}>{step.multiple ? "Não se aplica" : "Sua resposta"}</span>
              ) : null}
            </label>
          );
        })}
      </div>
      {!reveal ? (
        <details className={styles.hint} open={hintOpen}>
          <summary>Dica</summary>
          <p>{step.hint}</p>
        </details>
      ) : null}
    </div>
  );
}
