import { describe, expect, it } from "vitest";

import { formatDate } from "./format";

describe("formatDate", () => {
  it("usa o horário de Brasília, não o do servidor", () => {
    // 01h20 UTC de 20/10 ainda é 19/10 em Brasília.
    expect(formatDate(new Date("2026-10-20T01:20:00Z"))).toBe("19/10/2026");
  });
});
