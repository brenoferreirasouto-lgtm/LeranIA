import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db";
import { accounts, sessions, users, verifications } from "@/db/schema";
import { getEnv } from "@/lib/env";

const env = getEnv();

/*
 * Autenticação por e-mail e senha (SP15 cadastro, U02 login).
 *
 * Não há rota /api/auth montada: cadastro, login e saída passam pelas
 * Server Actions de src/app/(auth)/actions.ts, que validam os campos,
 * exigem o aceite dos termos e aplicam limite de tentativas antes de
 * chamar o Better Auth. Assim existe um único caminho para criar conta.
 */
export const auth = betterAuth({
  appName: "Learn AI",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // renova a validade uma vez por dia de uso
  },
  user: {
    additionalFields: {
      termsAcceptedAt: { type: "date", required: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // O único caminho de cadastro (signUpAction) só chega aqui depois de
        // confirmar o aceite dos termos, então o registro do aceite é feito
        // no mesmo INSERT que cria a conta.
        before: async (user) => ({
          data: { ...user, termsAcceptedAt: new Date() },
        }),
      },
    },
  },
  telemetry: { enabled: false },
  // nextCookies precisa ser o último plugin: grava o cookie de sessão
  // quando o Better Auth é chamado de dentro de uma Server Action.
  plugins: [nextCookies()],
});
