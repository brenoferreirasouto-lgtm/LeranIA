import { defineConfig } from "drizzle-kit";

// Carrega o .env quando existe (no CI as variáveis já vêm do ambiente).
try {
  process.loadEnvFile(".env");
} catch {}

if (!process.env.DATABASE_URL) {
  throw new Error("Defina DATABASE_URL (veja .env.example).");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
  strict: true,
});
