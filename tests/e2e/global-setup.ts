import { Client } from "pg";

/** Começa cada execução com o banco de teste vazio (só dados, as tabelas ficam). */
export default async function globalSetup() {
  const connectionString =
    process.env.TEST_DATABASE_URL ?? "postgres://learnai:localdev@localhost:5432/learn_ai_test";

  if (!/test/.test(new URL(connectionString).pathname)) {
    throw new Error(`Recusado: ${connectionString} não parece um banco de teste.`);
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(
      "truncate table sessions, accounts, verifications, rate_limits, users restart identity cascade",
    );
  } finally {
    await client.end();
  }
}
