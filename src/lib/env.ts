import * as z from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string({ error: "Defina DATABASE_URL (veja .env.example)." })
    .startsWith("postgres", { error: "DATABASE_URL deve ser uma URL postgres://" }),
  BETTER_AUTH_SECRET: z
    .string({ error: "Defina BETTER_AUTH_SECRET (veja .env.example)." })
    .min(32, { error: "BETTER_AUTH_SECRET precisa ter pelo menos 32 caracteres." }),
  BETTER_AUTH_URL: z.url({ error: "BETTER_AUTH_URL deve ser uma URL completa." }),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Lê e valida as variáveis de ambiente uma única vez, na primeira chamada. */
export function getEnv(): Env {
  if (!cached) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `- ${i.message}`).join("\n");
      throw new Error(`Configuração inválida:\n${issues}`);
    }
    cached = parsed.data;
  }
  return cached;
}
