"use client";

import Link from "next/link";
import { useEffect } from "react";

import styles from "./privacidade/privacidade.module.css";

/**
 * Erro inesperado numa página (Fase F). Não mostra detalhes técnicos: o
 * servidor já registrou o erro, com o mesmo código (digest).
 */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <main id="conteudo" className={styles.main}>
      <article className={styles.article}>
        <h1>Algo deu errado</h1>
        <p>Não foi possível carregar esta página agora. O que você já tinha salvo continua guardado.</p>
        <p>
          <button type="button" className="btn btn-primary" onClick={() => retry()}>
            Tentar de novo
          </button>
        </p>
        <p>
          <Link href="/painel">Voltar para o painel</Link>
        </p>
        {digest ? <p className={styles.draft}>Código do erro: {digest}</p> : null}
      </article>
    </main>
  );
}
