import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";

export { clientIp, hashKey } from "./request-keys";

export type RateLimitRule = {
  /** Quantas tentativas cabem na janela. */
  limit: number;
  /** Duração da janela, em segundos. */
  windowSeconds: number;
};

export const RULES = {
  signInByEmail: { limit: 10, windowSeconds: 15 * 60 },
  signInByIp: { limit: 30, windowSeconds: 15 * 60 },
  signUpByIp: { limit: 10, windowSeconds: 60 * 60 },
} satisfies Record<string, RateLimitRule>;

/**
 * Registra uma tentativa e informa se ela está dentro do limite.
 * Um único UPSERT atômico, então requisições simultâneas não escapam da contagem.
 * Quando a janela expira, a contagem recomeça do 1.
 */
export async function consume(key: string, rule: RateLimitRule): Promise<boolean> {
  const seconds = Math.max(1, Math.floor(rule.windowSeconds));
  const result = await db.execute<{ count: number }>(sql`
    insert into rate_limits (key, count, window_start)
    values (${key}, 1, now())
    on conflict (key) do update set
      count = case
        when rate_limits.window_start < now() - make_interval(secs => ${seconds}) then 1
        else rate_limits.count + 1
      end,
      window_start = case
        when rate_limits.window_start < now() - make_interval(secs => ${seconds}) then now()
        else rate_limits.window_start
      end
    returning count
  `);
  const count = Number(result.rows[0]?.count ?? 0);
  return count <= rule.limit;
}
