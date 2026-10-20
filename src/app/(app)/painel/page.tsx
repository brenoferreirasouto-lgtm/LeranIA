import type { Metadata } from "next";

import { requireUser } from "@/lib/session";

import styles from "./painel.module.css";

export const metadata: Metadata = { title: "Painel" };

/**
 * Painel inicial (base de SP09 e SP05). Mostra apenas dados reais:
 * enquanto não há atividades concluídas, exibe o estado vazio.
 * O quiz de nivelamento (SP02) e a trilha (U03) entram na Fase B.
 */
export default async function DashboardPage() {
  const user = await requireUser("/painel");
  const firstName = user.name.split(" ")[0];

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1 className={styles.title}>Olá, {firstName}.</h1>
        <p className={styles.lead}>
          Seu nível, sua trilha e o progresso de cada atividade aparecem aqui.
        </p>
      </header>

      <section aria-labelledby="ponto-de-partida" className={styles.card}>
        <div className={styles.cardHead}>
          <h2 id="ponto-de-partida" className={styles.cardTitle}>
            Quiz de nivelamento
          </h2>
          <span className={styles.badge}>Em breve</span>
        </div>
        <p className={styles.cardText}>
          Perguntas sobre conceitos, ferramentas e boas práticas de IA indicam por qual trilha
          você começa: iniciante, intermediário ou avançado.
        </p>
      </section>

      <section aria-labelledby="progresso" className={styles.card}>
        <h2 id="progresso" className={styles.cardTitle}>
          Seu progresso
        </h2>
        <p className={styles.empty}>Nenhuma atividade concluída ainda.</p>
      </section>
    </div>
  );
}
