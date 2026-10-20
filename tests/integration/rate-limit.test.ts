import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { consume } from "@/lib/rate-limit";

// Usa o banco de teste (ver vitest.config.ts). Cada teste usa uma chave própria.
const created: string[] = [];
const newKey = () => {
  const key = `teste:${randomUUID()}`;
  created.push(key);
  return key;
};

afterAll(async () => {
  for (const key of created) {
    await db.execute(sql`delete from rate_limits where key = ${key}`);
  }
});

describe("limite de tentativas (banco real)", () => {
  it("permite até o limite e bloqueia a tentativa seguinte", async () => {
    const key = newKey();
    const rule = { limit: 3, windowSeconds: 60 };
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await consume(key, rule));
    expect(results).toEqual([true, true, true, false]);
  });

  it("recomeça a contagem quando a janela expira", async () => {
    const key = newKey();
    const rule = { limit: 1, windowSeconds: 60 };
    expect(await consume(key, rule)).toBe(true);
    expect(await consume(key, rule)).toBe(false);

    await db.execute(
      sql`update rate_limits set window_start = now() - interval '2 minutes' where key = ${key}`,
    );
    expect(await consume(key, rule)).toBe(true);
  });

  it("conta corretamente tentativas simultâneas", async () => {
    const key = newKey();
    const rule = { limit: 5, windowSeconds: 60 };
    const results = await Promise.all(Array.from({ length: 8 }, () => consume(key, rule)));
    expect(results.filter(Boolean)).toHaveLength(5);
  });
});
