import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { safeRedirectPath } from "@/lib/validation/auth";

import styles from "../auth.module.css";
import { SignInForm } from "./signin-form";

export const metadata: Metadata = { title: "Entrar" };

/** U02 — Login. */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const destination = safeRedirectPath(Array.isArray(next) ? next[0] : next);

  if (await getCurrentUser()) redirect(destination);

  return (
    <>
      <h1 className={styles.title}>Entrar</h1>
      <p className={styles.lead}>Continue sua trilha de onde parou.</p>
      <SignInForm next={destination} />
      <p className={styles.switch}>
        Ainda não tem conta? <Link href="/cadastro">Criar conta</Link>
      </p>
    </>
  );
}
