import { type Page, expect, test } from "@playwright/test";

import { missions } from "../../src/content/missions";
import type { StepMission } from "../../src/content/types";
import { completeModules } from "./db";
import { expectAccessible, signUp, uniqueEmail } from "./helpers";

const conserte = missions.find((m) => m.id === "conserte-o-prompt") as StepMission;

async function newStudent(page: Page) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250) + 1}` });
  const email = uniqueEmail();
  await signUp(page, { name: "Lia Barros", email });
  await expect(page).toHaveURL("/painel");
  return email;
}

/** Marca módulos como concluídos e abre o painel, que concede o XP retroativo desses módulos. */
async function withModules(page: Page, email: string, slugs: string[]) {
  await completeModules(email, slugs);
  await page.goto("/painel");
}

async function choose(page: Page, step: StepMission["steps"][number], optionIds: string[]) {
  for (const id of optionIds) {
    const text = step.options.find((o) => o.id === id)!.text;
    await page.getByRole(step.multiple ? "checkbox" : "radio", { name: text }).check();
  }
  await page.getByRole("button", { name: "Responder" }).click();
}

test.describe("C2 — Missões e Desafios Práticos", () => {
  test("sem módulos concluídos, todas as missões estão bloqueadas e dizem o que falta", async ({ page }) => {
    await newStudent(page);
    await page.goto("/missoes");
    await expect(page.getByText("Bloqueada", { exact: true })).toHaveCount(missions.length);
    await expect(page.getByText('Libera ao concluir o módulo "Comparar prompts bons e ruins".')).toBeVisible();
    await expectAccessible(page);

    await page.goto("/missoes/conserte-o-prompt");
    await expect(page.getByRole("heading", { name: "Missão bloqueada" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Começar a missão" })).toHaveCount(0);
  });

  test("missão em passos: dica, \"marque todas\" com correção, conclusão e XP uma vez", async ({ page }) => {
    const email = await newStudent(page);
    await withModules(page, email, ["comparacao-de-prompts"]);

    await page.goto("/missoes");
    await page.getByRole("link", { name: "Conserte o prompt" }).click();
    await page.getByRole("button", { name: "Começar a missão" }).click();

    // Sem nivelamento vale a Trilha Iniciante: a dica vem aberta.
    await expect(page.getByText(conserte.steps[0].hint)).toBeVisible();
    await expect(page.getByText("Você pode marcar mais de uma.")).toBeVisible();
    await expectAccessible(page);

    // Passo 1: marca só duas das três corretas.
    await choose(page, conserte.steps[0], ["a", "b"]);
    await expect(page.getByText("Não foi dessa vez.")).toBeVisible();
    await expect(page.getByText("Faltou marcar")).toBeVisible();
    await expect(page.getByText(conserte.steps[0].explanation)).toBeVisible();
    await expectAccessible(page);

    for (const step of conserte.steps.slice(1)) {
      await page.getByRole("button", { name: "Próximo passo" }).click();
      await choose(page, step, step.correctOptionIds);
      await expect(page.getByText("Passo certo.")).toBeVisible();
    }
    await page.getByRole("button", { name: "Ver resultado" }).click();
    await expect(page.getByRole("heading", { name: "3 de 4 passos certos (75%)" })).toBeVisible();
    await expect(page.getByText("Missão concluída.")).toBeVisible();
    await expect(page.getByText("+30 XP")).toBeVisible();
    await expectAccessible(page);

    // Refazer não paga de novo.
    await page.goto("/missoes/conserte-o-prompt");
    await page.getByRole("button", { name: "Fazer de novo" }).click();
    for (const [i, step] of conserte.steps.entries()) {
      if (i > 0) await page.getByRole("button", { name: "Próximo passo" }).click();
      await choose(page, step, step.correctOptionIds);
    }
    await page.getByRole("button", { name: "Ver resultado" }).click();
    await expect(page.getByText("Esta tentativa não rendeu XP: cada missão paga uma vez.")).toBeVisible();

    await page.goto("/missoes");
    await expect(page.getByText("Concluída", { exact: true })).toHaveCount(1);
    await page.goto("/jornada");
    await expect(page.getByRole("region", { name: "Histórico de XP" })).toContainText("Missão concluída: Conserte o prompt");
  });

  test("missão do construtor: dados pessoais impedem; prompt completo conclui com a conquista", async ({ page }) => {
    const email = await newStudent(page);
    await withModules(page, email, ["estrutura-de-um-bom-prompt"]);

    await page.goto("/missoes/monte-um-prompt");
    await expect(page.getByText("Ele é conferido e descartado: nada do que você escreve é gravado.", { exact: false })).toBeVisible();
    await expect(page.getByRole("button", { name: "Preencher com um exemplo" })).toHaveCount(0);

    const fields = [
      "Sou estudante do ensino médio e tenho um seminário na semana que vem.",
      "Monte um roteiro de 10 minutos sobre o ciclo da água.",
      "Introdução, três partes e conclusão, em tópicos curtos.",
      "Use linguagem simples. Meu e-mail é lia@exemplo.com.",
    ];
    for (const [i, text] of fields.entries()) {
      await page.locator("textarea").fill(text);
      await page.getByRole("button", { name: i === fields.length - 1 ? "Revisar prompt" : "Próximo" }).click();
    }
    await page.getByRole("button", { name: "Enviar para conferir" }).click();
    await expect(page.getByText("Ainda não foi desta vez. Ajuste e envie de novo:")).toBeVisible();
    await expect(page.getByText("Tire os dados pessoais: encontramos e-mail.")).toBeVisible();

    await page.getByRole("button", { name: /Restrições/ }).click();
    await page.locator("textarea").fill("Use linguagem simples e diga o que devo conferir em fontes oficiais.");
    await page.getByRole("button", { name: "Revisar prompt" }).click();
    await page.getByRole("button", { name: "Enviar para conferir" }).click();
    await expect(page.getByText("Missão concluída: os quatro elementos estão no prompt.")).toBeVisible();
    await expect(page.getByText("+30 XP")).toBeVisible();
    await expect(page.getByText("Conquista nova: Prompt completo")).toBeVisible();
    await expectAccessible(page);
  });

  test("o menu leva às missões", async ({ page }) => {
    await newStudent(page);
    const toggle = page.getByRole("button", { name: "Menu" });
    if (await toggle.isVisible()) await toggle.click();
    await page.getByRole("navigation", { name: "Menu principal" }).getByRole("link", { name: "Missões" }).click();
    await expect(page).toHaveURL("/missoes");
  });
});
