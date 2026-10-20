import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  hint?: ReactNode;
  error?: string;
};

/**
 * Campo de texto acessível: rótulo ligado ao input, dica e erro anunciados
 * por leitores de tela via aria-describedby.
 */
export function Field({ name, label, hint, error, id, ...input }: Props) {
  const inputId = id ?? `campo-${name}`;
  const hintId = hint ? `${inputId}-dica` : undefined;
  const errorId = error ? `${inputId}-erro` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="field">
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      {hint ? (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      <input
        id={inputId}
        name={name}
        className="field-input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...input}
      />
      {error ? (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
