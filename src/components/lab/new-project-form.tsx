"use client";

import { useActionState } from "react";

import { type LabFormState, createProjectAction } from "@/app/(app)/laboratorio/actions";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { PROJECT_LIMITS } from "@/lib/projects";

import styles from "./lab.module.css";
import { PersonalDataWarning, usePersonalData } from "./personal-data";

type Template = { id: string; title: string; summary: string; stages: string[] };

const initialState: LabFormState = {};

/** Cria um projeto a partir de um dos modelos (ADR 0002, decisão 13). */
export function NewProjectForm({ templates }: { templates: Template[] }) {
  const [state, action] = useActionState(createProjectAction, initialState);
  const errors = state.fieldErrors ?? {};
  const { kinds, onInput } = usePersonalData();
  const chosen = state.values?.templateId ?? templates[0]?.id;

  return (
    <form action={action} className={styles.form} onInput={onInput}>
      {state.message ? (
        <p className="alert alert-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <fieldset className={styles.templates} aria-describedby={errors.templateId ? "modelo-erro" : undefined}>
        <legend className="field-label">Modelo</legend>
        <p className="field-hint">O modelo cria as etapas e algumas tarefas sugeridas. Você muda tudo depois.</p>
        <div className={styles.templateGrid}>
          {templates.map((t) => (
            <label key={t.id} className={styles.template}>
              <input type="radio" name="templateId" value={t.id} defaultChecked={t.id === chosen} required />
              <span className={styles.templateBody}>
                <span className={styles.templateTitle}>{t.title}</span>
                <span className={styles.templateText}>{t.summary}</span>
                <span className={styles.templateStages}>{t.stages.join(" → ")}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.templateId ? (
          <p className="field-error" id="modelo-erro">
            {errors.templateId}
          </p>
        ) : null}
      </fieldset>

      <Field
        name="title"
        label="Título do projeto"
        hint="Um nome curto, como o tema do trabalho."
        required
        maxLength={PROJECT_LIMITS.title}
        autoComplete="off"
        defaultValue={state.values?.title}
        error={errors.title}
      />
      <PersonalDataWarning kinds={kinds} />

      <div>
        <SubmitButton pendingLabel="Criando…" block={false}>
          Criar projeto
        </SubmitButton>
      </div>
    </form>
  );
}
