import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": fromRoot("./src"),
      // Fora do Next, "server-only" não existe; nos testes ele vira um módulo vazio.
      "server-only": fromRoot("./tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/integration/**/*.test.ts"],
    // Testes de integração usam o banco de teste, nunca o de desenvolvimento.
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        "postgres://learnai:localdev@localhost:5432/learn_ai_test",
      BETTER_AUTH_SECRET: "segredo-somente-para-testes-automatizados-0001",
      BETTER_AUTH_URL: "http://localhost:3100",
    },
  },
});
