import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getEnv } from "@/lib/env";
import * as schema from "./schema";

// Em desenvolvimento o Next recarrega módulos; reaproveitar o pool evita
// abrir conexões novas a cada alteração de arquivo.
const globalForDb = globalThis as unknown as { learnAiPool?: Pool };

const pool =
  globalForDb.learnAiPool ??
  new Pool({ connectionString: getEnv().DATABASE_URL, max: 10 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.learnAiPool = pool;
}

export const db = drizzle(pool, { schema });
export type Database = typeof db;
