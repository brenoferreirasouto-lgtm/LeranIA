"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/forms/submit-button";
import { MIN_AGE } from "@/lib/validation/auth";

import { type ConfirmAgeState, confirmAgeAction } from "../actions";
import styles from "../auth.module.css";

const initialState: ConfirmAgeState = {};

export function ConfirmAgeForm({ next }: { next: string }) {
  const [state, action] = useActionState(confirmAgeAction, initialState);
  const error = state.fieldErrors?.confirmAge;

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="next" value={next} />
      <div>
        <label className={styles.consent}>
          <input
            type="checkbox"
            name="confirmAge"
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "idade-erro" : undefined}
          />
          <span>Tenho {MIN_AGE} anos ou mais.</span>
        </label>
        {error ? (
          <p className="field-error" id="idade-erro">
            {error}
          </p>
        ) : null}
      </div>
      <SubmitButton pendingLabel="Confirmando…">Confirmar e continuar</SubmitButton>
    </form>
  );
}
