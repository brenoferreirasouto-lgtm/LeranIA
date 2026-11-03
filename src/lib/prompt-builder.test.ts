import { describe, expect, it } from "vitest";

import { EMPTY_FIELDS, buildPrompt, checkPrompt, findPersonalData } from "./prompt-builder";

const complete = {
  contexto: "Sou estudante do 1º período de Biologia e tenho prova na sexta.",
  objetivo: "Explique a fotossíntese.",
  formato: "Em até 8 tópicos curtos, com um exemplo do dia a dia em cada um.",
  restricoes: "Não use termos em inglês.",
};

describe("SP06 — montagem do prompt", () => {
  it("junta os quatro elementos na ordem, em parágrafos", () => {
    expect(buildPrompt(complete)).toBe(
      [
        "Sou estudante do 1º período de Biologia e tenho prova na sexta.",
        "Explique a fotossíntese.",
        "Formato da resposta: Em até 8 tópicos curtos, com um exemplo do dia a dia em cada um.",
        "Restrições: Não use termos em inglês.",
      ].join("\n\n"),
    );
  });

  it("ignora elementos vazios e espaços sobrando", () => {
    expect(buildPrompt({ ...EMPTY_FIELDS, objetivo: "  Resuma o texto.  " })).toBe("Resuma o texto.");
  });

  it("sem nada preenchido, o prompt fica vazio", () => {
    expect(buildPrompt(EMPTY_FIELDS)).toBe("");
  });
});

describe("SP06 — feedback do construtor", () => {
  it("prompt completo fica pronto e sem dicas", () => {
    expect(checkPrompt(complete)).toEqual({ ready: true, tips: [], personalData: [] });
  });

  it("sem objetivo não está pronto", () => {
    const check = checkPrompt({ ...complete, objetivo: "" });
    expect(check.ready).toBe(false);
    expect(check.tips[0]).toMatch(/objetivo/);
  });

  it("aponta cada elemento que faltou", () => {
    const check = checkPrompt({ ...EMPTY_FIELDS, objetivo: "Explique o que é a LGPD em linguagem simples." });
    expect(check.tips).toHaveLength(3);
  });

  it("avisa quando o objetivo é vago", () => {
    expect(checkPrompt({ ...complete, objetivo: "Resuma." }).tips[0]).toMatch(/curto/);
  });
});

describe("U07 — alerta de dados pessoais no prompt", () => {
  it.each([
    ["Fale com joana@exemplo.com.br", "e-mail"],
    ["CPF 123.456.789-09", "CPF"],
    ["Ligue para (81) 99876-5432", "telefone"],
    ["Cartão 4111 1111 1111 1111", "número de cartão"],
    ["minha senha: abc123", "senha"],
  ] as const)("detecta %s", (text, kind) => {
    expect(findPersonalData(text)).toContain(kind);
  });

  it("não acusa texto comum", () => {
    expect(findPersonalData("Explique a Lei nº 13.709/2018 em 5 frases, para 30 alunos.")).toEqual([]);
  });

  it("o alerta aparece no feedback", () => {
    expect(checkPrompt({ ...complete, contexto: "Meu e-mail é ana@exemplo.com" }).personalData).toEqual(["e-mail"]);
  });
});
