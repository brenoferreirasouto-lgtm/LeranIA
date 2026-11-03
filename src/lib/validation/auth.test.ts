import { describe, expect, it } from "vitest";

import {
  confirmAgeSchema,
  deleteAccountSchema,
  safeRedirectPath,
  signInSchema,
  signUpSchema,
  toFieldErrors,
} from "./auth";

const valid = {
  name: "Ana Souza",
  email: "ana@exemplo.com",
  password: "frase segura 123",
  acceptTerms: "on",
  confirmAge: "on",
};

function errorsFor(input: Record<string, unknown>) {
  const result = signUpSchema.safeParse(input);
  if (result.success) return {};
  return toFieldErrors(result.error);
}

describe("SP15 — validação do cadastro", () => {
  it("aceita um cadastro completo", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("normaliza o e-mail: remove espaços e usa minúsculas", () => {
    const result = signUpSchema.parse({ ...valid, email: "  Ana@Exemplo.COM " });
    expect(result.email).toBe("ana@exemplo.com");
  });

  it("remove espaços nas pontas do nome", () => {
    expect(signUpSchema.parse({ ...valid, name: "  Ana  " }).name).toBe("Ana");
  });

  it("exige todos os campos obrigatórios", () => {
    const errors = errorsFor({});
    expect(Object.keys(errors).sort()).toEqual(["acceptTerms", "confirmAge", "email", "name", "password"]);
  });

  it("explica cada campo vazio em português", () => {
    const errors = errorsFor({ name: "", email: "", password: "", acceptTerms: "on", confirmAge: "on" });
    expect(errors.name).toBe("Informe seu nome.");
    expect(errors.email).toBe("Informe seu e-mail.");
    expect(errors.password).toBe("Crie uma senha.");
  });

  it("recusa nome com uma letra só", () => {
    expect(errorsFor({ ...valid, name: "A" }).name).toMatch(/pelo menos 2/);
  });

  it("recusa e-mail sem formato válido", () => {
    expect(errorsFor({ ...valid, email: "ana.exemplo.com" }).email).toMatch(/e-mail válido/);
  });

  it("recusa senha com menos de 8 caracteres", () => {
    expect(errorsFor({ ...valid, password: "1234567" }).password).toMatch(/pelo menos 8/);
  });

  it("recusa senha com mais de 128 caracteres", () => {
    expect(errorsFor({ ...valid, password: "a".repeat(129) }).password).toMatch(/no máximo 128/);
  });

  it("recusa senha feita só de espaços", () => {
    expect(errorsFor({ ...valid, password: "          " }).password).toMatch(/só espaços/);
  });

  it("exige o aceite dos termos", () => {
    const withoutTerms: Partial<typeof valid> = { ...valid };
    delete withoutTerms.acceptTerms;
    expect(errorsFor(withoutTerms).acceptTerms).toMatch(/aceite os termos/);
  });

  it("exige a declaração de idade mínima (13 anos)", () => {
    const withoutAge: Partial<typeof valid> = { ...valid };
    delete withoutAge.confirmAge;
    expect(errorsFor(withoutAge).confirmAge).toBe(
      "O Learn AI é para quem tem 13 anos ou mais. Confirme a sua idade para continuar.",
    );
  });

  it("devolve só a primeira mensagem de cada campo", () => {
    const errors = errorsFor({ ...valid, name: "" });
    expect(errors.name).toBe("Informe seu nome.");
  });
});

describe("U02 — validação do login", () => {
  it("aceita e-mail e senha preenchidos", () => {
    expect(signInSchema.safeParse({ email: "ana@exemplo.com", password: "x" }).success).toBe(true);
  });

  it("exige a senha", () => {
    const result = signInSchema.safeParse({ email: "ana@exemplo.com", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error).password).toBe("Informe sua senha.");
  });
});

describe("destino depois do login", () => {
  it("aceita caminhos internos", () => {
    expect(safeRedirectPath("/painel")).toBe("/painel");
    expect(safeRedirectPath("/trilha/modulo-1?aba=2")).toBe("/trilha/modulo-1?aba=2");
  });

  it("recusa endereços externos e volta para o painel", () => {
    expect(safeRedirectPath("https://site-malicioso.com")).toBe("/painel");
    expect(safeRedirectPath("//site-malicioso.com")).toBe("/painel");
    expect(safeRedirectPath("/\\site-malicioso.com")).toBe("/painel");
  });

  it("recusa caracteres que o navegador remove ao ler a URL", () => {
    // "/<TAB>/site.com" e "/<quebra de linha>/site.com" viram "//site.com" no navegador.
    for (const sneaky of ["/\t/site-malicioso.com", "/\n/site-malicioso.com", "/\r/site-malicioso.com", "/a\\b"]) {
      expect(safeRedirectPath(sneaky), JSON.stringify(sneaky)).toBe("/painel");
    }
    expect(safeRedirectPath("/" + "a".repeat(3000))).toBe("/painel");
  });

  it("mantém caminhos internos com caracteres codificados", () => {
    expect(safeRedirectPath("/trilha?busca=a%2Fb#topo")).toBe("/trilha?busca=a%2Fb#topo");
    expect(safeRedirectPath("/%2F%2Fsite.com")).toBe("/%2F%2Fsite.com");
  });

  it("usa o painel quando não há destino", () => {
    expect(safeRedirectPath(undefined)).toBe("/painel");
    expect(safeRedirectPath("")).toBe("/painel");
  });
});

describe("ADR 0002 — idade e exclusão da conta", () => {
  it("contas antigas confirmam a idade com a mesma declaração", () => {
    expect(confirmAgeSchema.safeParse({ confirmAge: "on" }).success).toBe(true);
    expect(confirmAgeSchema.safeParse({}).success).toBe(false);
  });

  it("excluir a conta exige a senha e a ciência de que é permanente", () => {
    expect(deleteAccountSchema.safeParse({ password: "x", confirmDelete: "on" }).success).toBe(true);
    const result = deleteAccountSchema.safeParse({ password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toFieldErrors(result.error)).toEqual({
        password: "Informe sua senha.",
        confirmDelete: "Marque que você entende que a exclusão é permanente.",
      });
    }
  });
});
