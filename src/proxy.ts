import { type NextRequest, NextResponse } from "next/server";

import { buildCsp, newNonce } from "@/lib/csp";

/*
 * Fase F — gera um nonce por requisição e aplica a Content Security Policy
 * (guia "Content Security Policy" da documentação do Next 16). O Next lê o
 * nonce do cabeçalho da requisição e o coloca nos próprios scripts.
 */
export function proxy(request: NextRequest) {
  const nonce = newNonce();
  const csp = buildCsp(nonce, { dev: process.env.NODE_ENV === "development" });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Arquivos estáticos e pré-carregamentos de link não precisam da política.
      source: "/((?!_next/static|_next/image|favicon.ico|icon.svg).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
