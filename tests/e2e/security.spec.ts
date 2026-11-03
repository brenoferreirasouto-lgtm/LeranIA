import { expect, test } from "@playwright/test";

import { expectAccessible } from "./helpers";

// Fase F — cabeçalhos de segurança, CSP com nonce e páginas de erro em português.
test.describe("Segurança e páginas de erro", () => {
  test("toda página sai com a CSP, e o nonce muda a cada requisição", async ({ request }) => {
    const nonces = [];
    for (let i = 0; i < 2; i++) {
      const res = await request.get("/");
      const headers = res.headers();
      const csp = headers["content-security-policy"] ?? "";
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
      nonces.push(csp.match(/'nonce-([^']+)'/)?.[1]);

      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(headers["x-powered-by"]).toBeUndefined();
    }
    expect(nonces[0]).toBeTruthy();
    expect(nonces[0]).not.toBe(nonces[1]);
  });

  test("a página carrega sem nenhuma violação da CSP", async ({ page }) => {
    const violations: string[] = [];
    await page.exposeFunction("reportViolation", (v: string) => violations.push(v));
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (e) =>
        (window as unknown as { reportViolation: (v: string) => void }).reportViolation(
          `${e.violatedDirective} ${e.blockedURI}`,
        ),
      );
    });
    // O cadastro usa o zod no navegador: é a página que pegaria um eval escondido.
    await page.goto("/cadastro");
    await page.getByLabel("Nome").fill("Lia");
    await page.getByRole("button", { name: "Criar conta" }).waitFor();
    await page.waitForLoadState("networkidle");
    expect(violations).toEqual([]);
  });

  test("endereço inexistente mostra a página não encontrada em português", async ({ page }) => {
    const response = await page.goto("/endereco-que-nao-existe");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Página não encontrada");
    await expect(page.getByRole("link", { name: "Ir para a página inicial" })).toBeVisible();
    await expectAccessible(page);
  });
});
