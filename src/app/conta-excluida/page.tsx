import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/nav/site-header";
import { getCurrentUser } from "@/lib/session";

import styles from "../privacidade/privacidade.module.css";

export const metadata: Metadata = { title: "Conta excluída" };

/** Destino depois da exclusão da conta: confirma o que aconteceu. */
export default async function AccountDeletedPage() {
  const user = await getCurrentUser();
  return (
    <>
      <SiteHeader user={user} />
      <main id="conteudo" className={styles.main}>
        <article className={styles.article}>
          <h1>Conta excluída</h1>
          <p role="status">
            Sua conta e todos os dados ligados a ela foram apagados: respostas, progresso, XP e conquistas.
          </p>
          <p>
            Se quiser voltar, é só <Link href="/cadastro">criar uma conta nova</Link>.
          </p>
        </article>
      </main>
    </>
  );
}
