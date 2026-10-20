import { defineConfig, devices } from "@playwright/test";

/*
 * Testes de sistema (Terceira Entrega). Sobem a aplicação na porta 3100
 * apontando para o banco de teste, que é limpo antes de cada execução.
 *
 * - Local: `npm run test:e2e` usa `next dev`.
 * - CI: o workflow faz o build antes, e aqui roda `next start`.
 */
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://learnai:localdev@localhost:5432/learn_ai_test";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    locale: "pt-BR",
    trace: "retain-on-failure",
    video: process.env.RECORD_VIDEO ? "on" : "off",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: process.env.CI ? `npx next start -p ${PORT}` : `npx next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      BETTER_AUTH_SECRET: "segredo-somente-para-testes-automatizados-0001",
      BETTER_AUTH_URL: BASE_URL,
    },
  },
});
