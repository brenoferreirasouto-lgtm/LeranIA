import { expect, test } from "@playwright/test";

import { expectAccessible, disableBrowserValidation, openMenu, signUp, uniqueEmail } from "./helpers";


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
    await expect(page).toHaveURL("/painel");
    await openMenu(page);

    const menu = page.getByRole("navigation", { name: "Menu principal" });
    await expect(menu.getByRole("link", { name: "Painel" })).toHaveAttribute("aria-current", "page");
    await expect(menu.getByText("Maria", { exact: true })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Sair" })).toBeVisible();
    for (const item of ["Minha jornada", "Trilha", "Missões", "Nivelamento", "Construtor de prompt", "Avaliação final", "Resultado"]) {
      await expect(menu.getByRole("link", { name: item })).toBeVisible();
    }
  });

  test("no celular, o menu abre pelo botão e fecha com Esc", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "celular", "Só no celular o menu fica recolhido.");
    await page.setExtraHTTPHeaders({ "x-forwarded-for": "203.0.113.52" });
    await signUp(page, { name: "Otávio Lins", email: uniqueEmail() });
    await expect(page).toHaveURL("/painel");

    const toggle = page.getByRole("button", { name: "Menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("link", { name: "Trilha" })).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("link", { name: "Trilha" }).focus();
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();

    await toggle.click();
    await page.getByRole("link", { name: "Trilha" }).click();
    await expect(page).toHaveURL("/trilha");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
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
      await expectAccessible(page);
    });
  }

  test("sem violações no cadastro com erros exibidos", async ({ page }) => {
    await page.goto("/cadastro");
    await disableBrowserValidation(page);
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Informe seu nome.")).toBeVisible();
    await expectAccessible(page);
  });

  test("sem violações no painel", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-forwarded-for": "203.0.113.51" });
    await signUp(page, { name: "Nina Ramos", email: uniqueEmail() });
    await expect(page).toHaveURL("/painel");
    await expectAccessible(page);
  });
});
