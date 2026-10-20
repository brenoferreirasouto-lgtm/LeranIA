import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { disableBrowserValidation, signUp, uniqueEmail } from "./helpers";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectNoA11yViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  const summary = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`);
  expect(summary).toEqual([]);
}

test.describe("SP14 — Navegação básica", () => {
  test("a página inicial leva ao cadastro", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("quando questioná-la");
    await page.getByRole("main").getByRole("link", { name: "Criar conta" }).click();
    await expect(page).toHaveURL("/cadastro");
  });

  test("logado, o menu marca a página atual e mostra o primeiro nome", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-forwarded-for": "203.0.113.50" });
    await signUp(page, { name: "Maria Clara Souza", email: uniqueEmail() });

    const menu = page.getByRole("navigation", { name: "Menu principal" });
    await expect(menu.getByRole("link", { name: "Painel" })).toHaveAttribute("aria-current", "page");
    await expect(menu.getByText("Maria", { exact: true })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Sair" })).toBeVisible();
  });

  test("o link para pular o menu leva ao conteúdo", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute("href", "#conteudo");
  });
});

test.describe("Acessibilidade (axe, WCAG 2.1 AA)", () => {
  for (const path of ["/", "/cadastro", "/entrar", "/privacidade"]) {
    test(`sem violações em ${path}`, async ({ page }) => {
      await page.goto(path);
      await expectNoA11yViolations(page);
    });
  }

  test("sem violações no cadastro com erros exibidos", async ({ page }) => {
    await page.goto("/cadastro");
    await disableBrowserValidation(page);
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Informe seu nome.")).toBeVisible();
    await expectNoA11yViolations(page);
  });

  test("sem violações no painel", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-forwarded-for": "203.0.113.51" });
    await signUp(page, { name: "Nina Ramos", email: uniqueEmail() });
    await expect(page).toHaveURL("/painel");
    await expectNoA11yViolations(page);
  });
});
