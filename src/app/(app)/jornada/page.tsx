import type { Metadata } from "next";

import { AchievementMedal } from "@/components/journey/achievement-medal";
import { StageMeter } from "@/components/journey/stage-meter";
import { STAGES, XP_RULES, finalAssessment, missions, modules } from "@/content";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { ensureRewards, getJourney } from "@/server/rewards";

import styles from "./jornada.module.css";

export const metadata: Metadata = { title: "Minha jornada" };

const practiceMax = Math.max(...modules.map((m) => m.practice.length)) * XP_RULES.practicePerCorrect;
const assessmentMax = finalAssessment.questions.length * XP_RULES.assessmentPerCorrect;

const HOW_TO_EARN = [
  { activity: "Nivelamento concluído", xp: `${XP_RULES.placementCompleted}`, when: "Só o primeiro" },
  { activity: "Aula concluída", xp: `${XP_RULES.lessonCompleted}`, when: "Uma vez por módulo" },
  {
    activity: "Prática do módulo",
    xp: `${XP_RULES.practicePerCorrect} por acerto (até ${practiceMax})`,
    when: "Só na primeira tentativa",
  },
  {
    activity: "Módulo concluído (aula + prática com a nota mínima)",
    xp: `${XP_RULES.moduleCompleted}`,
    when: "Uma vez por módulo, em qualquer tentativa",
  },
  {
    activity: "Avaliação final",
    xp: `${XP_RULES.assessmentPerCorrect} por acerto (até ${assessmentMax})`,
    when: "Só na primeira tentativa",
  },
  { activity: "Aprovação na avaliação final", xp: `${XP_RULES.assessmentPassed}`, when: "Uma vez" },
  {
    activity: "Missão concluída",
    xp: missionXpText(),
    when: "Uma vez por missão",
  },
];

/** Ex.: "30 (a integradora, 60)", a partir dos valores das missões. */
function missionXpText(): string {
  const values = missions.map((m) => m.xp);
  const common = Math.min(...values);
  const special = missions.filter((m) => m.xp !== common);
  if (special.length === 0) return `${common}`;
  return `${common} (${special.map((m) => `${m.title}: ${m.xp}`).join("; ")})`;
}

/**
 * Fase C1 — Jornada de Evolução e Conquistas. Tudo vem do que já está
 * gravado; ao abrir a página, o servidor concede o que estiver faltando
 * (é assim que quem já usava a plataforma recebe o XP retroativo).
 */
export default async function JourneyPage() {
  const user = await requireUser("/jornada");
  await ensureRewards(user.id);
  const journey = await getJourney(user.id);
  const { stage } = journey;

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="estagio">
        <p className={`eyebrow-text ${styles.eyebrowOnDark}`}>Minha jornada</p>
        <h1 id="estagio" className={styles.stageName}>
          Estágio <span>{stage.stage}</span> de {STAGES.length}
        </h1>
        <p className={styles.xpTotal}>{stage.xp} XP</p>
        <StageMeter xp={stage.xp} stage={stage.stage} stages={STAGES} tone="dark" />
        <p className={styles.heroText}>
          {stage.next
            ? `Faltam ${stage.next.minXp - stage.xp} XP para o Estágio ${stage.next.stage}.`
            : "Você chegou ao último estágio."}{" "}
          XP vem só de aprendizagem registrada, e cada atividade conta uma vez.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="conquistas">
        <div className={styles.sectionHead}>
          <h2 id="conquistas" className={styles.sectionTitle}>
            Conquistas
          </h2>
          <span className={styles.count}>
            {journey.earnedCount} de {journey.achievements.length}
          </span>
        </div>
        <ul className={styles.achievements}>
          {journey.achievements.map((a) => (
            <li
              key={a.id}
              className={`${styles.achievement} ${a.earnedAt ? styles.achievementEarned : ""}`}
            >
              <AchievementMedal earned={Boolean(a.earnedAt)} />
              <div className={styles.achievementBody}>
                <h3 className={styles.achievementTitle}>{a.title}</h3>
                <p className={styles.achievementText}>{a.description}</p>
                <p className={styles.achievementStatus}>
                  {a.earnedAt ? `Obtida em ${formatDate(a.earnedAt)}` : "Ainda não obtida"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="historico">
        <h2 id="historico" className={styles.sectionTitle}>
          Histórico de XP
        </h2>
        {journey.history.length > 0 ? (
          <ol className={styles.history}>
            {journey.history.map((h) => (
              <li key={h.id} className={styles.historyRow}>
                <span className={styles.historyDate}>{formatDate(h.earnedAt)}</span>
                <span className={styles.historyLabel}>{h.label}</span>
                <span className={styles.historyPoints}>+{h.points} XP</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.empty}>
            Nenhum XP ainda. Comece pelo nivelamento: ele rende os primeiros {XP_RULES.placementCompleted} XP.
          </p>
        )}
      </section>

      <section className={styles.section} aria-labelledby="como-ganhar">
        <h2 id="como-ganhar" className={styles.sectionTitle}>
          Como ganhar XP
        </h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Atividade</th>
                <th scope="col">XP</th>
                <th scope="col">Quando conta</th>
              </tr>
            </thead>
            <tbody>
              {HOW_TO_EARN.map((row) => (
                <tr key={row.activity}>
                  <th scope="row">{row.activity}</th>
                  <td>{row.xp}</td>
                  <td>{row.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.note}>
          Refazer melhora a nota, não o XP: as práticas e a avaliação mostram a resposta certa depois de
          cada erro. Conquistas não dão XP. Só você vê sua jornada.
        </p>
      </section>
    </div>
  );
}
