import "server-only";

import { asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { loadProjects } from "@/server/project-snapshots";
import {
  assessmentAnswers,
  assessmentAttempts,
  learnerProfiles,
  missionAnswers,
  missionAttempts,
  moduleProgress,
  placementAnswers,
  placementAttempts,
  practiceAnswers,
  practiceAttempts,
  projectEvents,
  sessions,
  userAchievements,
  users,
  xpEvents,
} from "@/db/schema";

/*
 * Conta e direitos da pessoa (LGPD, art. 18; ADR 0002). Toda função recebe o
 * id da pessoa logada e só lê ou altera dados dela.
 */

/** Cópia do registro sem os campos indicados (ids internos que não interessam na exportação). */
function without<T extends object, K extends keyof T>(row: T, ...keys: K[]): Omit<T, K> {
  const copy = { ...row };
  for (const key of keys) delete copy[key];
  return copy;
}

/** Registra a declaração de idade mínima de uma conta criada antes dessa regra. */
export async function confirmAge(userId: string): Promise<void> {
  await db.update(users).set({ ageConfirmedAt: new Date() }).where(eq(users.id, userId));
}

export async function getAccount(userId: string) {
  const [user] = await db
    .select({
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      termsAcceptedAt: users.termsAcceptedAt,
      ageConfirmedAt: users.ageConfirmedAt,
    })
    .from(users)
    .where(eq(users.id, userId));
  return user ?? null;
}

/**
 * Tudo o que o Learn AI guarda sobre a pessoa, num formato legível
 * (acesso e portabilidade). Ficam de fora só segredos de segurança: o hash
 * da senha e os tokens de sessão.
 */
export async function exportUserData(userId: string) {
  const account = await getAccount(userId);
  if (!account) return null;

  const [profile] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, userId));

  const placements = await db
    .select()
    .from(placementAttempts)
    .where(eq(placementAttempts.userId, userId))
    .orderBy(asc(placementAttempts.createdAt));
  const placementRows = placements.length
    ? await db
        .select()
        .from(placementAnswers)
        .where(inArray(placementAnswers.attemptId, placements.map((p) => p.id)))
    : [];

  const progress = await db.select().from(moduleProgress).where(eq(moduleProgress.userId, userId));

  const practices = await db
    .select()
    .from(practiceAttempts)
    .where(eq(practiceAttempts.userId, userId))
    .orderBy(asc(practiceAttempts.startedAt));
  const practiceRows = practices.length
    ? await db
        .select()
        .from(practiceAnswers)
        .where(inArray(practiceAnswers.attemptId, practices.map((p) => p.id)))
    : [];

  const assessments = await db
    .select()
    .from(assessmentAttempts)
    .where(eq(assessmentAttempts.userId, userId))
    .orderBy(asc(assessmentAttempts.createdAt));
  const assessmentRows = assessments.length
    ? await db
        .select()
        .from(assessmentAnswers)
        .where(inArray(assessmentAnswers.attemptId, assessments.map((a) => a.id)))
    : [];

  const missions = await db
    .select()
    .from(missionAttempts)
    .where(eq(missionAttempts.userId, userId))
    .orderBy(asc(missionAttempts.startedAt));
  const missionRows = missions.length
    ? await db
        .select()
        .from(missionAnswers)
        .where(inArray(missionAnswers.attemptId, missions.map((m) => m.id)))
    : [];

  const xp = await db.select().from(xpEvents).where(eq(xpEvents.userId, userId)).orderBy(asc(xpEvents.earnedAt));
  const achievements = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  const labProjects = await loadProjects(db, { userId });
  const labEvents = labProjects.length
    ? await db
        .select()
        .from(projectEvents)
        .where(inArray(projectEvents.projectId, labProjects.map((p) => p.id)))
        .orderBy(asc(projectEvents.createdAt))
    : [];
  const userSessions = await db
    .select({
      createdAt: sessions.createdAt,
      expiresAt: sessions.expiresAt,
      ipAddress: sessions.ipAddress,
      userAgent: sessions.userAgent,
    })
    .from(sessions)
    .where(eq(sessions.userId, userId));

  const answersOf = <T extends { attemptId: string }>(rows: T[], attemptId: string) =>
    rows.filter((r) => r.attemptId === attemptId).map((r) => without(r, "attemptId"));

  return {
    geradoEm: new Date().toISOString(),
    sobre:
      "Dados que o Learn AI guarda sobre você. Ficam de fora só o código da sua senha (hash) e os códigos das sessões, por segurança.",
    conta: account,
    nivelAtual: profile?.level ?? null,
    nivelamentos: placements.map((p) => ({ ...without(p, "userId"), respostas: answersOf(placementRows, p.id) })),
    progressoNosModulos: progress.map((p) => without(p, "userId")),
    praticas: practices.map((p) => ({ ...without(p, "userId"), respostas: answersOf(practiceRows, p.id) })),
    avaliacoes: assessments.map((a) => ({ ...without(a, "userId"), respostas: answersOf(assessmentRows, a.id) })),
    missoes: missions.map((m) => ({ ...without(m, "userId"), respostas: answersOf(missionRows, m.id) })),
    xp: xp.map((x) => without(x, "userId")),
    conquistas: achievements.map((a) => without(a, "userId")),
    projetos: labProjects.map((p) => ({
      ...without(p, "userId"),
      historico: labEvents.filter((e) => e.projectId === p.id).map((e) => without(e, "projectId")),
    })),
    sessoes: userSessions,
  };
}

export type UserDataExport = NonNullable<Awaited<ReturnType<typeof exportUserData>>>;
