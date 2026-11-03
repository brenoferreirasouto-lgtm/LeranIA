/**
 * Content Security Policy (Fase F). Scripts e estilos só rodam com o nonce
 * gerado a cada requisição em src/proxy.ts; nada vem de outro domínio.
 *
 * - `style-src-attr 'unsafe-inline'`: as barras de progresso usam o atributo
 *   style para a largura. Vale só para atributos, não para <style> ou scripts.
 * - Em desenvolvimento o React precisa de eval e o Next injeta estilos sem
 *   nonce, por isso as duas exceções só valem fora de produção.
 */
export function buildCsp(nonce: string, { dev }: { dev: boolean }): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    dev ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  return directives.join("; ");
}

/** Nonce imprevisível e único por requisição (128 bits, em base64). */
export function newNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}
