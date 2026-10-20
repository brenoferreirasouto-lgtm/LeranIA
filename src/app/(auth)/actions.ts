"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { RULES, clientIp, consume, hashKey } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";
import {
  type FieldErrors,
  type SignInInput,
  type SignUpInput,
  confirmAgeSchema,
  safeRedirectPath,
  signInSchema,
  signUpSchema,
  toFieldErrors,
} from "@/lib/validation/auth";
import { confirmAge } from "@/server/account";

export type FormState<T> = {
  message?: string;
  fieldErrors?: FieldErrors<T>;
  /** Valores devolvidos ao formulário para a pessoa não redigitar (nunca a senha). */
  values?: { name?: string; email?: string };
};

const GENERIC_ERROR =
  "Não foi possível concluir agora. Verifique sua conexão e tente de novo em instantes.";
const TOO_MANY_ATTEMPTS =
  "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";

async function requestIp(): Promise<string> {
  const h = await headers();
  return clientIp(h.get("x-forwarded-for"), h.get("x-real-ip"));
}

function errorCode(error: unknown): string | undefined {
  if (!isAPIError(error)) return undefined;
  const body = error.body as { code?: string } | undefined;
  return body?.code;
}

/** SP15 — Cadastro de usuário. */
export async function signUpAction(
  _prev: FormState<SignUpInput>,
  formData: FormData,
): Promise<FormState<SignUpInput>> {
  const raw = Object.fromEntries(formData);
  const values = { name: String(raw.name ?? ""), email: String(raw.email ?? "") };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values };
  }

  if (!(await consume(hashKey("signup:ip", await requestIp()), RULES.signUpByIp))) {
    return { message: TOO_MANY_ATTEMPTS, values };
  }

  const { name, email, password } = parsed.data;
  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });
  } catch (error) {
    const code = errorCode(error);
    if (code?.startsWith("USER_ALREADY_EXISTS")) {
      return {
        fieldErrors: { email: "Já existe uma conta com este e-mail. Entre com ele ou use outro." },
        values,
      };
    }
    if (code === "PASSWORD_TOO_SHORT" || code === "PASSWORD_TOO_LONG") {
      return {
        fieldErrors: { password: "A senha precisa ter entre 8 e 128 caracteres." },
        values,
      };
    }
    if (code === "INVALID_EMAIL") {
      return { fieldErrors: { email: "Informe um e-mail válido." }, values };
    }
    console.error("Falha no cadastro", error);
    return { message: GENERIC_ERROR, values };
  }

  redirect("/painel");
}

/** U02 — Login. */
export async function signInAction(
  _prev: FormState<SignInInput>,
  formData: FormData,
): Promise<FormState<SignInInput>> {
  const raw = Object.fromEntries(formData);
  const values = { email: String(raw.email ?? "") };
  const next = safeRedirectPath(raw.next);

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values };
  }

  const { email, password } = parsed.data;
  const [byEmail, byIp] = await Promise.all([
    consume(hashKey("signin:email", email), RULES.signInByEmail),
    consume(hashKey("signin:ip", await requestIp()), RULES.signInByIp),
  ]);
  if (!byEmail || !byIp) {
    return { message: TOO_MANY_ATTEMPTS, values };
  }

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch (error) {
    const code = errorCode(error);
    if (code === "INVALID_EMAIL_OR_PASSWORD" || code === "INVALID_EMAIL") {
      // Mesma mensagem para e-mail inexistente e senha errada:
      // não revela quais e-mails têm conta.
      return { message: "E-mail ou senha incorretos.", values };
    }
    console.error("Falha no login", error);
    return { message: GENERIC_ERROR, values };
  }

  redirect(next);
}

/** Encerra a sessão atual e volta para a página inicial. */
export async function signOutAction(): Promise<void> {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    // Sessão já expirada ou inexistente: não há o que encerrar.
    if (!isAPIError(error)) throw error;
  }
  redirect("/");
}

export type ConfirmAgeState = { fieldErrors?: FieldErrors<{ confirmAge: string }> };

/** Contas criadas antes da idade mínima (ADR 0002) confirmam a declaração aqui. */
export async function confirmAgeAction(_prev: ConfirmAgeState, formData: FormData): Promise<ConfirmAgeState> {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  const parsed = confirmAgeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  await confirmAge(user.id);
  redirect(safeRedirectPath(formData.get("next")));
}
