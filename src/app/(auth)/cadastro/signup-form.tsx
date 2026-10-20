"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  EMAIL_MAX,
  MIN_AGE,
  NAME_MAX,
  NAME_MIN,
  PASSWORD_MAX,
  PASSWORD_MIN,
  type SignUpInput,
} from "@/lib/validation/auth";

import { type FormState, signUpAction } from "../actions";
import styles from "../auth.module.css";

const initialState: FormState<SignUpInput> = {};

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className={styles.form}>
      {state.message ? (
        <p className="alert alert-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <Field
        name="name"
        label="Nome"
        autoComplete="name"
        required
        minLength={NAME_MIN}
        maxLength={NAME_MAX}
        defaultValue={state.values?.name}
        error={errors.name}
      />
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
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN}
        maxLength={PASSWORD_MAX}
        hint={`Pelo menos ${PASSWORD_MIN} caracteres. Uma frase curta é mais fácil de lembrar e difícil de adivinhar.`}
        error={errors.password}
      />

      <div>
        <label className={styles.consent}>
          <input
            type="checkbox"
            name="acceptTerms"
            required
            aria-invalid={errors.acceptTerms ? true : undefined}
            aria-describedby={errors.acceptTerms ? "aceite-erro" : undefined}
          />
          <span>
            Li e aceito os <Link href="/privacidade">termos de uso e a política de privacidade</Link>.
          </span>
        </label>
        {errors.acceptTerms ? (
          <p className="field-error" id="aceite-erro">
            {errors.acceptTerms}
          </p>
        ) : null}
      </div>

      <div>
        <label className={styles.consent}>
          <input
            type="checkbox"
            name="confirmAge"
            required
            aria-invalid={errors.confirmAge ? true : undefined}
            aria-describedby={errors.confirmAge ? "idade-erro" : undefined}
          />
          <span>Tenho {MIN_AGE} anos ou mais.</span>
        </label>
        {errors.confirmAge ? (
          <p className="field-error" id="idade-erro">
            {errors.confirmAge}
          </p>
        ) : null}
      </div>

      <SubmitButton pendingLabel="Criando conta…">Criar conta</SubmitButton>
    </form>
  );
}
