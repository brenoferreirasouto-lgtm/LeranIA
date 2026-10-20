import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/*
 * Tabelas de autenticação. Os nomes das propriedades seguem o modelo do
 * Better Auth (user, session, account, verification); as colunas usam
 * snake_case no banco.
 */

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // Momento em que a pessoa aceitou os termos e a política de privacidade (LGPD).
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    // Hash da senha (scrypt). A senha em texto nunca é gravada.
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("accounts_user_id_idx").on(t.userId)],
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)],
);

/*
 * Limite de tentativas de login e cadastro. A chave guarda só um hash
 * (sha-256) do e-mail ou do IP, nunca o valor original.
 */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
});

/*
 * Núcleo educacional (Fase B). O conteúdo (questões, módulos, trilhas) mora
 * em src/content; aqui ficam só as ações de cada pessoa, referenciando os
 * ids do conteúdo.
 */

export const levelEnum = pgEnum("learning_level", ["iniciante", "intermediario", "avancado"]);
export const stepEnum = pgEnum("learning_step", ["aula", "pratica"]);

/** SP02 — cada vez que a pessoa faz o nivelamento. */
export const placementAttempts = pgTable(
  "placement_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    correct: integer("correct").notNull(),
    total: integer("total").notNull(),
    scorePercent: integer("score_percent").notNull(),
    level: levelEnum("level").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("placement_attempts_user_idx").on(t.userId, t.createdAt)],
);

export const placementAnswers = pgTable(
  "placement_answers",
  {
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => placementAttempts.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    optionId: text("option_id").notNull(),
    isCorrect: boolean("is_correct").notNull(),
  },
  (t) => [primaryKey({ columns: [t.attemptId, t.questionId] })],
);

/** SP03 — nível atual (o do nivelamento mais recente). */
export const learnerProfiles = pgTable("learner_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  level: levelEnum("level").notNull(),
  placementAttemptId: uuid("placement_attempt_id").references(() => placementAttempts.id, {
    onDelete: "set null",
  }),
  updatedAt: updatedAt(),
});

/** U03, SP05, SP09 — situação de cada módulo para cada pessoa. */
export const moduleProgress = pgTable(
  "module_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    moduleSlug: text("module_slug").notNull(),
    lessonCompletedAt: timestamp("lesson_completed_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    bestScorePercent: integer("best_score_percent"),
    lastStep: stepEnum("last_step"),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.moduleSlug] })],
);

/** SP04, SP13 — tentativas de prática; no máximo uma em aberto por módulo. */
export const practiceAttempts = pgTable(
  "practice_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    moduleSlug: text("module_slug").notNull(),
    total: integer("total").notNull(),
    correct: integer("correct"),
    scorePercent: integer("score_percent"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (t) => [
    index("practice_attempts_user_module_idx").on(t.userId, t.moduleSlug),
    uniqueIndex("practice_attempts_one_open_idx")
      .on(t.userId, t.moduleSlug)
      .where(sql`${t.finishedAt} is null`),
  ],
);

/** Uma resposta por questão em cada tentativa: responder de novo não muda a nota. */
export const practiceAnswers = pgTable(
  "practice_answers",
  {
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => practiceAttempts.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    optionId: text("option_id").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    answeredAt: timestamp("answered_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.attemptId, t.questionId] })],
);

/** SP12 — tentativas da avaliação final, respondida de uma vez. */
export const assessmentAttempts = pgTable(
  "assessment_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assessmentId: text("assessment_id").notNull(),
    correct: integer("correct").notNull(),
    total: integer("total").notNull(),
    scorePercent: integer("score_percent").notNull(),
    passed: boolean("passed").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("assessment_attempts_user_idx").on(t.userId, t.createdAt)],
);

export const assessmentAnswers = pgTable(
  "assessment_answers",
  {
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => assessmentAttempts.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    optionId: text("option_id").notNull(),
    isCorrect: boolean("is_correct").notNull(),
  },
  (t) => [primaryKey({ columns: [t.attemptId, t.questionId] })],
);

/*
 * Gamificação (Fase C1). XP e conquistas são derivados dos dados acima:
 * o servidor calcula o que a pessoa tem direito a receber e grava só o que
 * falta. As chaves únicas impedem pagar a mesma atividade duas vezes.
 */

export const xpSourceEnum = pgEnum("xp_source", [
  "nivelamento",
  "aula",
  "pratica",
  "modulo",
  "avaliacao",
  "aprovacao",
  "missao",
]);

/** Cada pagamento de XP. O total da pessoa é a soma dos pontos, nunca um contador gravado. */
export const xpEvents = pgTable(
  "xp_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    source: xpSourceEnum("source").notNull(),
    /** Slug do módulo, id da avaliação ou "nivelamento". */
    sourceId: text("source_id").notNull(),
    /** Tentativa que gerou o XP, quando houver (pode ser de tabelas diferentes, por isso sem FK). */
    attemptId: uuid("attempt_id"),
    points: integer("points").notNull(),
    /** Quando a atividade aconteceu. */
    earnedAt: timestamp("earned_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    uniqueIndex("xp_events_user_source_idx").on(t.userId, t.source, t.sourceId),
    index("xp_events_user_earned_idx").on(t.userId, t.earnedAt),
    check("xp_events_points_positive", sql`${t.points} > 0`),
  ],
);

/** Conquistas obtidas: uma por pessoa e conquista. O catálogo fica em src/content/gamification.ts. */
export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id").notNull(),
    earnedAt: timestamp("earned_at", { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.achievementId] })],
);

/*
 * Missões (Fase C2). Mesmo formato da prática: no máximo uma tentativa em
 * aberto por missão, uma resposta por passo. A missão de prompt grava só o
 * resultado; o texto escrito pela pessoa nunca é gravado.
 */
export const missionAttempts = pgTable(
  "mission_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    missionId: text("mission_id").notNull(),
    total: integer("total").notNull(),
    correct: integer("correct"),
    passed: boolean("passed"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (t) => [
    index("mission_attempts_user_mission_idx").on(t.userId, t.missionId),
    uniqueIndex("mission_attempts_one_open_idx")
      .on(t.userId, t.missionId)
      .where(sql`${t.finishedAt} is null`),
  ],
);

export const missionAnswers = pgTable(
  "mission_answers",
  {
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => missionAttempts.id, { onDelete: "cascade" }),
    stepId: text("step_id").notNull(),
    /** Alternativas marcadas (uma, ou várias nos passos de "marque todas"). */
    optionIds: text("option_ids").array().notNull(),
    isCorrect: boolean("is_correct").notNull(),
    answeredAt: timestamp("answered_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.attemptId, t.stepId] })],
);
