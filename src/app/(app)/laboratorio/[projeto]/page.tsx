import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "@/lib/zod";

import { AchievementMedal } from "@/components/journey/achievement-medal";
import { AboutForm } from "@/components/lab/about-form";
import { AddReferenceForm, AddTaskForm, AiLogForm, DeleteProjectForm } from "@/components/lab/item-forms";
import styles from "@/components/lab/lab.module.css";
import { RemoveButton, ToggleCheck } from "@/components/lab/quick-controls";
import { formatDate, formatDateTime } from "@/lib/format";
import { authoredAt, projectChecklist, projectEventLabel, stageDone } from "@/lib/projects";
import { requireUser } from "@/lib/session";
import { getProject } from "@/server/projects";

import {
  addAiLogAction,
  addReferenceAction,
  addTaskAction,
  deleteProjectAction,
  removeAiLogAction,
  removeReferenceAction,
  removeTaskAction,
  setNoAiAction,
  toggleReferenceAction,
  toggleTaskAction,
  updateAboutAction,
} from "../actions";

export const metadata: Metadata = { title: "Projeto do Laboratório" };

type Props = { params: Promise<{ projeto: string }> };

export default async function ProjectPage({ params }: Props) {
  const { projeto } = await params;
  const user = await requireUser(`/laboratorio/${projeto}`);
  if (!z.uuid().safeParse(projeto).success) notFound();
  const project = await getProject(user.id, projeto);
  if (!project) notFound();

  const id = project.id;
  const checklist = projectChecklist(project);
  const okCount = checklist.filter((c) => c.ok).length;
  const doneStages = project.stages.filter(stageDone).length;
  const authored = authoredAt(project);
  const hasAiLogs = project.aiLogs.length > 0;

  return (
    <div className={styles.projectPage}>
      <p className={styles.breadcrumb}>
        <Link href="/laboratorio">Laboratório</Link> <span aria-hidden="true">/</span> {project.title}
      </p>

      <header className={styles.header}>
        <p className="eyebrow-text">
          {project.templateTitle} · {doneStages} de {project.stages.length} etapas
        </p>
        <h1 className={styles.title}>{project.title}</h1>
        <p className={styles.meta}>
          <span>Criado em {formatDate(project.createdAt)}</span>
          <span>Atualizado em {formatDate(project.updatedAt)}</span>
          <span>Privado: só você vê</span>
        </p>
      </header>

      {authored ? (
        <section aria-labelledby="autoral" className={styles.authored}>
          <AchievementMedal earned />
          <div>
            <h2 id="autoral" className={styles.authoredTitle}>
              Projeto autoral
            </h2>
            <p>
              Todas as etapas concluídas, com referência conferida e uso de IA registrado, em{" "}
              {formatDate(authored)}. A conquista está na <Link href="/jornada">sua jornada</Link>.
            </p>
          </div>
        </section>
      ) : null}

      <div className={styles.layout}>
        <section aria-labelledby="conferencia" className={`${styles.card} ${styles.checklistCard}`}>
          <h2 id="conferencia" className={styles.cardTitle}>
            Lista de conferência
          </h2>
          <p className={styles.cardText}>
            {okCount} de {checklist.length} itens em dia. Regras fixas, sem IA.
          </p>
          <ul className={styles.checklist}>
            {checklist.map((item) => (
              <li key={item.id} className={styles.checkItem} data-ok={item.ok}>
                <span className={styles.checkMark} aria-hidden="true">
                  {item.ok ? "✓" : "!"}
                </span>
                <span>
                  <span className={styles.checkLabel}>
                    {item.label}
                    <span className="visually-hidden">{item.ok ? ": em dia" : ": falta"}</span>
                  </span>
                  {item.ok ? null : <span className={styles.checkTip}>{item.tip}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.main}>
          <section aria-labelledby="sobre" className={styles.card}>
            <h2 id="sobre" className={styles.cardTitle}>
              Sobre o projeto
            </h2>
            <AboutForm
              initial={{
                title: project.title,
                goal: project.goal,
                audience: project.audience,
                problem: project.problem,
              }}
              action={updateAboutAction.bind(null, id)}
            />
          </section>

          <section aria-labelledby="etapas" className={styles.section}>
            <h2 id="etapas" className={styles.sectionTitle}>
              Etapas
            </h2>
            <p className={styles.cardText}>
              Marque as tarefas conforme for fazendo. Uma etapa fica concluída quando todas as tarefas dela estão
              marcadas.
            </p>
            <ol className={styles.stages}>
              {project.stages.map((stage, index) => {
                const done = stageDone(stage);
                const finished = stage.tasks.filter((t) => t.doneAt).length;
                return (
                  <li key={stage.id} className={styles.stage} data-done={done}>
                    <span className={styles.stageNumber} aria-hidden="true">
                      {done ? "✓" : index + 1}
                    </span>
                    <div className={styles.stageBody}>
                      <div className={styles.stageHead}>
                        <h3 className={styles.stageTitle}>
                          <span className="visually-hidden">Etapa {index + 1}: </span>
                          {stage.title}
                        </h3>
                        <span className={styles.stageCount}>
                          {done ? "Concluída" : `${finished} de ${stage.tasks.length} tarefas`}
                        </span>
                      </div>
                      {stage.tasks.length > 0 ? (
                        <ul className={styles.tasks}>
                          {stage.tasks.map((task) => (
                            <li key={task.id} className={styles.row}>
                              <ToggleCheck checked={Boolean(task.doneAt)} action={toggleTaskAction.bind(null, id, task.id)}>
                                {task.text}
                              </ToggleCheck>
                              <RemoveButton
                                action={removeTaskAction.bind(null, id, task.id)}
                                what={`tarefa: ${task.text}`}
                              />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.empty}>Nenhuma tarefa nesta etapa ainda.</p>
                      )}
                      <AddTaskForm
                        action={addTaskAction.bind(null, id, stage.id)}
                        stageId={stage.id}
                        stageTitle={stage.title}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="referencias" className={styles.card}>
            <h2 id="referencias" className={styles.cardTitle}>
              Referências
            </h2>
            <p className={styles.cardText}>
              Anote de onde vieram as informações. Marque como conferida só depois de abrir a fonte original e ver
              que ela diz o que você vai usar. Reveja como no módulo{" "}
              <Link href="/trilha/verificar-informacoes">Verificar informações produzidas por IA</Link>.
            </p>
            {project.references.length > 0 ? (
              <ul className={styles.items}>
                {project.references.map((ref) => (
                  <li key={ref.id} className={styles.item}>
                    <p className={styles.itemTitle}>
                      {ref.url ? (
                        <a href={ref.url} rel="noopener noreferrer nofollow ugc">
                          {ref.title}
                        </a>
                      ) : (
                        ref.title
                      )}
                    </p>
                    {ref.note ? <p className={styles.itemText}>{ref.note}</p> : null}
                    <div className={styles.row}>
                      <ToggleCheck
                        checked={Boolean(ref.verifiedAt)}
                        action={toggleReferenceAction.bind(null, id, ref.id)}
                      >
                        Conferida na fonte<span className="visually-hidden"> ({ref.title})</span>
                      </ToggleCheck>
                      <RemoveButton
                        action={removeReferenceAction.bind(null, id, ref.id)}
                        what={`referência: ${ref.title}`}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>Nenhuma referência ainda.</p>
            )}
            <AddReferenceForm action={addReferenceAction.bind(null, id)} />
          </section>

          <section aria-labelledby="uso-de-ia" className={styles.card}>
            <h2 id="uso-de-ia" className={styles.cardTitle}>
              Uso de IA
            </h2>
            <p className={styles.cardText}>
              Se você usou alguma IA no projeto, registre a ferramenta, para que usou e o que fez com a resposta.
              Usar IA não é problema; esconder o uso é.
            </p>
            {hasAiLogs ? (
              <ul className={styles.items}>
                {project.aiLogs.map((log) => (
                  <li key={log.id} className={styles.item}>
                    <p className={styles.itemTitle}>
                      {log.tool} <span className={styles.itemDate}>· {formatDate(log.createdAt)}</span>
                    </p>
                    <dl className={styles.logFacts}>
                      <div>
                        <dt>Para quê</dt>
                        <dd>{log.purpose}</dd>
                      </div>
                      <div>
                        <dt>O que fez com a resposta</dt>
                        <dd>{log.change}</dd>
                      </div>
                    </dl>
                    <RemoveButton
                      action={removeAiLogAction.bind(null, id, log.id)}
                      what={`registro de uso de IA: ${log.tool}`}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.noAi}>
                <ToggleCheck
                  checked={Boolean(project.noAiMarkedAt)}
                  action={setNoAiAction.bind(null, id, !project.noAiMarkedAt)}
                >
                  Não usei IA neste projeto
                </ToggleCheck>
              </div>
            )}
            <AiLogForm action={addAiLogAction.bind(null, id)} />
          </section>
        </div>

        <section aria-labelledby="historico" className={`${styles.card} ${styles.historyCard}`}>
          <h2 id="historico" className={styles.cardTitle}>
            Histórico
          </h2>
          {project.events.length > 0 ? (
            <ol className={styles.history}>
              {project.events.map((event) => (
                <li key={event.id}>
                  <time dateTime={event.createdAt.toISOString()} className={styles.historyTime}>
                    {formatDateTime(event.createdAt)}
                  </time>
                  <span>{projectEventLabel(event.kind, event.detail)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>Nada registrado ainda.</p>
          )}
          <p className={styles.note}>Mostra as 50 mudanças mais recentes.</p>
        </section>
      </div>

      <section aria-labelledby="excluir" className={`${styles.card} ${styles.danger}`}>
        <h2 id="excluir" className={styles.cardTitle}>
          Excluir projeto
        </h2>
        <p className={styles.cardText}>Apaga o projeto, as etapas, as referências, os registros e o histórico.</p>
        <DeleteProjectForm action={deleteProjectAction.bind(null, id)} />
      </section>
    </div>
  );
}
