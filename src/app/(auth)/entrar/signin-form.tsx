"use client";

import { useActionState } from "react";

import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { EMAIL_MAX, type SignInInput } from "@/lib/validation/auth";

import { type FormState, signInAction } from "../actions";
import styles from "../auth.module.css";

const initialState: FormState<SignInInput> = {};

export function SignInForm({ next }: { next: string }) {
  const [state, action] = useActionState(signInAction, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className={styles.form}>
      {state.message ? (
        <p className="alert alert-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <input type="hidden" name="next" value={next} />
      <Field
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        maxLength={EMAIL_MAX}
        defaultValue={state.values?.email}
        error={errors.email}
      />
      <Field
        name="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password}
      />

      <SubmitButton pendingLabel="Entrando…">Entrar</SubmitButton>
    </form>
  );
}
