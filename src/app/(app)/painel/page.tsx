import type { Metadata } from "next";
import Link from "next/link";

import { ProgressBar } from "@/components/learning/progress-bar";
import { StatusBadge } from "@/components/learning/status-badge";
import { LEVEL_LABEL } from "@/content";
import { nextActivity, summarizeTrack } from "@/lib/learning/scoring";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { moduleTitle, trackFor } from "@/server/content";
import { getLatestPlacement, getProgress } from "@/server/learning";

import styles from "./painel.module.css";

export const metadata: Metadata = { title: "Painel" };

/**
 * Painel (SP09) com "continuar de onde parou" (SP05). Só mostra dados reais
 * gravados no banco; sem atividade, mostra o estado vazio e o próximo passo.
 */
export default async function DashboardPage() {
  const user = await requireUser("/painel");
  const firstName = user.name.split(" ")[0];
  const [placement, progress] = await Promise.all([getLatestPlacement(user.id), getProgress(user.id)]);

  const track = trackFor(placement?.level ?? null);
  const summary = summarizeTrack(track, progress);
  const next = placement ? nextActivity(track, progress) : null;
  const hasActivity = progress.some((p) => p.lastActivityAt || p.completedAt);

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1 className={styles.title}>Olá, {firstName}.</h1>
        <p className={styles.lead}>
          {placement
            ? `Você está na ${track.title}.`
            : "Seu nível, sua trilha e o progresso de cada atividade aparecem aqui."}
        </p>
      </header>

      {!placement ? (
        <section aria-labelledby="ponto-de-partida" className={`${styles.card} ${styles.cardFeature}`}>
          <h2 id="ponto-de-partida" className={styles.cardTitle}>
            Comece pelo quiz de nivelamento
          </h2>
          <p className={styles.cardText}>
            Dez perguntas rápidas sobre conceitos, alucinações, prompts e privacidade indicam por qual
            trilha você começa: iniciante, intermediário ou avançado.
          </p>
          <div>
            <Link href="/nivelamento" className="btn btn-primary">
              Fazer o nivelamento
            </Link>
          </div>
        </section>
      ) : (
        <section aria-labelledby="continuar" className={`${styles.card} ${styles.cardFeature}`}>
          {next ? (
            <>
              <p className="eyebrow-text">
                {next.kind === "continuar" ? "Continue de onde parou" : "Próximo módulo"}
              </p>
              <h2 id="continuar" className={styles.cardTitle}>
                {moduleTitle(next.moduleSlug)}
              </h2>
              <p className={styles.cardText}>{next.step === "aula" ? "Aula" : "Prática com feedback"}</p>
              <div>
                <Link
                  href={`/trilha/${next.moduleSlug}${next.step === "pratica" ? "/pratica" : ""}`}
                  className="btn btn-primary"
                >
                  {next.kind === "continuar" ? "Continuar" : "Começar"}
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 id="continuar" className={styles.cardTitle}>
                Trilha concluída
              </h2>
              <p className={styles.cardText}>
                Você concluiu todos os módulos da sua trilha. Revise o que quiser na trilha.
              </p>
            </>
          )}
        </section>
      )}

      <section aria-labelledby="progresso" className={styles.card}>
        <h2 id="progresso" className={styles.cardTitle}>
          Seu progresso
        </h2>
        {hasActivity ? (
          <>
            <ProgressBar
              value={summary.requiredDone}
              max={summary.requiredTotal}
              label="Módulos obrigatórios concluídos"
              detail={`${summary.requiredDone} de ${summary.requiredTotal}`}
            />
            <ul className={styles.moduleList}>
              {summary.steps.map((step) => (
                <li key={step.moduleSlug} className={styles.moduleRow}>
                  <Link href={`/trilha/${step.moduleSlug}`}>{moduleTitle(step.moduleSlug)}</Link>
                  <StatusBadge status={step.status} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.empty}>Nenhuma atividade concluída ainda.</p>
        )}
      </section>

      {placement ? (
        <section aria-labelledby="nivel" className={styles.card}>
          <div className={styles.cardHead}>
            <h2 id="nivel" className={styles.cardTitle}>
              Nível {LEVEL_LABEL[placement.level]}
            </h2>
            <span className={styles.badge}>
              {placement.correct} de {placement.total} no nivelamento
            </span>
          </div>
          <p className={styles.cardText}>
            Último nivelamento em {formatDate(placement.createdAt)}.{" "}
            <Link href="/nivelamento/resultado">Ver resultado</Link> ·{" "}
            <Link href="/nivelamento">Refazer</Link>
          </p>
        </section>
      ) : null}
    </div>
  );
}
