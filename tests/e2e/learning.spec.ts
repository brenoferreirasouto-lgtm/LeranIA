import { type Page, expect, test } from "@playwright/test";

// Os testes leem o gabarito direto dos arquivos de conteúdo (o app nunca o envia ao navegador).
import { introducaoIaGenerativa } from "../../src/content/modules/introducao-ia-generativa";
import { DONT_KNOW_OPTION_ID, placementQuestions } from "../../src/content/placement";
import type { Question } from "../../src/content/types";
import { expectAccessible, formAlert, openMenu, signIn, signOut, signUp, uniqueEmail } from "./helpers";


function optionText(question: Question, optionId: string) {
  return question.options.find((o) => o.id === optionId)!.text;
}

function wrongOption(question: Question) {
  return question.options.find((o) => o.id !== question.correctOptionId && o.id !== DONT_KNOW_OPTION_ID)!;
}

async function newStudent(page: Page, name = "Rita Campos") {
  const ip = `192.0.2.${Math.floor(Math.random() * 250) + 1}`;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ip });
  const email = uniqueEmail();
  await signUp(page, { name, email });
  await expect(page).toHaveURL("/painel");
  return email;
}

/** Faz o nivelamento acertando as `correct` primeiras questões e marcando "Ainda não sei" nas demais. */
async function takePlacement(page: Page, correct: number) {
  await page.goto("/nivelamento");
  for (const [i, q] of placementQuestions.entries()) {
    await expect(page.getByText(`Pergunta ${i + 1} de ${placementQuestions.length}`)).toBeVisible();
    const choice = i < correct ? q.correctOptionId : DONT_KNOW_OPTION_ID;
    await page.getByRole("radio", { name: optionText(q, choice) }).check();
    if (i < placementQuestions.length - 1) {
      await page.getByRole("button", { name: "Próxima" }).click();
    }
  }
  await page.getByRole("button", { name: "Ver meu resultado" }).click();
  await expect(page).toHaveURL("/nivelamento/resultado");
}

/** Responde a prática do módulo de introdução acertando as questões indicadas. */
async function answerPractice(page: Page, correctIndexes: number[]) {
  const questions = introducaoIaGenerativa.practice;
  for (const [i, q] of questions.entries()) {
    await expect(page.getByText(`Pergunta ${i + 1} de ${questions.length}`)).toBeVisible();
    const option = correctIndexes.includes(i) ? q.options.find((o) => o.id === q.correctOptionId)! : wrongOption(q);
    await page.getByRole("radio", { name: option.text }).check();
    await page.getByRole("button", { name: "Responder" }).click();
    await expect(page.getByText(correctIndexes.includes(i) ? "Resposta certa." : "Não foi dessa vez.")).toBeVisible();
    await page
      .getByRole("button", { name: i === questions.length - 1 ? "Ver resultado" : "Próxima pergunta" })
      .click();
  }
}

test.describe("SP02/SP03 — nivelamento e direcionamento", () => {
  test("sem nivelamento, o painel convida a fazer o quiz", async ({ page }) => {
    await newStudent(page);
    await expect(page.getByRole("heading", { name: "Comece pelo quiz de nivelamento" })).toBeVisible();
    await page.getByRole("link", { name: "Fazer o nivelamento" }).click();
    await expect(page).toHaveURL("/nivelamento");
  });

  test("marcar \"Ainda não sei\" em tudo leva à trilha Iniciante", async ({ page }) => {
    await newStudent(page);
    await takePlacement(page, 0);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Seu nível: Iniciante");
    await expect(page.getByText("0 de 10 respostas certas (0%)")).toBeVisible();

    await page.getByRole("link", { name: "Começar a trilha" }).click();
    await expect(page).toHaveURL("/trilha");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Trilha Iniciante");
  });

  test("acertar 8 de 10 leva à trilha Avançada", async ({ page }) => {
    await newStudent(page);
    await takePlacement(page, 8);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Seu nível: Avançado");
    await expect(page.getByText("8 de 10 respostas certas (80%)")).toBeVisible();
  });

  test("não avança sem escolher uma alternativa", async ({ page }) => {
    await newStudent(page);
    await page.goto("/nivelamento");
    await page.getByRole("button", { name: "Próxima" }).click();
    await expect(formAlert(page)).toContainText("Escolha uma alternativa para continuar");
    await expect(page.getByText("Pergunta 1 de 10")).toBeVisible();
  });

  test("o servidor recusa nivelamento incompleto e mostra a pergunta que falta", async ({ page }) => {
    await newStudent(page);
    await page.goto("/nivelamento");
    for (const [i, q] of placementQuestions.entries()) {
      await page.getByRole("radio", { name: optionText(q, DONT_KNOW_OPTION_ID) }).check();
      if (i < placementQuestions.length - 1) await page.getByRole("button", { name: "Próxima" }).click();
    }
    // Simula uma resposta perdida no caminho: desmarca a pergunta 3 direto no formulário.
    await page.locator('input[name="q:niv-q3"]').evaluateAll((inputs) =>
      inputs.forEach((input) => ((input as HTMLInputElement).checked = false)),
    );
    await page.getByRole("button", { name: "Ver meu resultado" }).click();

    await expect(formAlert(page)).toContainText("Responda todas as perguntas");
    await expect(page.getByText("Pergunta 3 de 10")).toBeVisible();
    await expect(page).toHaveURL("/nivelamento");
  });

  test("refazer o nivelamento atualiza o nível", async ({ page }) => {
    await newStudent(page);
    await takePlacement(page, 0);
    await takePlacement(page, 6);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Seu nível: Intermediário");
    await page.goto("/trilha");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Trilha Intermediária");
  });
});

test.describe("U03/SP01/SP13 — trilha, aula e prática com feedback", () => {
  test("concluir aula e prática conclui o módulo e atualiza a trilha e o painel", async ({ page }) => {
    await newStudent(page);
    await takePlacement(page, 0);
    await page.goto("/trilha");

    await page.getByRole("link", { name: "Introdução à IA generativa" }).click();
    await expect(page).toHaveURL("/trilha/introducao-ia-generativa");
    await expect(page.getByRole("heading", { name: "Como um modelo de linguagem escreve uma resposta" })).toBeVisible();

    await page.getByRole("button", { name: "Concluir aula e ir para a prática" }).click();
    await expect(page).toHaveURL("/trilha/introducao-ia-generativa/pratica");
    await page.getByRole("button", { name: "Começar a prática" }).click();

    // Primeira resposta errada: feedback mostra a correta e a explicação.
    const first = introducaoIaGenerativa.practice[0];
    await page.getByRole("radio", { name: wrongOption(first).text }).check();
    await page.getByRole("button", { name: "Responder" }).click();
    await expect(page.getByText("Não foi dessa vez.")).toBeVisible();
    await expect(page.getByText(first.explanation)).toBeVisible();
    await expect(page.getByText("Correta", { exact: true })).toBeVisible();
    await expect(page.getByText("Sua resposta", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Próxima pergunta" }).click();

    for (const [i, q] of introducaoIaGenerativa.practice.entries()) {
      if (i === 0) continue;
      await page.getByRole("radio", { name: optionText(q, q.correctOptionId) }).check();
      await page.getByRole("button", { name: "Responder" }).click();
      await expect(page.getByText("Resposta certa.")).toBeVisible();
      await page.getByRole("button", { name: i === 4 ? "Ver resultado" : "Próxima pergunta" }).click();
    }

    await expect(page.getByRole("heading", { name: "Você acertou 4 de 5 (80%)" })).toBeVisible();
    await expect(page.getByText("Módulo concluído.")).toBeVisible();

    await page.getByRole("link", { name: "Voltar para a trilha" }).click();
    const card = page.getByRole("listitem").filter({ hasText: "Introdução à IA generativa" });
    await expect(card.getByText("Concluído")).toBeVisible();
    await expect(card.getByText("melhor nota 80%")).toBeVisible();

    await openMenu(page);
    await page.getByRole("link", { name: "Painel" }).click();
    await expect(page.getByRole("progressbar", { name: "Módulos obrigatórios concluídos" })).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
    await expect(page.getByText("1 de 6")).toBeVisible();
  });

  test("prática abaixo de 70% não conclui o módulo e permite tentar de novo", async ({ page }) => {
    await newStudent(page);
    await takePlacement(page, 0);
    await page.goto("/trilha/introducao-ia-generativa");
    await page.getByRole("button", { name: "Concluir aula e ir para a prática" }).click();
    await page.getByRole("button", { name: "Começar a prática" }).click();

    await answerPractice(page, [0, 1, 2]);
    const outcome = page.getByRole("region", { name: "Você acertou 3 de 5 (60%)" });
    await expect(outcome).toBeVisible();
    await expect(outcome.getByText(/Para concluir o módulo, acerte pelo menos 70%/)).toBeVisible();

    await page.getByRole("button", { name: "Tentar de novo" }).click();
    await expect(page.getByText("Pergunta 1 de 5")).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Respondidas" })).toHaveAttribute("aria-valuenow", "0");
  });

  test("a prática continua de onde parou depois de recarregar", async ({ page }) => {
    await newStudent(page);
    await page.goto("/trilha/introducao-ia-generativa/pratica");
    await page.getByRole("button", { name: "Começar a prática" }).click();

    for (const q of introducaoIaGenerativa.practice.slice(0, 2)) {
      await page.getByRole("radio", { name: optionText(q, q.correctOptionId) }).check();
      await page.getByRole("button", { name: "Responder" }).click();
      await page.getByRole("button", { name: "Próxima pergunta" }).click();
    }

    await page.reload();
    await expect(page.getByText("Pergunta 3 de 5")).toBeVisible();
    await expect(page.getByText("2 de 5")).toBeVisible();
  });
});

test.describe("SP05 — continuar de onde parou", () => {
  test("depois de sair e entrar, o painel leva à última aula aberta", async ({ page }) => {
    const email = await newStudent(page);
    await takePlacement(page, 0);
    await page.goto("/trilha/privacidade-e-dados");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacidade e dados sensíveis");
    // A visita é registrada pelo navegador logo depois de abrir a aula.
    await expect(async () => {
      await page.goto("/painel");
      await expect(page.getByText("Continue de onde parou")).toBeVisible({ timeout: 1000 });
    }).toPass();

    await signOut(page);
    await signIn(page, email);
    await expect(page.getByRole("heading", { name: "Privacidade e dados sensíveis" })).toBeVisible();
    await page.getByRole("link", { name: "Continuar" }).click();
    await expect(page).toHaveURL("/trilha/privacidade-e-dados");
  });
});

test.describe("Acesso e erros", () => {
  test("a trilha exige login", async ({ page }) => {
    await page.goto("/trilha");
    await expect(page).toHaveURL("/entrar?next=%2Ftrilha");
  });

  test("módulo inexistente mostra página não encontrada", async ({ page }) => {
    await newStudent(page);
    const response = await page.goto("/trilha/modulo-que-nao-existe");
    expect(response?.status()).toBe(404);
  });
});

test.describe("Acessibilidade do núcleo educacional (axe)", () => {
  test("nivelamento, resultado, trilha, aula e prática com feedback", async ({ page }) => {
    await newStudent(page);
    const check = () => expectAccessible(page);

    await page.goto("/nivelamento");
    await check();
    await takePlacement(page, 5);
    await check();
    await page.goto("/trilha");
    await check();
    await page.goto("/trilha/alucinacoes");
    await check();
    await page.goto("/trilha/alucinacoes/pratica");
    await page.getByRole("button", { name: "Começar a prática" }).click();
    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: "Responder" }).click();
    await expect(page.locator("[aria-live] p").first()).toBeVisible();
    await check();
  });
});
