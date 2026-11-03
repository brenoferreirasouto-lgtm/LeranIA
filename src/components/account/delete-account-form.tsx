"use client";

import { useActionState } from "react";

import { type DeleteAccountState, deleteAccountAction } from "@/app/(app)/conta/actions";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { PASSWORD_MAX } from "@/lib/validation/auth";

import styles from "./account.module.css";

const initialState: DeleteAccountState = {};

/** Exclui a conta e todos os dados, depois de confirmar a senha. */
export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccountAction, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className={styles.form}>
      {state.message ? (
        <p className="alert alert-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <Field
        name="password"
        label="Sua senha"
        type="password"
        autoComplete="current-password"
        required
        maxLength={PASSWORD_MAX}
        error={errors.password}
      />
      <div>
        <label className={styles.check}>
          <input
            type="checkbox"
            name="confirmDelete"
            required
            aria-invalid={errors.confirmDelete ? true : undefined}
            aria-describedby={errors.confirmDelete ? "exclusao-erro" : undefined}
          />
          <span>Entendo que a exclusão é permanente e não pode ser desfeita.</span>
        </label>
        {errors.confirmDelete ? (
          <p className="field-error" id="exclusao-erro">
            {errors.confirmDelete}
          </p>
        ) : null}
      </div>
      <div>
        <SubmitButton pendingLabel="Excluindo…" variant="danger" block={false}>
          Excluir minha conta
        </SubmitButton>
      </div>
    </form>
  );
}
