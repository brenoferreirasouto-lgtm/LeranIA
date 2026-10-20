import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { SiteHeader } from "@/components/nav/site-header";
import { getCurrentUser } from "@/lib/session";

import styles from "./home.module.css";

const steps = [
  {
    title: "Nivelamento",
    text: "Um quiz curto mostra o que você já sabe sobre IA generativa.",
  },
  {
    title: "Trilha no seu nível",
    text: "Você começa pelo conteúdo certo: iniciante, intermediário ou avançado.",
  },
  {
    title: "Prática com feedback",
    text: "Cada exercício explica o acerto ou o erro, para você entender o porquê.",
  },
  {
    title: "Continue de onde parou",
    text: "Seu progresso fica salvo na sua conta.",
  },
];

const topics = [
  {
    title: "Identificar alucinações",
    text: "Respostas convincentes também erram. Aprenda a desconfiar com método.",
  },
  {
    title: "Escrever bons prompts",
    text: "Contexto, objetivo, formato e restrições: compare prompts e monte o seu.",
  },
  {
    title: "Proteger seus dados",
    text: "Saiba o que não compartilhar com uma IA e por quê.",
  },
  {
    title: "Verificar informações",
    text: "Um roteiro para checar fontes antes de usar uma resposta.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      <main id="conteudo">
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Letramento em IA para estudantes</p>
            <h1 className={styles.headline}>
              Aprender a usar IA também é aprender quando questioná-la.
            </h1>
            <p className={styles.lead}>
              Trilhas curtas, situações reais e feedback a cada resposta para você usar IA
              generativa com mais critério nos estudos e nos seus projetos.
            </p>
            <div className={styles.actions}>
              {user ? (
                <Link href="/painel" className="btn btn-primary">
                  Ir para o painel
                </Link>
              ) : (
                <>
                  <Link href="/cadastro" className="btn btn-primary">
                    Criar conta
                  </Link>
                  <Link href="/entrar" className="btn btn-secondary">
                    Entrar
                  </Link>
                </>
              )}
            </div>
          </div>

          <figure className={styles.specimen} aria-labelledby="exemplo-legenda">
            <p className={styles.specimenLabel}>Exemplo · resposta de um chatbot</p>
            <div className={styles.prompt}>
              Me indique um estudo sobre IA na educação brasileira para citar no meu trabalho.
            </div>
            <div className={styles.answer}>
              <p>
                Claro! Um estudo importante é{" "}
                <mark className={`${styles.mark} ${styles.mark1}`}>
                  “IA e aprendizagem nas escolas públicas” (Silva &amp; Costa, 2021)
                </mark>
                , publicado na Revista Brasileira de Educação Digital. Ele mostra que{" "}
                <mark className={`${styles.mark} ${styles.mark2}`}>78% dos professores</mark> já
                usam IA em sala de aula.
              </p>
            </div>
            <ol className={styles.notes}>
              <li className={styles.note1}>Esse artigo existe? Procure pelo título antes de citar.</li>
              <li className={styles.note2}>Número sem fonte nem data. De onde ele veio?</li>
            </ol>
            <figcaption id="exemplo-legenda" className={styles.caption}>
              Uma resposta segura de si não é uma resposta verificada. É esse olhar que você treina
              aqui.
            </figcaption>
          </figure>
        </section>

        <section className={styles.band} aria-labelledby="como-funciona">
          <div className={styles.bandInner}>
            <h2 id="como-funciona" className={styles.sectionTitle}>
              Como funciona
            </h2>
            <ol className={styles.steps}>
              {steps.map((step) => (
                <li key={step.title} className={styles.step}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.topicsSection} aria-labelledby="temas">
          <h2 id="temas" className={styles.sectionTitle}>
            O que você vai praticar
          </h2>
          <ul className={styles.topics}>
            {topics.map((topic) => (
              <li key={topic.title} className={styles.topic}>
                <h3 className={styles.topicTitle}>{topic.title}</h3>
                <p>{topic.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Wordmark tone="dark" />
          <p>
            Projeto acadêmico da disciplina Fundamentos de Desenvolvimento de Software, alinhado ao
            ODS 4 — Educação de Qualidade.
          </p>
          <Link href="/privacidade" className={styles.footerLink}>
            Privacidade e termos de uso
          </Link>
        </div>
      </footer>
    </>
  );
}
