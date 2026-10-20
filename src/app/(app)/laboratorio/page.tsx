import type { Metadata } from "next";
import Link from "next/link";

import { NewProjectForm } from "@/components/lab/new-project-form";
import styles from "@/components/lab/lab.module.css";
import { formatDate } from "@/lib/format";
import { PROJECT_LIMITS } from "@/lib/projects";
import { requireUser } from "@/lib/session";
import { isLabUnlocked, listProjects, templateOptions } from "@/server/projects";

export const metadata: Metadata = { title: "Laboratório" };

/** SP26 — Laboratório de Projetos Autorais (ADR 0002, decisões 8 a 13). */
export default async function LabPage() {
  const user = await requireUser("/laboratorio");
  const unlocked = await isLabUnlocked(user.id);
  const items = unlocked ? await listProjects(user.id) : [];
  const atLimit = items.length >= PROJECT_LIMITS.projectsPerUser;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className="eyebrow-text">
          Laboratório{unlocked ? ` · ${items.length} de ${PROJECT_LIMITS.projectsPerUser} projetos` : ""}
        </p>
        <h1 className={styles.title}>Laboratório de projetos</h1>
        <p className={styles.lead}>
          Transforme o que você aprendeu em um projeto seu: um trabalho da escola, uma pesquisa ou uma ideia
          prática. Os projetos são privados: só você vê.
        </p>
      </header>

      {!unlocked ? (
        <section aria-labelledby="bloqueado" className={`${styles.card} ${styles.cardLocked}`}>
          <h2 id="bloqueado" className={styles.cardTitle}>
            Libera depois da primeira missão
          </h2>
          <p className={styles.cardText}>
            O Laboratório libera quando você concluir a sua primeira missão. Nas missões você pratica o que vai
            usar aqui: escrever um bom pedido, conferir fontes e proteger dados pessoais.
          </p>
          <div>
            <Link href="/missoes" className="btn btn-primary">
              Ir para as missões
            </Link>
          </div>
        </section>
      ) : (
        <>
          {items.length > 0 ? (
            <section aria-labelledby="seus-projetos" className={styles.section}>
              <h2 id="seus-projetos" className={styles.sectionTitle}>
                Seus projetos
              </h2>
              <ul className={styles.projectList}>
                {items.map((p) => (
                  <li key={p.id} className={styles.projectItem}>
                    <h3 className={styles.projectTitle}>
                      <Link href={`/laboratorio/${p.id}`}>{p.title}</Link>
                    </h3>
                    <p className={styles.meta}>
                      <span>{p.templateTitle}</span>
                      <span>
                        {p.stagesDone} de {p.stagesTotal} etapas
                      </span>
                      <span>Atualizado em {formatDate(p.updatedAt)}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="novo-projeto" className={styles.card}>
            <h2 id="novo-projeto" className={styles.cardTitle}>
              Novo projeto
            </h2>
            {atLimit ? (
              <p className={styles.cardText}>
                Você chegou ao limite de {PROJECT_LIMITS.projectsPerUser} projetos. Exclua um para criar outro.
              </p>
            ) : (
              <NewProjectForm templates={templateOptions()} />
            )}
          </section>

          <p className={styles.note}>
            Nesta versão o Laboratório não usa IA: a lista de conferência segue regras fixas e nada do que você
            escreve é enviado a outros serviços. Se você usar uma IA por fora, registre o uso no projeto.
          </p>
        </>
      )}
    </div>
  );
}
