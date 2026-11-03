import { randomUUID } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { type Page, expect } from "@playwright/test";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * Verificação de acessibilidade (axe, WCAG 2.1 AA). Espera o título da
 * página: depois de um redirecionamento, o Next aplica o título um instante
 * depois de trocar o endereço, e o axe não pode rodar nesse intervalo.
 */
export async function expectAccessible(page: Page) {
  await expect(page).toHaveTitle(/Learn AI/);
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
}

export const PASSWORD = "frase segura 123";

/** E-mail único por teste, para os testes rodarem em paralelo sem conflito. */
export function uniqueEmail(prefix = "estudante") {
  return `${prefix}-${randomUUID().slice(0, 8)}@teste.learnai.dev`;
}

export async function signUp(page: Page, { name, email, password = PASSWORD }: {
  name: string;
  email: string;
  password?: string;
}) {
  await page.goto("/cadastro");
  await page.getByLabel("Nome").fill(name);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByLabel(/Li e aceito/).check();
  await page.getByLabel("Tenho 13 anos ou mais.").check();
  await page.getByRole("button", { name: "Criar conta" }).click();
}

export async function signIn(page: Page, email: string, password = PASSWORD, path = "/entrar") {
  await page.goto(path);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

/** No celular o menu fica recolhido atrás do botão "Menu" (SP14). */
export async function openMenu(page: Page) {
  // Espera a área logada carregar: no celular aparece "Menu"; em telas largas, "Sair".
  await page.getByRole("banner").getByRole("button", { name: /^(Menu|Sair)$/ }).first().waitFor();
  const toggle = page.getByRole("button", { name: "Menu" });
  if (await toggle.isVisible()) {
    if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  }
}

export async function signOut(page: Page) {
  await openMenu(page);
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL("/");
}

/** Desliga a validação do navegador para exercitar a validação do servidor. */
export async function disableBrowserValidation(page: Page) {
  // Todos os formulários da página (a confirmação de idade tem dois).
  await page.locator("form").evaluateAll((forms: HTMLFormElement[]) => {
    for (const form of forms) form.noValidate = true;
  });
}

/** Mensagem de erro geral do formulário (o Next também tem um role="alert" próprio, fora do main). */
export function formAlert(page: Page) {
  return page.getByRole("main").getByRole("alert");
}
