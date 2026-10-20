"use client";

import { useActionState } from "react";

import type { LabFormState } from "@/app/(app)/laboratorio/actions";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextAreaField } from "@/components/forms/text-area-field";
import { PROJECT_LIMITS } from "@/lib/projects";

import styles from "./lab.module.css";
import { PersonalDataWarning, usePersonalData } from "./personal-data";

type About = { title: string; goal: string; audience: string; problem: string };

type Props = {
  initial: About;
  action: (prev: LabFormState, formData: FormData) => Promise<LabFormState>;
};

const initialState: LabFormState = {};

/** Título, objetivo, público e problema do projeto. */
export function AboutForm({ initial, action }: Props) {
  const [state, formAction] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};
  const values = { ...initial, ...state.values };
  const { kinds, onInput } = usePersonalData(Object.values(initial).join("\n"));

  return (
    <form action={formAction} className={styles.form} onInput={onInput}>
      {state.message ? (
        <p className="alert alert-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <Field
        name="title"
        label="Título"
        required
        maxLength={PROJECT_LIMITS.title}
        autoComplete="off"
        defaultValue={values.title}
        error={errors.title}
      />
      <TextAreaField
        name="goal"
        label="Objetivo"
        hint="O que você vai entregar e para quê. Ex.: um seminário de 10 minutos explicando como a energia solar chega às casas."
        maxLength={PROJECT_LIMITS.about}
        rows={3}
        defaultValue={values.goal}
        error={errors.goal}
      />
      <TextAreaField
        name="audience"
        label="Público"
        hint="Para quem é o projeto. Ex.: a turma do 2º ano e a professora de Física."
        maxLength={PROJECT_LIMITS.about}
        rows={2}
        defaultValue={values.audience}
        error={errors.audience}
      />
      <TextAreaField
        name="problem"
        label="Problema ou pergunta"
        hint="O que o projeto responde ou resolve."
        maxLength={PROJECT_LIMITS.about}
        rows={3}
        defaultValue={values.problem}
        error={errors.problem}
      />
      <PersonalDataWarning kinds={kinds} />
      <div className={styles.formActions}>
        <SubmitButton pendingLabel="Salvando…" block={false}>
          Salvar
        </SubmitButton>
        <p role="status" className={styles.saved}>
          {state.saved ? "Salvo." : null}
        </p>
      </div>
    </form>
  );
}
