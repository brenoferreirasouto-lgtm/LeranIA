import { describe, expect, it } from "vitest";

import { formatDate, formatDateTime, listPt } from "./format";

describe("formatDate", () => {
  it("usa o horário de Brasília, não o do servidor", () => {
    // 01h20 UTC de 20/10 ainda é 19/10 em Brasília.
    expect(formatDate(new Date("2026-10-20T01:20:00Z"))).toBe("19/10/2026");
  });
});

describe("formatDateTime", () => {
  it("mostra data e hora de Brasília", () => {
    expect(formatDateTime(new Date("2026-10-20T01:20:00Z"))).toBe("19/10/2026, 22:20");
  });
});

describe("listPt", () => {
  it("junta os itens como numa frase", () => {
    expect(listPt([])).toBe("");
    expect(listPt(["e-mail"])).toBe("e-mail");
    expect(listPt(["e-mail", "CPF"])).toBe("e-mail e CPF");
    expect(listPt(["e-mail", "CPF", "telefone"])).toBe("e-mail, CPF e telefone");
  });
});
