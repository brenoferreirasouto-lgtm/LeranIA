"use client";

import { useActionState } from "react";

import type { LabFormState } from "@/app/(app)/laboratorio/actions";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextAreaField } from "@/components/forms/text-area-field";
import { PROJECT_LIMITS } from "@/lib/projects";

import styles from "./lab.module.css";
import { PersonalDataWarning, usePersonalData } from "./personal-data";

type FormAction = (prev: LabFormState, formData: FormData) => Promise<LabFormState>;

const initialState: LabFormState = {};

function Message({ state }: { state: LabFormState }) {
  return state.message ? (
    <p className="alert alert-error" role="alert">
      {state.message}
    </p>
  ) : null;
}

/** Acrescenta uma tarefa a uma etapa. */
export function AddTaskForm({ action, stageId, stageTitle }: { action: FormAction; stageId: string; stageTitle: string }) {
  const [state, formAction] = useActionState(action, initialState);
  const { kinds, onInput } = usePersonalData();
  const inputId = `nova-tarefa-${stageId}`;
  const error = state.fieldErrors?.text;

  return (
    <form action={formAction} className={styles.inlineForm} onInput={onInput}>
      <Message state={state} />
      <div className="field">
        <label className="field-label" htmlFor={inputId}>
          Nova tarefa<span className="visually-hidden"> em {stageTitle}</span>
        </label>
        <div className={styles.inlineRow}>
          <input
            id={inputId}
            name="text"
            className="field-input"
            required
            maxLength={PROJECT_LIMITS.task}
            autoComplete="off"
            defaultValue={state.values?.text}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-erro` : undefined}
          />
          <SubmitButton pendingLabel="Adicionando…" block={false}>
            Adicionar<span className="visually-hidden"> tarefa em {stageTitle}</span>
          </SubmitButton>
        </div>
        {error ? (
          <p className="field-error" id={`${inputId}-erro`}>
            {error}
          </p>
        ) : null}
      </div>
      <PersonalDataWarning kinds={kinds} />
    </form>
  );
}

/** Acrescenta uma referência (título, link opcional e observação). */
export function AddReferenceForm({ action }: { action: FormAction }) {
  const [state, formAction] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};
  const { kinds, onInput } = usePersonalData();

  return (
    <form action={formAction} className={styles.form} onInput={onInput}>
      <Message state={state} />
      <Field
        id="referencia-titulo"
        name="title"
        label="Referência"
        hint="Título, autor ou site. Ex.: Censo 2022 — IBGE."
        required
        maxLength={PROJECT_LIMITS.referenceTitle}
        autoComplete="off"
        defaultValue={state.values?.title}
        error={errors.title}
      />
      <Field
        id="referencia-link"
        name="url"
        label="Link (opcional)"
        type="url"
        inputMode="url"
        placeholder="https://"
        maxLength={PROJECT_LIMITS.referenceUrl}
        autoComplete="off"
        defaultValue={state.values?.url}
        error={errors.url}
      />
      <Field
        id="referencia-observacao"
        name="note"
        label="O que você usou dela (opcional)"
        maxLength={PROJECT_LIMITS.referenceNote}
        autoComplete="off"
        defaultValue={state.values?.note}
        error={errors.note}
      />
      <PersonalDataWarning kinds={kinds} />
      <div>
        <SubmitButton pendingLabel="Adicionando…" block={false}>
          Adicionar referência
        </SubmitButton>
      </div>
    </form>
  );
}

/** Registra um uso de IA: ferramenta, para quê e o que a pessoa fez com a resposta. */
export function AiLogForm({ action }: { action: FormAction }) {
  const [state, formAction] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};
  const { kinds, onInput } = usePersonalData();

  return (
    <form action={formAction} className={styles.form} onInput={onInput}>
      <Message state={state} />
      <Field
        id="ia-ferramenta"
        name="tool"
        label="Ferramenta"
        hint="Ex.: um assistente de conversa, um tradutor, um corretor de texto."
        required
        maxLength={PROJECT_LIMITS.aiTool}
        autoComplete="off"
        defaultValue={state.values?.tool}
        error={errors.tool}
      />
      <TextAreaField
        id="ia-para-que"
        name="purpose"
        label="Para que você usou"
        hint="Ex.: pedir ideias de perguntas para a pesquisa."
        required
        maxLength={PROJECT_LIMITS.aiPurpose}
        rows={2}
        defaultValue={state.values?.purpose}
        error={errors.purpose}
      />
      <TextAreaField
        id="ia-o-que-fez"
        name="change"
        label="O que você fez com a resposta"
        hint="O que você conferiu, mudou ou decidiu não usar. É isso que mostra o que é seu no trabalho."
        required
        maxLength={PROJECT_LIMITS.aiChange}
        rows={3}
        defaultValue={state.values?.change}
        error={errors.change}
      />
      <PersonalDataWarning kinds={kinds} />
      <div>
        <SubmitButton pendingLabel="Registrando…" block={false}>
          Registrar uso de IA
        </SubmitButton>
      </div>
    </form>
  );
}

/** Exclui o projeto, depois de confirmar que a exclusão é permanente. */
export function DeleteProjectForm({ action }: { action: FormAction }) {
  const [state, formAction] = useActionState(action, initialState);
  const error = state.fieldErrors?.confirmDelete;

  return (
    <form action={formAction} className={styles.form}>
      <Message state={state} />
      <div>
        <label className={styles.confirm}>
          <input
            type="checkbox"
            name="confirmDelete"
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "excluir-projeto-erro" : undefined}
          />
          <span>Entendo que o projeto e o histórico dele serão apagados e não podem ser recuperados.</span>
        </label>
        {error ? (
          <p className="field-error" id="excluir-projeto-erro">
            {error}
          </p>
        ) : null}
      </div>
      <div>
        <SubmitButton pendingLabel="Excluindo…" variant="danger" block={false}>
          Excluir projeto
        </SubmitButton>
      </div>
    </form>
  );
}
