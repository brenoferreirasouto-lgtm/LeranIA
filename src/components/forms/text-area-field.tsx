import type { ReactNode, TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  name: string;
  label: string;
  hint?: ReactNode;
  error?: string;
};

/** Campo de texto longo, com o mesmo rótulo, dica e erro acessíveis do Field. */
export function TextAreaField({ name, label, hint, error, id, className, ...textarea }: Props) {
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
      <textarea
        id={inputId}
        name={name}
        className={["field-input", "field-textarea", className].filter(Boolean).join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...textarea}
      />
      {error ? (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
