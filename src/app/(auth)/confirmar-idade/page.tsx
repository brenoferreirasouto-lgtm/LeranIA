import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DeleteAccountForm } from "@/components/account/delete-account-form";
import { getCurrentUser } from "@/lib/session";
import { MIN_AGE, safeRedirectPath } from "@/lib/validation/auth";

import styles from "../auth.module.css";
import { ConfirmAgeForm } from "./confirm-age-form";

export const metadata: Metadata = { title: "Confirme sua idade" };

type Props = { searchParams: Promise<{ next?: string }> };

/** Contas criadas antes da idade mínima confirmam a declaração antes de continuar (ADR 0002). */
export default async function ConfirmAgePage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  const destination = safeRedirectPath(next);
  if (!user) redirect(`/entrar?next=${encodeURIComponent(destination)}`);
  if (user.ageConfirmed) redirect(destination);

  return (
    <>
      <h1 className={styles.title}>Confirme sua idade</h1>
      <p className={styles.lead}>
        O Learn AI é para quem tem {MIN_AGE} anos ou mais. Para continuar, confirme a sua idade. Não pedimos nem
        guardamos a sua data de nascimento.
      </p>
      <ConfirmAgeForm next={destination} />

      <section className={styles.aside} aria-labelledby="menos-de-13">
        <h2 id="menos-de-13" className={styles.asideTitle}>
          Tem menos de {MIN_AGE} anos?
        </h2>
        <p>Então o Learn AI ainda não é para você. Você pode excluir sua conta e todos os seus dados agora.</p>
        <DeleteAccountForm />
      </section>
    </>
  );
}
