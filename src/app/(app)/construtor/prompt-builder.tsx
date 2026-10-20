"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { RewardNote } from "@/components/journey/reward-note";
import missionStyles from "@/components/missions/missions.module.css";
import type { PromptMissionResult } from "@/lib/learning/public-types";
import {
  EMPTY_FIELDS,
  type FieldKey,
  type PromptFields,
  buildPrompt,
  checkPrompt,
} from "@/lib/prompt-builder";

import { submitPromptMissionAction } from "../missoes/actions";
import styles from "./construtor.module.css";

type Step = {
  key: FieldKey;
  title: string;
  help: string;
  example: string;
  required: boolean;
};

const STEPS: Step[] = [
  {
    key: "contexto",
    title: "Contexto",
    help: "Quem é você, para que é a resposta e o que você já tem.",
    example: "Sou estudante do 1º período de Biologia e tenho prova na sexta.",
    required: false,
  },
  {
    key: "objetivo",
    title: "Objetivo",
    help: "O que exatamente você quer que a IA faça.",
    example: "Explique a fotossíntese.",
    required: true,
  },
  {
    key: "formato",
    title: "Formato",
    help: "Como a resposta deve vir: lista, tabela, tamanho, tom.",
    example: "Em até 8 tópicos curtos, com um exemplo do dia a dia em cada um.",
    required: false,
  },
  {
    key: "restricoes",
    title: "Restrições",
    help: "O que evitar ou respeitar.",
    example: "Não use termos em inglês. No fim, faça 3 perguntas para eu testar se entendi.",
    required: false,
  },
];

const EXAMPLE: PromptFields = {
  contexto: STEPS[0].example,
  objetivo: STEPS[1].example,
  formato: STEPS[2].example,
  restricoes: STEPS[3].example,
};

const REVIEW = STEPS.length;

type Props = {
  /**
   * Fase C2 — missão "Monte um prompt completo". Só nesse modo o texto vai ao
   * servidor, para conferir a estrutura; ele é conferido e descartado.
   */
  missionId?: string;
};

/**
 * SP06 — monta um prompt em etapas guiadas. Fora de uma missão, tudo
 * acontece no navegador: o texto não é salvo nem enviado ao servidor.
 */
export function PromptBuilder({ missionId }: Props = {}) {
  const [fields, setFields] = useState<PromptFields>(EMPTY_FIELDS);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [focusTick, setFocusTick] = useState(0);
  const [missionResult, setMissionResult] = useState<PromptMissionResult | null>(null);
  const [missionError, setMissionError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const prompt = buildPrompt(fields);
  const check = checkPrompt(fields);
  const current = STEPS[step];

  useEffect(() => {
    if (focusTick > 0) panelRef.current?.focus();
  }, [focusTick]);

  useEffect(() => {
    if (missionResult || missionError) resultRef.current?.focus();
  }, [missionResult, missionError]);

  function sendMission() {
    if (!missionId) return;
    setMissionError(null);
    startSending(async () => {
      try {
        const response = await submitPromptMissionAction({ missionId, fields });
        if (response.ok) setMissionResult(response.result);
        else setMissionError(response.message);
      } catch {
        setMissionError("Não foi possível conferir agora. Verifique sua conexão e tente de novo.");
      }
    });
  }

  function goTo(next: number) {
    setError(null);
    setCopyStatus("");
    setStep(next);
    setFocusTick((t) => t + 1);
  }

  function goToReview() {
    if (check.ready) {
      goTo(REVIEW);
      return;
    }
    goTo(1);
    setError("Preencha o objetivo para revisar o prompt.");
  }

  function handleNext() {
    if (current?.required && !fields[current.key].trim()) {
      setError(`Preencha o ${current.title.toLowerCase()} para continuar.`);
      return;
    }
    goTo(step + 1);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus("Prompt copiado.");
    } catch {
      setCopyStatus("Não foi possível copiar automaticamente. Selecione o texto e copie.");
    }
  }

  return (
    <div className={styles.builder}>
      <div className={styles.main}>
        <ol className={styles.steps} aria-label="Etapas">
          {STEPS.map((s, i) => (
            <li key={s.key}>
              <button
                type="button"
                className={styles.stepButton}
                aria-current={i === step ? "step" : undefined}
                onClick={() => goTo(i)}
              >
                <span className={styles.stepNumber}>{i + 1}</span>
                {s.title}
                {fields[s.key].trim() ? <span className="visually-hidden"> (preenchido)</span> : null}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={styles.stepButton}
              aria-current={step === REVIEW ? "step" : undefined}
              onClick={goToReview}
            >
              <span className={styles.stepNumber}>{REVIEW + 1}</span>
              Revisar
            </button>
          </li>
        </ol>

        <div ref={panelRef} tabIndex={-1} className={styles.panel}>
          {current ? (
            <>
              <h2 className={styles.panelTitle}>
                {current.title}
                <span className={styles.requirement}>{current.required ? "obrigatório" : "recomendado"}</span>
              </h2>
              <label className="field">
                <span className="field-label">{current.help}</span>
                <textarea
                  className={`field-input ${styles.textarea}`}
                  value={fields[current.key]}
                  onChange={(e) => {
                    setFields((f) => ({ ...f, [current.key]: e.target.value }));
                    setError(null);
                    setMissionResult(null);
                  }}
                  rows={4}
                  maxLength={1000}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={`exemplo-${current.key}`}
                />
              </label>
              <p className={styles.example} id={`exemplo-${current.key}`}>
                <span>Exemplo:</span> {current.example}
              </p>
            </>
          ) : (
            <>
              <h2 className={styles.panelTitle}>Seu prompt</h2>
              <pre className={styles.finalPrompt} aria-label="Prompt montado">
                {prompt}
              </pre>
              <div className={styles.actions}>
                {missionId ? (
                  <button type="button" className="btn btn-primary" onClick={sendMission} disabled={sending}>
                    {sending ? "Conferindo…" : "Enviar para conferir"}
                  </button>
                ) : null}
                <button type="button" className={`btn ${missionId ? "btn-secondary" : "btn-primary"}`} onClick={copy}>
                  Copiar prompt
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setFields(EMPTY_FIELDS);
                    goTo(0);
                  }}
                >
                  Começar de novo
                </button>
              </div>
              <p role="status" className={styles.copyStatus}>
                {copyStatus}
              </p>

              {missionId && (missionResult || missionError) ? (
                <div ref={resultRef} tabIndex={-1} className={styles.missionResult}>
                  {missionError ? (
                    <p className="alert alert-error">{missionError}</p>
                  ) : missionResult?.passed ? (
                    <>
                      <p className={styles.missionPassed}>Missão concluída: os quatro elementos estão no prompt.</p>
                      <RewardNote
                        rewards={missionResult.rewards}
                        emptyText="Esta tentativa não rendeu XP: cada missão paga uma vez."
                      />
                    </>
                  ) : (
                    <>
                      <p className={styles.missionRetry}>Ainda não foi desta vez. Ajuste e envie de novo:</p>
                      <ul className={missionStyles.problems}>
                        {missionResult?.problems.map((problem) => (
                          <li key={problem}>{problem}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ) : null}

              {check.personalData.length > 0 ? (
                <div className={styles.warning} role="alert">
                  <p className={styles.warningTitle}>Parece haver dados pessoais no prompt</p>
                  <p>
                    Encontramos: {check.personalData.join(", ")}. Remova ou troque por algo genérico antes
                    de colar numa ferramenta de IA.
                  </p>
                </div>
              ) : null}

              {check.tips.length > 0 ? (
                <div className={styles.tips}>
                  <p className={styles.tipsTitle}>Para melhorar</p>
                  <ul>
                    {check.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className={styles.complete}>Os quatro elementos estão preenchidos.</p>
              )}
            </>
          )}

          {error ? (
            <p className="alert alert-error" role="alert">
              {error}
            </p>
          ) : null}

          {current ? (
            <div className={styles.nav}>
              <button type="button" className="btn btn-secondary" onClick={() => goTo(step - 1)} disabled={step === 0}>
                Voltar
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                {step === REVIEW - 1 ? "Revisar prompt" : "Próximo"}
              </button>
            </div>
          ) : null}
        </div>

        {missionId ? null : (
          <p className={styles.helper}>
            Sem ideias?{" "}
            <button type="button" className={styles.linkButton} onClick={() => setFields(EXAMPLE)}>
              Preencher com um exemplo
            </button>
          </p>
        )}
      </div>

      <aside className={styles.preview} aria-label="Prévia do prompt">
        <p className={styles.previewLabel}>Prévia</p>
        {prompt ? (
          <p className={styles.previewText}>{prompt}</p>
        ) : (
          <p className={styles.previewEmpty}>O prompt aparece aqui enquanto você preenche as etapas.</p>
        )}
      </aside>
    </div>
  );
}
