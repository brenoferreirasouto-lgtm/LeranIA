import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";

/** O que as telas precisam saber da pessoa logada; nada além disso. */
export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  /** Declarou ter a idade mínima (ADR 0002). */
  ageConfirmed: boolean;
};

/**
 * Camada de acesso à sessão (Data Access Layer). Lê o cookie e confere a
 * sessão no banco; `cache` evita repetir a consulta na mesma requisição.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, name, email, ageConfirmedAt } = session.user;
  return { id, name, email, ageConfirmed: Boolean(ageConfirmedAt) };
});

/**
 * Para páginas e ações que exigem login: sem sessão, vai para /entrar; sem a
 * declaração de idade mínima, vai para /confirmar-idade antes de qualquer coisa.
 */
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?next=${encodeURIComponent(returnTo)}`);
  }
  if (!user.ageConfirmed) {
    redirect(`/confirmar-idade?next=${encodeURIComponent(returnTo)}`);
  }
  return user;
}
