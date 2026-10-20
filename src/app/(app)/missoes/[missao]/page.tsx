import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MISSION_PASS_PERCENT, findMission } from "@/content";
import { unlockText } from "@/lib/learning/missions";
import { requireUser } from "@/lib/session";
import { getLevel } from "@/server/learning";
import { getLastFinishedMission, getOpenMission, isMissionUnlocked, toPublicStep } from "@/server/missions";

import { PromptBuilder } from "../../construtor/prompt-builder";
import { startMissionAction } from "../actions";
import styles from "../missoes.module.css";
import { MissionRunner } from "./mission-runner";

type Params = { params: Promise<{ missao: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { missao } = await params;
  const mission = findMission(missao);
  return { title: mission ? `Missão: ${mission.title}` : "Missão" };
}

/** Fase C2 — uma missão: em passos, ou com o construtor de prompt. */
export default async function MissionPage({ params }: Params) {
  const { missao } = await params;
  const mission = findMission(missao);
  if (!mission) notFound();

  const user = await requireUser(`/missoes/${mission.id}`);
  const [unlocked, level] = await Promise.all([isMissionUnlocked(user.id, mission), getLevel(user.id)]);
  const open = unlocked && mission.kind === "steps" ? await getOpenMission(user.id, mission.id) : null;
  const last = unlocked ? await getLastFinishedMission(user.id, mission.id) : null;

  return (
    <article className={`${styles.page} ${unlocked && mission.kind === "prompt" ? styles.pageWide : ""}`}>
      <nav aria-label="Você está em" className={styles.breadcrumb}>
        <Link href="/missoes">Missões</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{mission.title}</span>
      </nav>

      <header className={`${styles.header} ${styles.headerRule}`}>
        <p className="eyebrow-text">
          Missão · {mission.kind === "steps" ? `${mission.steps.length} passos` : "construtor de prompt"} ·{" "}
          {mission.xp} XP
        </p>
        <h1 className={styles.title}>{mission.title}</h1>
        <p className={styles.lead}>{mission.summary}</p>
      </header>

      {!unlocked ? (
        <section className={styles.intro} aria-labelledby="bloqueada">
          <h2 id="bloqueada" className={styles.itemTitle}>
            Missão bloqueada
          </h2>
          <p>{unlockText(mission)}</p>
          <Link href="/trilha" className="btn btn-primary">
            Ir para a trilha
          </Link>
        </section>
      ) : mission.kind === "prompt" ? (
        <>
          <section className={styles.brief} aria-labelledby="caso">
            <h2 id="caso" className={styles.briefLabel}>
              O caso
            </h2>
            <p>{mission.brief}</p>
          </section>
          <p className={styles.itemText}>
            Nesta missão, o texto vai ao servidor só para conferir se os quatro elementos estão preenchidos e
            se não há dados pessoais. Ele é conferido e descartado: nada do que você escreve é gravado. A
            conferência olha a estrutura, não a qualidade do prompt.
          </p>
          {last?.passed ? <p className={styles.lastResult}>Você já concluiu esta missão.</p> : null}
          <PromptBuilder missionId={mission.id} />
        </>
      ) : open ? (
        <MissionRunner
          missionId={mission.id}
          attemptId={open.attemptId}
          steps={mission.steps.map(toPublicStep)}
          answered={open.answered}
          passPercent={MISSION_PASS_PERCENT}
          hintOpen={(level ?? "iniciante") === "iniciante"}
        />
      ) : (
        <section className={styles.intro} aria-label="Começar a missão">
          {last ? (
            <p className={styles.lastResult}>
              Última tentativa: {last.correct} de {last.total} passos certos
              {last.passed ? " · missão concluída" : ""}
            </p>
          ) : null}
          <p>
            Depois de cada passo você vê se acertou e por quê. Para concluir, acerte pelo menos{" "}
            {MISSION_PASS_PERCENT}% dos passos.
          </p>
          <form action={startMissionAction.bind(null, mission.id)}>
            <button type="submit" className="btn btn-primary">
              {last ? "Fazer de novo" : "Começar a missão"}
            </button>
          </form>
        </section>
      )}
    </article>
  );
}
