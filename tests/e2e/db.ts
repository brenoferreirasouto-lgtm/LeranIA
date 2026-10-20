import { Client } from "pg";

/**
 * Atalho só para testes de sistema: marca módulos como concluídos direto no
 * banco de teste, para chegar à avaliação final sem refazer todas as práticas
 * (o caminho completo pela interface já é coberto em learning.spec.ts).
 */
async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({
    connectionString:
      process.env.TEST_DATABASE_URL ?? "postgres://learnai:localdev@localhost:5432/learn_ai_test",
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/** Simula uma conta criada antes da regra de idade mínima (ADR 0002). */
export async function clearAgeConfirmation(email: string) {
  await withClient((client) => client.query("update users set age_confirmed_at = null where email = $1", [email]));
}

/** Quantos registros de aprendizagem existem para um e-mail (0 depois da exclusão). */
export async function countUserRows(email: string): Promise<number> {
  return withClient(async (client) => {
    const { rows } = await client.query<{ n: string }>("select count(*) as n from users where email = $1", [email]);
    return Number(rows[0]?.n ?? 0);
  });
}

export async function completeModules(email: string, slugs: string[]) {
  const client = new Client({
    connectionString:
      process.env.TEST_DATABASE_URL ?? "postgres://learnai:localdev@localhost:5432/learn_ai_test",
  });
  await client.connect();
  try {
    const { rows } = await client.query<{ id: string }>("select id from users where email = $1", [email]);
    const userId = rows[0]?.id;
    if (!userId) throw new Error(`Usuário de teste não encontrado: ${email}`);
    for (const slug of slugs) {
      await client.query(
        `insert into module_progress (user_id, module_slug, lesson_completed_at, completed_at, best_score_percent, last_activity_at)
         values ($1, $2, now(), now(), 80, now())
         on conflict (user_id, module_slug) do update set completed_at = now(), lesson_completed_at = now(), best_score_percent = 80`,
        [userId, slug],
      );
    }
  } finally {
    await client.end();
  }
}
