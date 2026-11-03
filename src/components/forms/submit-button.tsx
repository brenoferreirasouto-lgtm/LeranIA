"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingLabel: string;
  /** "danger" para ações sem volta, como excluir a conta. */
  variant?: "primary" | "danger";
  block?: boolean;
};

/** Botão de envio que fica indisponível enquanto o formulário é processado. */
export function SubmitButton({ children, pendingLabel, variant = "primary", block = true }: Props) {
  const { pending } = useFormStatus();
  const className = ["btn", variant === "danger" ? "btn-danger" : "btn-primary", block ? "btn-block" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <button type="submit" className={className} disabled={pending} aria-disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
