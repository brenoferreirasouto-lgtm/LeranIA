import { type Page, expect, test } from "@playwright/test";

import { finalAssessment } from "../../src/content/assessment";
import { comparacaoDePrompts } from "../../src/content/modules/comparacao-de-prompts";
import { DONT_KNOW_OPTION_ID, placementQuestions } from "../../src/content/placement";
import { tracks } from "../../src/content/tracks";
import { completeModules } from "./db";
import { expectAccessible, signUp, uniqueEmail } from "./helpers";


async function newStudent(page: Page) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `192.0.2.${Math.floor(Math.random() * 250) + 1}` });
  const email = uniqueEmail();
  await signUp(page, { name: "Sofia Prado", email });
  await expect(page).toHaveURL("/painel");
  return email;
}

test.describe("SP06 — construtor guiado de prompts", () => {
  test("monta o prompt nas quatro etapas, exige o objetivo e avisa sobre dados pessoais", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await newStudent(page);
    await page.goto("/construtor");

    await page.getByRole("textbox", { name: /Quem é você/ }).fill("Sou estudante de Sistemas de Informação.");
    await page.getByRole("button", { name: "Próximo" }).click();

    // Objetivo é obrigatório.
    await page.getByRole("button", { name: "Próximo" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Preencha o objetivo para continuar.");
    await page.getByRole("textbox", { name: /O que exatamente/ }).fill("Explique o que é um banco de dados relacional.");
    await page.getByRole("button", { name: "Próximo" }).click();

    await page.getByRole("textbox", { name: /Como a resposta deve vir/ }).fill("Em 5 tópicos curtos.");
    await page.getByRole("button", { name: "Próximo" }).click();
    await page.getByRole("textbox", { name: /O que evitar/ }).fill("Responda para joana@exemplo.com.");
    await page.getByRole("button", { name: "Revisar prompt" }).click();

    const finalPrompt = page.getByLabel("Prompt montado");
    await expect(finalPrompt).toContainText("Sou estudante de Sistemas de Informação.");
    await expect(finalPrompt).toContainText("Formato da resposta: Em 5 tópicos curtos.");
    await expect(finalPrompt).toContainText("Restrições: Responda para joana@exemplo.com.");

    const warning = page.getByRole("main").getByRole("alert");
    await expect(warning).toContainText("Parece haver dados pessoais no prompt");
    await expect(warning).toContainText("e-mail");

    await page.getByRole("button", { name: "Copiar prompt" }).click();
    await expect(page.getByRole("main").getByRole("status")).toHaveText("Prompt copiado.");
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("Explique o que é um banco de dados relacional.");

    await expectAccessible(page);
  });

  test("o exemplo preenche as etapas e a prévia acompanha", async ({ page }) => {
    await newStudent(page);
    await page.goto("/construtor");
    await expect(page.getByText("O prompt aparece aqui enquanto você preenche as etapas.")).toBeVisible();
    await page.getByRole("button", { name: "Preencher com um exemplo" }).click();
    await expect(page.getByLabel("Prévia do prompt")).toContainText("Explique a fotossíntese.");
    await page.getByRole("button", { name: /Revisar/ }).first().click();
    await expect(page.getByText("Os quatro elementos estão preenchidos.")).toBeVisible();
  });
});

test.describe("SP07/SP08 — comparação de prompts e verificação", () => {
  test("a prática de comparação mostra pares de prompts e explica a escolha", async ({ page }) => {
    await newStudent(page);
    await page.goto("/trilha");
    await expect(page.getByRole("link", { name: "Comparar prompts bons e ruins" })).toBeVisible();

    await page.goto("/trilha/comparacao-de-prompts/pratica");
    await page.getByRole("button", { name: "Começar a prática" }).click();
    const q = comparacaoDePrompts.practice[0];
    await expect(page.getByRole("radio", { name: /^Prompt A/ })).toBeVisible();
    await expect(page.getByRole("radio", { name: /^Prompt B/ })).toBeVisible();
    await page.getByRole("radio", { name: q.options.find((o) => o.id === q.correctOptionId)!.text }).check();
    await page.getByRole("button", { name: "Responder" }).click();
    await expect(page.getByText("Resposta certa.")).toBeVisible();
    await expect(page.getByText(q.explanation)).toBeVisible();
  });

  test("a aula de verificação apresenta o roteiro de checagem", async ({ page }) => {
    await newStudent(page);
    await page.goto("/trilha/verificar-informacoes");
    const checklist = page.getByRole("region", { name: "Antes de usar uma informação" });
    await expect(checklist.getByRole("listitem")).toHaveCount(6);
    await expectAccessible(page);
  });
});

test.describe("SP12/SP10/SP11 — avaliação final, resultado e recomendações", () => {
  test("bloqueada até concluir os módulos obrigatórios", async ({ page }) => {
    await newStudent(page);
    await page.goto("/avaliacao");
    await expect(page.getByRole("heading", { name: "Disponível ao concluir os módulos obrigatórios" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Enviar avaliação" })).toHaveCount(0);

    await page.goto("/trilha");
    await expect(page.getByText(/Libera quando você concluir os 6 módulos obrigatórios/)).toBeVisible();

    await page.goto("/resultado");
    await expect(page.getByText("Nenhuma prática feita ainda.")).toBeVisible();
    await expect(page.getByText("Libera ao concluir os módulos obrigatórios.")).toBeVisible();
    await expectAccessible(page);
  });

  test("depois da trilha: faz a avaliação, vê a correção, o resultado e o que revisar", async ({ page }) => {
    const email = await newStudent(page);
    // Nivelamento com "Ainda não sei" em tudo: trilha Iniciante.
    await page.goto("/nivelamento");
    for (const [i, q] of placementQuestions.entries()) {
      await page.getByRole("radio", { name: q.options.find((o) => o.id === DONT_KNOW_OPTION_ID)!.text }).check();
      if (i < placementQuestions.length - 1) await page.getByRole("button", { name: "Próxima" }).click();
    }
    await page.getByRole("button", { name: "Ver meu resultado" }).click();
    await expect(page).toHaveURL("/nivelamento/resultado");

    await completeModules(
      email,
      tracks.iniciante.steps.filter((s) => !s.optional).map((s) => s.moduleSlug),
    );

    await page.goto("/painel");
    await expect(page.getByRole("heading", { name: "Avaliação final liberada" })).toBeVisible();
    await page.getByRole("link", { name: "Fazer a avaliação final" }).click();
    await expect(page).toHaveURL("/avaliacao");
    await expectAccessible(page);

    // Acerta tudo, menos as três questões de verificação.
    const wrong = new Set(["aval-q5", "aval-q6", "aval-q7"]);
    for (const [i, q] of finalAssessment.questions.entries()) {
      const option = wrong.has(q.id)
        ? q.options.find((o) => o.id !== q.correctOptionId)!
        : q.options.find((o) => o.id === q.correctOptionId)!;
      await page.getByRole("radio", { name: option.text }).check();
      if (i < finalAssessment.questions.length - 1) await page.getByRole("button", { name: "Próxima" }).click();
    }
    await page.getByRole("button", { name: "Enviar avaliação" }).click();

    await expect(page).toHaveURL("/avaliacao/resultado");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("9 de 12 (75%)");
    await expect(page.getByText("Aprovado na avaliação final.")).toBeVisible();
    // C1: 9 acertos na primeira tentativa (90) + aprovação (50).
    await expect(page.getByText("Esta tentativa rendeu 140 XP.")).toBeVisible();
    await expect(page.getByText("Errada", { exact: true })).toHaveCount(3);
    const recs = page.getByRole("region", { name: "O que revisar" });
    await expect(recs.getByRole("link", { name: "Verificar informações produzidas por IA" })).toBeVisible();
    await expect(recs.getByText("Na avaliação final, você acertou 0 de 3 sobre verificação de informações.")).toBeVisible();
    await expectAccessible(page);

    await page.getByRole("link", { name: "Ver meu resultado geral" }).click();
    await expect(page).toHaveURL("/resultado");
    await expect(page.getByText("6 de 6")).toBeVisible();
    await expect(page.getByText("80%")).toBeVisible();
    await expect(page.getByText("9 de 12 · aprovado")).toBeVisible();
    await expectAccessible(page);

    await page.goto("/painel");
    await expect(page.getByRole("heading", { name: "Para revisar" })).toBeVisible();
    // Errou as três de verificação: os outros quatro temas ficam confirmados.
    await expect(page.getByText("Habilidades confirmadas: 4 de 5.")).toBeVisible();
  });
});
