import { readFile } from "node:fs/promises";

import { type Page, expect, test } from "@playwright/test";

import { clearAgeConfirmation, countUserRows } from "./db";
import { PASSWORD, disableBrowserValidation, expectAccessible, formAlert, signIn, signUp, uniqueEmail } from "./helpers";

async function newStudent(page: Page) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `192.0.2.${Math.floor(Math.random() * 250) + 1}` });
  const email = uniqueEmail();
  await signUp(page, { name: "Renata Lopes", email });
  await expect(page).toHaveURL("/painel");
  return email;
}

test.describe("ADR 0002 — idade mínima", () => {
  test("o cadastro exige a declaração de 13 anos ou mais", async ({ page }) => {
    await page.goto("/cadastro");
    await disableBrowserValidation(page);
    await page.getByLabel("Nome").fill("Teo Martins");
    await page.getByLabel("E-mail").fill(uniqueEmail());
    await page.getByLabel("Senha").fill(PASSWORD);
    await page.getByLabel(/Li e aceito/).check();
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(
      page.getByText("O Learn AI é para quem tem 13 anos ou mais. Confirme a sua idade para continuar."),
    ).toBeVisible();
    await expect(page).toHaveURL("/cadastro");
  });

  test("conta antiga confirma a idade antes de continuar", async ({ page }) => {
    const email = await newStudent(page);
    await clearAgeConfirmation(email);

    await page.goto("/trilha");
    await expect(page).toHaveURL("/confirmar-idade?next=%2Ftrilha");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Confirme sua idade");
    await expectAccessible(page);

    await disableBrowserValidation(page);
    await page.getByRole("button", { name: "Confirmar e continuar" }).click();
    await expect(page.getByText("Confirme a sua idade para continuar.", { exact: false })).toBeVisible();

    await page.getByLabel("Tenho 13 anos ou mais.").check();
    await page.getByRole("button", { name: "Confirmar e continuar" }).click();
    await expect(page).toHaveURL("/trilha");
  });
});

test.describe("ADR 0002 — Minha conta", () => {
  test("mostra os dados e baixa um arquivo com eles, sem a senha", async ({ page }) => {
    const email = await newStudent(page);
    await page.goto("/conta");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Minha conta");
    await expect(page.getByRole("region", { name: "Seus dados" })).toContainText(email);
    await expectAccessible(page);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: "Baixar meus dados (JSON)" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("learn-ai-meus-dados.json");
    const text = await readFile((await download.path())!, "utf8");
    const data = JSON.parse(text);
    expect(data.conta.email).toBe(email);
    expect(data.conta.ageConfirmedAt).toBeTruthy();
    expect(text).not.toMatch(/"password"|"token"/);
  });

  test("a exclusão pede a senha certa e apaga a conta", async ({ page }) => {
    const email = await newStudent(page);
    await page.goto("/conta");
    const region = page.getByRole("region", { name: "Excluir minha conta" });

    await region.getByLabel("Sua senha").fill("senha errada 999");
    await region.getByLabel(/Entendo que a exclusão é permanente/).check();
    await region.getByRole("button", { name: "Excluir minha conta" }).click();
    await expect(region.getByText("Senha incorreta.")).toBeVisible();
    expect(await countUserRows(email)).toBe(1);

    await region.getByLabel("Sua senha").fill(PASSWORD);
    await region.getByLabel(/Entendo que a exclusão é permanente/).check();
    await region.getByRole("button", { name: "Excluir minha conta" }).click();
    await expect(page).toHaveURL("/conta-excluida");
    await expect(page.getByRole("status")).toContainText("foram apagados");
    expect(await countUserRows(email)).toBe(0);
    await expectAccessible(page);

    await signIn(page, email);
    await expect(formAlert(page)).toHaveText("E-mail ou senha incorretos.");
  });

  test("o nome no cabeçalho leva à conta", async ({ page }) => {
    await newStudent(page);
    const toggle = page.getByRole("button", { name: "Menu" });
    if (await toggle.isVisible()) await toggle.click();
    await page.getByRole("link", { name: "Minha conta: Renata" }).click();
    await expect(page).toHaveURL("/conta");
  });
});
