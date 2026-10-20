import { randomUUID } from "node:crypto";
import { type Page, expect } from "@playwright/test";

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
  await page.getByRole("button", { name: "Criar conta" }).click();
}

export async function signIn(page: Page, email: string, password = PASSWORD, path = "/entrar") {
  await page.goto(path);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL("/");
}

/** Desliga a validação do navegador para exercitar a validação do servidor. */
export async function disableBrowserValidation(page: Page) {
  await page.locator("form").evaluate((form: HTMLFormElement) => {
    form.noValidate = true;
  });
}

/** Mensagem de erro geral do formulário (o Next também tem um role="alert" próprio, fora do main). */
export function formAlert(page: Page) {
  return page.getByRole("main").getByRole("alert");
}
