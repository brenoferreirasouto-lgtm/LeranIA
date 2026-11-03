import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/nav/site-header";
import { getCurrentUser } from "@/lib/session";

import styles from "./privacidade/privacidade.module.css";

export const metadata: Metadata = { title: "Página não encontrada" };

/**
 * 404 em português (Fase F). Lê a sessão para mostrar o menu certo, o que
 * também torna a página dinâmica: assim ela recebe o nonce da CSP.
 */
export default async function NotFound() {
  const user = await getCurrentUser();
  return (
    <>
      <SiteHeader user={user} />
      <main id="conteudo" className={styles.main}>
        <article className={styles.article}>
          <h1>Página não encontrada</h1>
          <p>O endereço pode estar errado, ou a página não existe mais. Projetos do Laboratório só abrem para quem os criou.</p>
          <p>
            {user ? (
              <Link href="/painel">Voltar para o painel</Link>
            ) : (
              <Link href="/">Ir para a página inicial</Link>
            )}
          </p>
        </article>
      </main>
    </>
  );
}
