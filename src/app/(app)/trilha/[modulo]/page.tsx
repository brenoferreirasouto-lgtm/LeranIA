import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonContent } from "@/components/learning/lesson-content";
import { RecordVisit } from "@/components/learning/record-visit";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { getModuleOrNull } from "@/server/content";
import { getProgress } from "@/server/learning";

import { completeLessonAction } from "../../learning-actions";
import styles from "./modulo.module.css";

type Params = { params: Promise<{ modulo: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { modulo } = await params;
  return { title: getModuleOrNull(modulo)?.title ?? "Módulo" };
}

/** Aula do módulo (SP01, SP04, U07, U08). */
export default async function LessonPage({ params }: Params) {
  const { modulo } = await params;
  const learningModule = getModuleOrNull(modulo);
  if (!learningModule) notFound();

  const user = await requireUser(`/trilha/${learningModule.slug}`);
  const progress = (await getProgress(user.id)).find((p) => p.moduleSlug === learningModule.slug);
  const lessonDone = progress?.lessonCompletedAt;

  return (
    <article className={styles.page}>
      <RecordVisit slug={learningModule.slug} step="aula" />
      <nav aria-label="Você está em" className={styles.breadcrumb}>
        <Link href="/trilha">Trilha</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{learningModule.title}</span>
      </nav>

      <header className={styles.header}>
        <p className="eyebrow-text">Aula · ~{learningModule.estimatedMinutes} min</p>
        <h1 className={styles.title}>{learningModule.title}</h1>
        <p className={styles.lead}>{learningModule.summary}</p>
      </header>

      <LessonContent sections={learningModule.lesson} />

      {learningModule.relatedTool ? (
        <aside className={styles.tool} aria-label="Ferramenta relacionada">
          <p className={styles.toolText}>{learningModule.relatedTool.description}</p>
          <Link href={learningModule.relatedTool.href} className="btn btn-secondary">
            {learningModule.relatedTool.label}
          </Link>
        </aside>
      ) : null}

      <footer className={styles.footer}>
        {lessonDone ? (
          <>
            <p className={styles.doneText} role="status">
              Aula concluída em {formatDate(lessonDone)}.
            </p>
            <Link href={`/trilha/${learningModule.slug}/pratica`} className="btn btn-primary">
              Ir para a prática
            </Link>
          </>
        ) : (
          <>
            <p className={styles.footerText}>
              Terminou a leitura? A prática tem {learningModule.practice.length} perguntas com
              explicação depois de cada resposta.
            </p>
            <form action={completeLessonAction.bind(null, learningModule.slug)}>
              <button type="submit" className="btn btn-primary">
                Concluir aula e ir para a prática
              </button>
            </form>
          </>
        )}
      </footer>
    </article>
  );
}
