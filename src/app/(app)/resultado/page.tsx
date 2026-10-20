import type { Metadata } from "next";
import Link from "next/link";

import { Recommendations } from "@/components/learning/recommendations";
import { SkillBars } from "@/components/learning/skill-bars";
import { LEVEL_LABEL } from "@/content";
import { requireUser } from "@/lib/session";
import { getResults } from "@/server/assessment";

import styles from "./resultado.module.css";

export const metadata: Metadata = { title: "Seu resultado" };

/**
 * SP10 — resultado final consolidado (nivelamento, práticas e avaliação) e
 * SP11 — recomendações. Todos os números vêm do banco; sem dado, sem número.
 */
export default async function ResultsPage() {
  const user = await requireUser("/resultado");
  const r = await getResults(user.id);

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className="eyebrow-text">{r.track.title}</p>
        <h1 className={styles.title}>Seu resultado</h1>
        <p className={styles.lead}>Nivelamento, práticas e avaliação final, num lugar só.</p>
      </header>

      <dl className={styles.summary}>
        <div className={styles.item}>
          <dt>Módulos obrigatórios</dt>
          <dd>
            <span className={styles.value}>
              {r.summary.requiredDone} de {r.summary.requiredTotal}
            </span>
            <span className={styles.detail}>concluídos</span>
          </dd>
        </div>
        <div className={styles.item}>
          <dt>Aproveitamento nas práticas</dt>
          <dd>
            {r.practiceAverage != null ? (
              <>
                <span className={styles.value}>{r.practiceAverage}%</span>
                <span className={styles.detail}>média das melhores notas</span>
              </>
            ) : (
              <span className={styles.detail}>Nenhuma prática feita ainda.</span>
            )}
          </dd>
        </div>
        <div className={styles.item}>
          <dt>Avaliação final</dt>
          <dd>
            {r.assessment ? (
              <>
                <span className={styles.value}>{r.assessment.percent}%</span>
                <span className={styles.detail}>
                  {r.assessment.correct} de {r.assessment.total} ·{" "}
                  {r.assessment.passed ? "aprovado" : "ainda não aprovado"}
                </span>
              </>
            ) : r.unlocked ? (
              <Link href="/avaliacao">Fazer a avaliação final</Link>
            ) : (
              <span className={styles.detail}>Libera ao concluir os módulos obrigatórios.</span>
            )}
          </dd>
        </div>
        <div className={styles.item}>
          <dt>Nivelamento</dt>
          <dd>
            {r.placement ? (
              <>
                <span className={styles.value}>{LEVEL_LABEL[r.placement.level]}</span>
                <span className={styles.detail}>
                  {r.placement.correct} de {r.placement.total} acertos
                </span>
              </>
            ) : (
              <Link href="/nivelamento">Fazer o nivelamento</Link>
            )}
          </dd>
        </div>
      </dl>

      {r.assessment ? (
        <section className={styles.section} aria-labelledby="por-tema">
          <h2 id="por-tema" className={styles.sectionTitle}>
            Desempenho por tema na avaliação final
          </h2>
          <SkillBars bySkill={r.assessment.bySkill} />
          <p>
            <Link href="/avaliacao/resultado">Ver a correção da avaliação</Link>
          </p>
        </section>
      ) : null}

      <section className={styles.section} aria-labelledby="recomendacoes">
        <h2 id="recomendacoes" className={styles.sectionTitle}>
          Recomendações
        </h2>
        <Recommendations items={r.recommendations} />
      </section>
    </div>
  );
}
