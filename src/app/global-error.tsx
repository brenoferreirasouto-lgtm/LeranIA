"use client";

import "./globals.css";

/**
 * Erro no próprio layout raiz (Fase F): substitui a página inteira, por isso
 * traz html e body. Sem detalhes técnicos.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="pt-BR">
      <body>
        <main id="conteudo" style={{ maxWidth: "42rem", margin: "0 auto", padding: "3rem 1rem" }}>
          <title>Algo deu errado · Learn AI</title>
          <h1>Algo deu errado</h1>
          <p>Não foi possível carregar o Learn AI agora. Tente de novo em instantes.</p>
          <p>
            <button type="button" className="btn btn-primary" onClick={() => retry()}>
              Tentar de novo
            </button>
          </p>
        </main>
      </body>
    </html>
  );
}
