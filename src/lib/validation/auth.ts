import { z } from "@/lib/zod";

/*
 * Regras dos formulários de cadastro (SP15) e login (U02).
 * Usadas no servidor (Server Actions) e espelhadas nos atributos HTML
 * dos campos para validação imediata no navegador.
 */

export const NAME_MIN = 2;
export const NAME_MAX = 80;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;
export const EMAIL_MAX = 254;
/** Idade mínima para usar o Learn AI (ADR 0002). */
export const MIN_AGE = 13;

const ageConfirmation = z.literal("on", {
  error: `O Learn AI é para quem tem ${MIN_AGE} anos ou mais. Confirme a sua idade para continuar.`,
});

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { error: "Informe seu e-mail." })
  .max(EMAIL_MAX, { error: "Use um e-mail com até 254 caracteres." })
  .pipe(z.email({ error: "Informe um e-mail válido, como nome@exemplo.com." }));

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Informe seu nome." })
    .min(NAME_MIN, { error: `O nome precisa ter pelo menos ${NAME_MIN} letras.` })
    .max(NAME_MAX, { error: `Use um nome com até ${NAME_MAX} caracteres.` }),
  email,
  password: z
    .string()
    .min(1, { error: "Crie uma senha." })
    .min(PASSWORD_MIN, {
      error: `A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres.`,
    })
    .max(PASSWORD_MAX, {
      error: `A senha pode ter no máximo ${PASSWORD_MAX} caracteres.`,
    })
    .refine((value) => value.trim().length > 0, {
      error: "A senha não pode ter só espaços.",
    }),
  acceptTerms: z.literal("on", {
    error: "Para criar a conta, aceite os termos de uso e a política de privacidade.",
  }),
  confirmAge: ageConfirmation,
});

/** Contas criadas antes da idade mínima confirmam no próximo acesso. */
export const confirmAgeSchema = z.object({ confirmAge: ageConfirmation });

/** Exclusão da conta: senha atual e ciência de que é permanente. */
export const deleteAccountSchema = z.object({
  password: z.string().min(1, { error: "Informe sua senha." }).max(PASSWORD_MAX),
  confirmDelete: z.literal("on", { error: "Marque que você entende que a exclusão é permanente." }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: "Informe sua senha." }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Converte os erros do Zod em uma mensagem por campo (a primeira de cada). */
export function toFieldErrors<T>(error: z.ZodError<T>): FieldErrors<T> {
  const result: FieldErrors<T> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof T | undefined;
    if (field !== undefined && result[field] === undefined) {
      result[field] = issue.message;
    }
  }
  return result;
}

/**
 * Aceita apenas destinos internos depois do login (evita redirecionar
 * para outro site por um link manipulado, como ?next=//site-malicioso).
 */
export function safeRedirectPath(value: unknown, fallback = "/painel"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
