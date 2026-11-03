import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // O gabarito das questões mora em src/content. Fora dele, o acesso passa
    // pelo índice "@/content", que é server-only e não chega ao navegador.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/content/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "zod",
              message: "Importe { z } de \"@/lib/zod\": ele liga o modo sem eval exigido pela CSP.",
            },
          ],
          patterns: [
            {
              group: ["@/content/*", "**/content/modules/*", "**/content/placement"],
              message:
                "Importe de \"@/content\" (server-only) ou use src/server/content.ts, que entrega o conteúdo sem gabarito.",
            },
          ],
        },
      ],
    },
  },
  {
    // O único arquivo que importa o zod diretamente.
    files: ["src/lib/zod.ts"],
    rules: { "no-restricted-imports": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Relatórios gerados pelos testes
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
