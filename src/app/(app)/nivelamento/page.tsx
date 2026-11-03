import type { Metadata } from "next";
import Link from "next/link";

import { DONT_KNOW_OPTION_ID, LEVEL_LABEL } from "@/content";
import { requireUser } from "@/lib/session";
import { publicPlacementQuestions } from "@/server/content";
import { getLevel } from "@/server/learning";

import styles from "./nivelamento.module.css";
import { PlacementForm } from "./placement-form";

export const metadata: Metadata = { title: "Quiz de nivelamento" };

/** SP02 — Quiz de nivelamento. */
export default async function PlacementPage() {
  const user = await requireUser("/nivelamento");
  const level = await getLevel(user.id);
  const questions = publicPlacementQuestions();

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className="eyebrow-text">Nivelamento</p>
        <h1 className={styles.title}>Descubra por onde começar</h1>
        <p className={styles.lead}>
          São {questions.length} perguntas rápidas sobre conceitos, alucinações, prompts e
          privacidade. O resultado define a trilha que combina com o que você já sabe.
        </p>
        <p className={styles.note}>
          Não sabe uma resposta? Marque <strong>“Ainda não sei”</strong>. Chutar só coloca você
          numa trilha que não é a sua.
        </p>
        {level ? (
          <p className={styles.retake} role="note">
            Você já fez o nivelamento e está no nível <strong>{LEVEL_LABEL[level]}</strong>. Refazer
            atualiza sua trilha; os módulos que você concluiu continuam salvos.{" "}
            <Link href="/nivelamento/resultado">Ver meu último resultado</Link>
          </p>
        ) : null}
      </header>

      <PlacementForm questions={questions} dontKnowId={DONT_KNOW_OPTION_ID} />
    </div>
  );
}
