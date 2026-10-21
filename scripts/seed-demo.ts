/*
 * Conta de demonstração para apresentar o Learn AI (Fase F).
 *
 *   npm run db:seed-demo             cria a conta (recusa se já existir)
 *   npm run db:seed-demo -- --reset  apaga a conta de demonstração e cria de novo
 *
 * Usa as mesmas funções do servidor que as telas usam, então XP, conquistas,
 * progresso e histórico saem exatamente como sairiam pela interface.
 * Só roda em banco local (localhost); para outro banco, --allow-remote.
 *
 * A senha vem de DEMO_PASSWORD ou é gerada e mostrada uma única vez.
 */
import { randomBytes } from "node:crypto";

try {
  process.loadEnvFile(".env");
} catch {}

const args = new Set(process.argv.slice(2));
const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@learnai.example";
const DEMO_NAME = "Lia Demonstração";

function assertLocalDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Defina DATABASE_URL (veja .env.example).");
  const host = new URL(url).hostname;
  const local = ["localhost", "127.0.0.1", "::1", "[::1]", "db"].includes(host);
  if (!local && !args.has("--allow-remote")) {
    throw new Error(
      `O banco em "${host}" não é local. A conta de demonstração é para apresentação; use --allow-remote se tiver certeza.`,
    );
  }
  if (process.env.NODE_ENV === "production" && !args.has("--allow-remote")) {
    throw new Error("NODE_ENV=production: não crio conta de demonstração em produção.");
  }
}

async function main() {
  assertLocalDatabase();

  // Importados depois da conferência: carregar o banco já abre a conexão.
  const { eq } = await import("drizzle-orm");
  const { findMission, modules, placementQuestions } = await import("@/content");
  const { db } = await import("@/db");
  const { users } = await import("@/db/schema");
  const { auth } = await import("@/lib/auth");
  const { answerPractice, completeLesson, recordVisit, savePlacement, startPractice } = await import(
    "@/server/learning"
  );
  const { answerMissionStep, startMission } = await import("@/server/missions");
  const {
    addReference,
    addTask,
    createProject,
    getProject,
    toggleReferenceVerified,
    toggleTask,
    updateAbout,
  } = await import("@/server/projects");
  const { getJourney, getTotalXp } = await import("@/server/rewards");

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, DEMO_EMAIL));
  if (existing && !args.has("--reset")) {
    console.log(`A conta ${DEMO_EMAIL} já existe. Para recriar do zero: npm run db:seed-demo -- --reset`);
    return;
  }
  if (existing) {
    await db.delete(users).where(eq(users.id, existing.id)); // apaga tudo em cascata
    console.log("Conta de demonstração anterior apagada.");
  }

  const password = process.env.DEMO_PASSWORD ?? randomBytes(9).toString("base64url");
  const created = await auth.api.signUpEmail({ body: { name: DEMO_NAME, email: DEMO_EMAIL, password } });
  const userId = created.user.id;

  // 1. Nivelamento com 6 de 10 acertos: Trilha Intermediária.
  const answers: Record<string, string> = {};
  for (const [i, q] of placementQuestions.entries()) {
    const wrong = q.options.find((o) => o.id !== q.correctOptionId)!;
    answers[q.id] = i < 6 ? q.correctOptionId : wrong.id;
  }
  const placement = await savePlacement(userId, answers);

  // 2. Módulos concluídos: um deles com 4 de 5 na prática.
  async function doModule(slug: string, correctCount: number) {
    const mod = modules.find((m) => m.slug === slug)!;
    await recordVisit(userId, slug, "aula");
    await completeLesson(userId, slug);
    const practice = await startPractice(userId, slug);
    for (const [i, q] of mod.practice.entries()) {
      const wrong = q.options.find((o) => o.id !== q.correctOptionId)!;
      await answerPractice(userId, slug, practice.attemptId, q.id, i < correctCount ? q.correctOptionId : wrong.id);
    }
  }
  await doModule("alucinacoes", 5);
  await doModule("verificar-informacoes", 4);

  // 3. O módulo de prompts concluído (libera a missão do construtor) e a aula
  //    de comparação aberta: o painel sugere continuar por ela.
  await doModule("estrutura-de-um-bom-prompt", 5);
  await recordVisit(userId, "comparacao-de-prompts", "aula");

  // 4. Uma missão concluída, o que libera o Laboratório.
  const mission = findMission("caca-as-alucinacoes");
  if (!mission || mission.kind !== "steps") throw new Error("Missão caca-as-alucinacoes não encontrada.");
  const { attemptId } = await startMission(userId, mission.id);
  for (const step of mission.steps) {
    await answerMissionStep(userId, mission.id, attemptId, step.id, step.correctOptionIds);
  }

  // 5. Um projeto pela metade no Laboratório, para mostrar a lista de conferência.
  const projectId = await createProject(userId, { templateId: "seminario", title: "Seminário: IA generativa na escola" });
  await updateAbout(userId, projectId, {
    title: "Seminário: IA generativa na escola",
    goal: "Apresentar em 10 minutos como usar IA generativa nos estudos sem copiar respostas e conferindo as fontes.",
    audience: "Turma do 2º ano do ensino médio",
    problem: "Muitos colegas usam IA para fazer trabalhos sem conferir se as informações estão certas.",
  });
  const project = await getProject(userId, projectId);
  for (const task of project!.stages[0].tasks) await toggleTask(userId, projectId, task.id);
  await addTask(userId, projectId, project!.stages[1].id, "Separar dois exemplos de alucinação para mostrar");
  await addReference(userId, projectId, {
    title: "Lei Geral de Proteção de Dados (Lei nº 13.709/2018)",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm",
    note: "Art. 5º, definição de dado pessoal.",
  });
  const withRef = await getProject(userId, projectId);
  await toggleReferenceVerified(userId, projectId, withRef!.references[0].id);

  const [journey, totalXp] = await Promise.all([getJourney(userId), getTotalXp(userId)]);
  console.log("\nConta de demonstração pronta.");
  console.log(`  E-mail: ${DEMO_EMAIL}`);
  console.log(
    process.env.DEMO_PASSWORD ? "  Senha: a de DEMO_PASSWORD" : `  Senha: ${password}   (anote: ela não é mostrada de novo)`,
  );
  const LEVEL_NAME = { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" } as const;
  console.log(`  Nível: ${LEVEL_NAME[placement.level]} · ${totalXp} XP · ${journey.earnedCount} conquistas`);
  console.log("  Roteiro da apresentação: docs/roteiro-demonstracao.md\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
