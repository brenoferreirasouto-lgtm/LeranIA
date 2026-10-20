"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { RULES, consume, hashKey } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";
import {
  type DeleteAccountInput,
  type FieldErrors,
  deleteAccountSchema,
  toFieldErrors,
} from "@/lib/validation/auth";

export type DeleteAccountState = {
  message?: string;
  fieldErrors?: FieldErrors<DeleteAccountInput>;
};

/**
 * Exclusão da conta pela própria pessoa (LGPD, art. 18, VI). Exige a senha
 * atual, aplica limite de tentativas e apaga tudo em cascata no banco.
 * Funciona também para quem ainda não confirmou a idade mínima.
 */
export async function deleteAccountAction(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/conta");

  const parsed = deleteAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  if (!(await consume(hashKey("delete:user", user.id), RULES.deleteAccountByUser))) {
    return { message: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo." };
  }

  try {
    await auth.api.deleteUser({ body: { password: parsed.data.password }, headers: await headers() });
  } catch (error) {
    const code = isAPIError(error) ? (error.body as { code?: string } | undefined)?.code : undefined;
    if (code === "INVALID_PASSWORD") {
      return { fieldErrors: { password: "Senha incorreta." } };
    }
    console.error("Falha ao excluir a conta", isAPIError(error) ? code : error);
    return { message: "Não foi possível excluir a conta agora. Tente de novo em instantes." };
  }

  redirect("/conta-excluida");
}
