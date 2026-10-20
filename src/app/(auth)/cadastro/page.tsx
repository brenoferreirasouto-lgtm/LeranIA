import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";

import styles from "../auth.module.css";
import { SignUpForm } from "./signup-form";

export const metadata: Metadata = { title: "Criar conta" };

/** SP15 — Cadastro de usuário. */
export default async function SignUpPage() {
  if (await getCurrentUser()) redirect("/painel");

  return (
    <>
      <h1 className={styles.title}>Criar sua conta</h1>
      <p className={styles.lead}>Com uma conta, seu progresso fica salvo e você continua de onde parou.</p>
      <SignUpForm />
      <p className={styles.switch}>
        Já tem conta? <Link href="/entrar">Entrar</Link>
      </p>
    </>
  );
}
