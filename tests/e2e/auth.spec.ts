import { randomInt } from "node:crypto";
import { expect, test } from "@playwright/test";

import {
  PASSWORD,
  disableBrowserValidation,
  formAlert,
  signIn,
  signOut,
  signUp,
  uniqueEmail,
} from "./helpers";

// Cada teste simula um IP diferente, para o limite de cadastros por IP
// não misturar testes que rodam em paralelo.
test.beforeEach(async ({ page }) => {
  const ip = `198.51.${randomInt(0, 255)}.${randomInt(1, 254)}`;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ip });
});

test.describe("SP15 — Cadastro de usuário", () => {
  test("cadastro válido cria a conta e abre o painel", async ({ page }) => {
    await signUp(page, { name: "Ana Souza", email: uniqueEmail() });

    await expect(page).toHaveURL("/painel");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Olá, Ana.");
    await expect(page.getByText("Nenhuma atividade concluída ainda.")).toBeVisible();
  });

  test("e-mail já cadastrado é recusado", async ({ page }) => {
    const email = uniqueEmail();
    await signUp(page, { name: "Bruno Lima", email });
    await expect(page).toHaveURL("/painel");
    await signOut(page);

    await signUp(page, { name: "Outra Pessoa", email });

    await expect(page).toHaveURL("/cadastro");
    await expect(page.getByText("Já existe uma conta com este e-mail.")).toBeVisible();
    await expect(page.getByLabel("E-mail")).toHaveAttribute("aria-invalid", "true");
    // O que a pessoa digitou continua no formulário, exceto a senha.
    await expect(page.getByLabel("Nome")).toHaveValue("Outra Pessoa");
    await expect(page.getByLabel("Senha")).toHaveValue("");
  });

  test("o servidor valida os campos obrigatórios", async ({ page }) => {
    await page.goto("/cadastro");
    await disableBrowserValidation(page);
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("Informe seu nome.")).toBeVisible();
    await expect(page.getByText("Informe seu e-mail.")).toBeVisible();
    await expect(page.getByText("Crie uma senha.")).toBeVisible();
    await expect(page.getByText(/aceite os termos de uso/)).toBeVisible();
    await expect(page.getByText("O Learn AI é para quem tem 13 anos ou mais. Confirme a sua idade para continuar.")).toBeVisible();
    await expect(page).toHaveURL("/cadastro");
  });

  test("o navegador também impede enviar o formulário vazio", async ({ page }) => {
    await page.goto("/cadastro");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page).toHaveURL("/cadastro");
    const nameIsInvalid = await page
      .getByLabel("Nome")
      .evaluate((input: HTMLInputElement) => !input.validity.valid);
    expect(nameIsInvalid).toBe(true);
  });

  test("senha curta é recusada com explicação", async ({ page }) => {
    await page.goto("/cadastro");
    await disableBrowserValidation(page);
    await page.getByLabel("Nome").fill("Carla Dias");
    await page.getByLabel("E-mail").fill(uniqueEmail());
    await page.getByLabel("Senha").fill("1234567");
    await page.getByLabel(/Li e aceito/).check();
    await page.getByLabel("Tenho 13 anos ou mais.").check();
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("A senha precisa ter pelo menos 8 caracteres.")).toBeVisible();
    await expect(page).toHaveURL("/cadastro");
  });

  test("e-mail com letras maiúsculas vale como o mesmo e-mail", async ({ page }) => {
    const email = uniqueEmail();
    await signUp(page, { name: "Davi Rocha", email: email.toUpperCase() });
    await expect(page).toHaveURL("/painel");
    await signOut(page);

    await signIn(page, email);
    await expect(page).toHaveURL("/painel");
  });
});

test.describe("U02 — Login", () => {
  test("credenciais válidas dão acesso ao painel", async ({ page }) => {
    const email = uniqueEmail();
    await signUp(page, { name: "Elisa Prado", email });
    await signOut(page);

    await signIn(page, email);

    await expect(page).toHaveURL("/painel");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Olá, Elisa.");
  });

  test("senha errada mostra mensagem e não entra", async ({ page }) => {
    const email = uniqueEmail();
    await signUp(page, { name: "Fábio Melo", email });
    await signOut(page);

    await signIn(page, email, "senha-errada-123");

    await expect(formAlert(page)).toHaveText("E-mail ou senha incorretos.");
    await expect(page).toHaveURL(/\/entrar/);
    await expect(page.getByLabel("E-mail")).toHaveValue(email);
  });

  test("e-mail sem conta recebe a mesma mensagem (não revela quem tem conta)", async ({ page }) => {
    await signIn(page, uniqueEmail("ninguem"), PASSWORD);
    await expect(formAlert(page)).toHaveText("E-mail ou senha incorretos.");
  });

  test("a sessão continua depois de recarregar a página", async ({ page }) => {
    await signUp(page, { name: "Gabi Torres", email: uniqueEmail() });
    await expect(page).toHaveURL("/painel");

    await page.reload();

    await expect(page).toHaveURL("/painel");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Olá, Gabi.");
  });

  test("sair encerra a sessão", async ({ page }) => {
    await signUp(page, { name: "Hugo Reis", email: uniqueEmail() });
    await signOut(page);

    await page.goto("/painel");
    await expect(page).toHaveURL("/entrar?next=%2Fpainel");
  });

  test("muitas tentativas seguidas bloqueiam o login por um tempo", async ({ page }) => {
    const email = uniqueEmail("alvo");
    for (let attempt = 1; attempt <= 10; attempt++) {
      await signIn(page, email, `tentativa-${attempt}`);
      await expect(formAlert(page)).toHaveText("E-mail ou senha incorretos.");
    }

    await signIn(page, email, "tentativa-11");
    await expect(formAlert(page)).toHaveText(/Muitas tentativas seguidas/);
  });
});

test.describe("Acesso às páginas protegidas", () => {
  test("o painel exige login e volta para ele depois de entrar", async ({ page }) => {
    const email = uniqueEmail();
    await signUp(page, { name: "Íris Nunes", email });
    await signOut(page);

    await page.goto("/painel");
    await expect(page).toHaveURL("/entrar?next=%2Fpainel");

    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL("/painel");
  });

  test("um destino externo no link de login é ignorado", async ({ page }) => {
    const email = uniqueEmail();
    await signUp(page, { name: "João Alves", email });
    await signOut(page);

    await signIn(page, email, PASSWORD, "/entrar?next=//site-malicioso.example");
    await expect(page).toHaveURL("/painel");

    // Com uma tabulação no meio, o navegador leria "//site-malicioso.example".
    await signOut(page);
    await signIn(page, email, PASSWORD, "/entrar?next=%2F%09%2Fsite-malicioso.example");
    await expect(page).toHaveURL("/painel");
  });

  test("quem já está logado e abre o cadastro vai para o painel", async ({ page }) => {
    await signUp(page, { name: "Lara Costa", email: uniqueEmail() });
    await expect(page).toHaveURL("/painel");
    await page.goto("/cadastro");
    await expect(page).toHaveURL("/painel");
  });
});
