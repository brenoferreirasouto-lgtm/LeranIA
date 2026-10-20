import { type Page, expect, test } from "@playwright/test";

import { passMission } from "./db";
import {
  disableBrowserValidation,
  expectAccessible,
  openMenu,
  signOut,
  signUp,
  uniqueEmail,
} from "./helpers";

async function newStudent(page: Page, name = "Lia Barros") {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250) + 1}` });
  const email = uniqueEmail();
  await signUp(page, { name, email });
  await expect(page).toHaveURL("/painel");
  return email;
}

async function createProject(page: Page, template: RegExp, title: string) {
  await page.goto("/laboratorio");
  await page.getByRole("radio", { name: template }).check();
  await page.getByLabel("Título do projeto").fill(title);
  await page.getByRole("button", { name: "Criar projeto" }).click();
  await expect(page).toHaveURL(/\/laboratorio\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
}

const checklistCount = (page: Page, n: number) =>
  expect(page.getByRole("region", { name: "Lista de conferência" }).getByText(`${n} de 7 itens em dia`)).toBeVisible();

test.describe("D3 — Laboratório de Projetos Autorais", () => {
  test("antes da primeira missão, o Laboratório explica como liberar", async ({ page }) => {
    await newStudent(page);
    await openMenu(page);
    await page.getByRole("link", { name: "Laboratório" }).click();
    await expect(page).toHaveURL("/laboratorio");
    await expect(page.getByRole("heading", { name: "Libera depois da primeira missão" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Criar projeto" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Ir para as missões" })).toHaveAttribute("href", "/missoes");
    await expectAccessible(page);
  });

  test("do modelo ao projeto autoral: etapas, referência conferida e uso de IA registrado", async ({ page }) => {
    const email = await newStudent(page);
    await passMission(email);

    await page.goto("/laboratorio");
    await expect(page.getByText("Laboratório · 0 de 20 projetos")).toBeVisible();
    await expectAccessible(page);
    await createProject(page, /Projeto prático/, "Horta na escola");
    await checklistCount(page, 2);
    await expectAccessible(page);

    // Sobre o projeto, com o aviso de dados pessoais enquanto escreve.
    const goal = page.getByLabel("Objetivo", { exact: true });
    await goal.fill("Montar uma horta. Dúvidas: lia@escola.com");
    await expect(page.getByText("Parece que há e-mail no texto.", { exact: false })).toBeVisible();
    await goal.fill("Montar uma horta de temperos no pátio para a cantina usar");
    await expect(page.getByText("Parece que há e-mail no texto.", { exact: false })).toHaveCount(0);
    await page.getByLabel("Público", { exact: true }).fill("Turma do 1º ano e a equipe da cantina");
    await page.getByLabel("Problema ou pergunta").fill("A cantina compra temperos que poderiam ser plantados aqui");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Salvo.")).toBeVisible();
    await checklistCount(page, 5);

    // Uma tarefa nova entra na etapa e o campo volta vazio.
    const newTask = page.getByLabel("Nova tarefa em Protótipo");
    await newTask.fill("Plantar as primeiras mudas");
    await page.getByRole("button", { name: "Adicionar tarefa em Protótipo" }).click();
    await expect(page.getByRole("checkbox", { name: "Plantar as primeiras mudas" })).toBeVisible();
    await expect(newTask).toHaveValue("");

    // Marca todas as tarefas: as quatro etapas ficam concluídas.
    const stages = page.getByRole("region", { name: "Etapas" });
    const tasks = stages.getByRole("checkbox");
    await expect(tasks).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await tasks.nth(i).check();
      await expect(tasks.nth(i)).toBeChecked();
    }
    await expect(stages.getByText("Concluída", { exact: true })).toHaveCount(4);
    await expect(page.getByText("Projeto prático · 4 de 4 etapas")).toBeVisible();
    await expect(page.getByRole("region", { name: "Histórico" }).getByText("Todas as etapas concluídas")).toBeVisible();
    // Etapas prontas não bastam para a conquista.
    await expect(page.getByRole("heading", { name: "Projeto autoral" })).toHaveCount(0);

    // Referência com link, conferida na fonte.
    await page.getByLabel("Referência", { exact: true }).fill("Embrapa Hortaliças");
    await page.getByLabel("Link (opcional)").fill("https://www.embrapa.br/hortalicas");
    await page.getByRole("button", { name: "Adicionar referência" }).click();
    await expect(page.getByRole("link", { name: "Embrapa Hortaliças" })).toHaveAttribute(
      "href",
      "https://www.embrapa.br/hortalicas",
    );
    await page.getByRole("checkbox", { name: "Conferida na fonte (Embrapa Hortaliças)" }).check();
    await checklistCount(page, 6);

    // "Não usei IA" completa o critério: a conquista aparece, sem XP.
    await page.getByRole("checkbox", { name: "Não usei IA neste projeto" }).check();
    await expect(page.getByRole("heading", { name: "Projeto autoral" })).toBeVisible();
    await checklistCount(page, 7);
    await expectAccessible(page);

    await page.reload();
    await expect(page.getByRole("checkbox", { name: "Não usei IA neste projeto" })).toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Plantar as primeiras mudas" })).toBeChecked();
    await expect(page.getByLabel("Público", { exact: true })).toHaveValue("Turma do 1º ano e a equipe da cantina");

    await page.getByRole("link", { name: "sua jornada" }).click();
    await expect(page).toHaveURL("/jornada");
    const medal = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Projeto autoral" }) });
    await expect(medal).toContainText(/Obtida em/);

    await page.goto("/laboratorio");
    await expect(page.getByText("Laboratório · 1 de 20 projetos")).toBeVisible();
    const item = page.getByRole("listitem").filter({ has: page.getByRole("link", { name: "Horta na escola" }) });
    await expect(item).toContainText("4 de 4 etapas");
  });

  test("validação no servidor, registro de IA, remoção e exclusão do projeto", async ({ page }) => {
    const email = await newStudent(page);
    await passMission(email);
    await createProject(page, /Seminário ou trabalho escolar/, "Revolução Industrial");
    await disableBrowserValidation(page);

    // Link que não é http(s): erro no campo, sem perder o que foi escrito.
    await page.getByLabel("Referência", { exact: true }).fill("Livro didático");
    await page.getByLabel("Link (opcional)").fill("ftp://arquivo");
    await page.getByRole("button", { name: "Adicionar referência" }).click();
    await expect(page.getByText("Use um link que comece com http:// ou https://, ou deixe em branco.")).toBeVisible();
    await expect(page.getByLabel("Referência", { exact: true })).toHaveValue("Livro didático");
    await expectAccessible(page);

    // Registro de IA vazio: o servidor pede cada campo.
    await disableBrowserValidation(page);
    await page.getByRole("button", { name: "Registrar uso de IA" }).click();
    await expect(page.getByText("Diga qual ferramenta de IA você usou.")).toBeVisible();
    await expect(page.getByText("Conte o que você mudou, conferiu ou decidiu a partir da resposta.")).toBeVisible();

    await page.getByLabel("Ferramenta").fill("Assistente de conversa");
    await page.getByLabel("Para que você usou").fill("Pedir uma linha do tempo para revisar");
    await page.getByLabel("O que você fez com a resposta").fill("Conferi as datas no livro e corrigi duas");
    await page.getByRole("button", { name: "Registrar uso de IA" }).click();
    const usage = page.getByRole("region", { name: "Uso de IA" });
    await expect(usage.getByText("Conferi as datas no livro e corrigi duas")).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Não usei IA neste projeto" })).toHaveCount(0);

    await page.getByRole("button", { name: "Remover registro de uso de IA: Assistente de conversa" }).click();
    await expect(page.getByRole("checkbox", { name: "Não usei IA neste projeto" })).toBeVisible();

    // Remover uma tarefa sugerida pelo modelo.
    await page.getByRole("button", { name: "Remover tarefa: Escrever com as suas palavras" }).click();
    await expect(page.getByRole("checkbox", { name: "Escrever com as suas palavras" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Histórico" }).getByText('Tarefa removida em "Produzir"')).toBeVisible();

    // Excluir pede a confirmação.
    await disableBrowserValidation(page);
    await page.getByRole("button", { name: "Excluir projeto" }).click();
    await expect(page.getByText("Marque que você entende que a exclusão é permanente.")).toBeVisible();
    await page.getByLabel(/Entendo que o projeto e o histórico/).check();
    await page.getByRole("button", { name: "Excluir projeto" }).click();
    await expect(page).toHaveURL("/laboratorio");
    await expect(page.getByText("Laboratório · 0 de 20 projetos")).toBeVisible();
    await expect(page.getByRole("link", { name: "Revolução Industrial" })).toHaveCount(0);
  });

  test("o projeto é privado: outra pessoa recebe página não encontrada", async ({ page }) => {
    const email = await newStudent(page);
    await passMission(email);
    await createProject(page, /Projeto de pesquisa/, "Pergunta só minha");
    const url = page.url();
    await signOut(page);

    await newStudent(page, "Caio Prado");
    const response = await page.goto(url);
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Pergunta só minha")).toHaveCount(0);
  });
});
