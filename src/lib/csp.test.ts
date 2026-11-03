import { describe, expect, it } from "vitest";

import { buildCsp, newNonce } from "./csp";

describe("Content Security Policy", () => {
  it("em produção, scripts e estilos só com o nonce, sem eval nem inline", () => {
    const csp = buildCsp("abc123", { dev: false });
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).toContain("style-src 'self' 'nonce-abc123'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toMatch(/style-src 'self'[^;]*unsafe-inline/);
  });

  it("bloqueia objetos, outros sites em iframe e envio de formulário para fora", () => {
    const csp = buildCsp("n", { dev: false });
    for (const directive of ["object-src 'none'", "frame-ancestors 'none'", "form-action 'self'", "base-uri 'self'"]) {
      expect(csp).toContain(directive);
    }
  });

  it("em desenvolvimento libera o eval do React e os estilos do Next", () => {
    const csp = buildCsp("n", { dev: true });
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  it("o nonce muda a cada chamada e tem 128 bits", () => {
    const a = newNonce();
    const b = newNonce();
    expect(a).not.toBe(b);
    expect(atob(a)).toHaveLength(16);
  });
});
