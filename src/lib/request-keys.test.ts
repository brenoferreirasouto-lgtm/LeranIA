import { describe, expect, it } from "vitest";

import { clientIp, hashKey } from "./request-keys";

describe("chaves de limite de tentativas", () => {
  it("não guardam o valor original", () => {
    const key = hashKey("signin:email", "ana@exemplo.com");
    expect(key).toMatch(/^signin:email:[0-9a-f]{64}$/);
    expect(key).not.toContain("ana");
  });

  it("são iguais para o mesmo valor e diferentes entre escopos", () => {
    expect(hashKey("a", "x")).toBe(hashKey("a", "x"));
    expect(hashKey("a", "x")).not.toBe(hashKey("b", "x"));
  });
});

describe("IP do cliente", () => {
  it("usa o primeiro endereço de x-forwarded-for", () => {
    expect(clientIp("203.0.113.7, 10.0.0.1", null)).toBe("203.0.113.7");
  });

  it("recorre a x-real-ip e, sem nenhum, a um valor fixo", () => {
    expect(clientIp(null, "198.51.100.2")).toBe("198.51.100.2");
    expect(clientIp(null, null)).toBe("desconhecido");
  });
});
