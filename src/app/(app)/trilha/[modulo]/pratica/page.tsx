import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecordVisit } from "@/components/learning/record-visit";
import { PRACTICE_PASS_PERCENT } from "@/content";
import { requireUser } from "@/lib/session";
import { getModuleOrNull, toPublicQuestion } from "@/server/content";
import { getLastFinishedPractice, getOpenPractice, getProgress } from "@/server/learning";

import { startPracticeAction } from "../../../learning-actions";
import styles from "../modulo.module.css";
import { PracticeRunner } from "./practice-runner";

type Params = { params: Promise<{ modulo: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { modulo } = await params;
  const learningModule = getModuleOrNull(modulo);
  return { title: learningModule ? `Prática: ${learningModule.title}` : "Prática" };
}

/** Prática do módulo com feedback por questão (SP04, SP13, U07). */
export default async function PracticePage({ params }: Params) {
  const { modulo } = await params;
  const learningModule = getModuleOrNull(modulo);
  if (!learningModule) notFound();

  const user = await requireUser(`/trilha/${learningModule.slug}/pratica`);
  const [open, last, progress] = await Promise.all([
    getOpenPractice(user.id, learningModule.slug),
    getLastFinishedPractice(user.id, learningModule.slug),
    getProgress(user.id),
  ]);
  const moduleProgress = progress.find((p) => p.moduleSlug === learningModule.slug);
  const finished = last?.finishedAt ? last : null;

  return (
    <article className={styles.page}>
      <RecordVisit slug={learningModule.slug} step="pratica" />
      <nav aria-label="Você está em" className={styles.breadcrumb}>
        <Link href="/trilha">Trilha</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/trilha/${learningModule.slug}`}>{learningModule.title}</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Prática</span>
      </nav>

      <header className={styles.header}>
        <p className="eyebrow-text">Prática · {learningModule.practice.length} perguntas</p>
        <h1 className={styles.title}>{learningModule.title}</h1>
        <p className={styles.lead}>
          Depois de cada resposta você vê se acertou e por quê. Para concluir o módulo, acerte pelo
          menos {PRACTICE_PASS_PERCENT}% e conclua a aula.
        </p>
      </header>

      {open ? (
        <PracticeRunner
          slug={learningModule.slug}
          attemptId={open.attemptId}
          questions={learningModule.practice.map(toPublicQuestion)}
          answered={open.answered}
          lessonCompleted={Boolean(moduleProgress?.lessonCompletedAt)}
          passPercent={PRACTICE_PASS_PERCENT}
        />
      ) : (
        <section className={styles.practiceIntro} aria-label="Começar a prática">
          {finished ? (
            <p className={styles.lastResult}>
              Última tentativa: {finished.correct} de {finished.total} ({finished.scorePercent}%)
              {moduleProgress?.completedAt ? " · módulo concluído" : ""}
            </p>
          ) : null}
          {!moduleProgress?.lessonCompletedAt ? (
            <p>
              Recomendamos ler a <Link href={`/trilha/${learningModule.slug}`}>aula</Link> antes de
              praticar.
            </p>
          ) : null}
          <form action={startPracticeAction.bind(null, learningModule.slug)}>
            <button type="submit" className="btn btn-primary">
              {finished ? "Praticar de novo" : "Começar a prática"}
            </button>
          </form>
        </section>
      )}
    </article>
  );
}
