import { type Page, expect, test } from "@playwright/test";

import { alucinacoes } from "../../src/content/modules/alucinacoes";
import { DONT_KNOW_OPTION_ID, placementQuestions } from "../../src/content/placement";
import { expectAccessible, signUp, uniqueEmail } from "./helpers";


async function newStudent(page: Page) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250) + 1}` });
  await signUp(page, { name: "Caio Mendes", email: uniqueEmail() });
  await expect(page).toHaveURL("/painel");
}

async function doPlacement(page: Page) {
  await page.goto("/nivelamento");
  for (const [i, q] of placementQuestions.entries()) {
    await page.getByRole("radio", { name: q.options.find((o) => o.id === DONT_KNOW_OPTION_ID)!.text }).check();
    if (i < placementQuestions.length - 1) await page.getByRole("button", { name: "Próxima" }).click();
  }
  await page.getByRole("button", { name: "Ver meu resultado" }).click();
  await expect(page).toHaveURL("/nivelamento/resultado");
}

/** Faz a prática de Alucinações acertando tudo e abre o resultado. */
async function perfectPractice(page: Page) {
  for (const [i, q] of alucinacoes.practice.entries()) {
    await page.getByRole("radio", { name: q.options.find((o) => o.id === q.correctOptionId)!.text }).check();
    await page.getByRole("button", { name: "Responder" }).click();
    await expect(page.getByText("Resposta certa.")).toBeVisible();
    if (i < alucinacoes.practice.length - 1) await page.getByRole("button", { name: "Próxima pergunta" }).click();
  }
  await page.getByRole("button", { name: "Ver resultado" }).click();
}

test.describe("C1 — Jornada de Evolução e Conquistas", () => {
  test("sem atividade: estágio 1, nenhuma conquista e o primeiro passo", async ({ page }) => {
    await newStudent(page);
    const card = page.getByRole("region", { name: /Estágio 1 de 5/ });
    await expect(card).toContainText("0 XP");
    await expect(card).toContainText("Você ganha XP ao concluir o nivelamento");
    await expect(card.getByRole("progressbar", { name: "Estágio da jornada" })).toHaveAttribute(
      "aria-valuetext",
      "Estágio 1 de 5, 0 XP. Faltam 60 XP para o Estágio 2.",
    );

    await card.getByRole("link", { name: "Ver minha jornada" }).click();
    await expect(page).toHaveURL("/jornada");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Estágio 1 de 5");
    await expect(page.getByText("0 de 6", { exact: true })).toBeVisible();
    await expect(page.getByText("Ainda não obtida")).toHaveCount(6);
    await expect(page.getByText(/Nenhum XP ainda/)).toBeVisible();
    await expectAccessible(page);
  });

  test("só o primeiro nivelamento rende XP", async ({ page }) => {
    await newStudent(page);
    await doPlacement(page);
    await expect(page.getByText("Este nivelamento rendeu 20 XP.")).toBeVisible();
    await expectAccessible(page);

    await doPlacement(page);
    await expect(page.getByText("Refazer o nivelamento não rende XP de novo.")).toBeVisible();
  });

  test("aula + prática perfeita: XP, conquistas novas, e refazer não paga de novo", async ({ page }) => {
    await newStudent(page);
    await page.goto("/trilha/alucinacoes");
    await page.getByRole("button", { name: "Concluir aula e ir para a prática" }).click();
    await page.getByRole("button", { name: "Começar a prática" }).click();
    await perfectPractice(page);

    await expect(page.getByText("+90 XP")).toBeVisible();
    await expect(page.getByText("Conquista nova: Primeiro módulo")).toBeVisible();
    await expect(page.getByText("Conquista nova: Olho nas alucinações")).toBeVisible();
    await expectAccessible(page);

    // Refazer: a nota pode melhorar, o XP não.
    await page.goto("/trilha/alucinacoes/pratica");
    await page.getByRole("button", { name: "Praticar de novo" }).click();
    await perfectPractice(page);
    await expect(page.getByText("Esta tentativa não rendeu XP: os acertos contam só na primeira tentativa.")).toBeVisible();

    await page.goto("/trilha/alucinacoes");
    await expect(page.getByRole("status")).toContainText("Rendeu 10 XP.");

    await page.goto("/jornada");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Estágio 2 de 5");
    await expect(page.getByText("100 XP", { exact: true })).toBeVisible();
    await expect(page.getByText("2 de 6", { exact: true })).toBeVisible();
    const history = page.getByRole("region", { name: "Histórico de XP" });
    await expect(history.getByRole("listitem")).toHaveCount(3);
    await expect(history).toContainText("Prática, primeira tentativa: Como identificar alucinações");
    await expectAccessible(page);
  });

  test("o menu leva à jornada", async ({ page }) => {
    await newStudent(page);
    const toggle = page.getByRole("button", { name: "Menu" });
    if (await toggle.isVisible()) await toggle.click();
    await page.getByRole("navigation", { name: "Menu principal" }).getByRole("link", { name: "Minha jornada" }).click();
    await expect(page).toHaveURL("/jornada");
  });
});
