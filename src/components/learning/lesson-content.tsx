import type { LessonBlock, LessonSection } from "@/content";

import styles from "./lesson.module.css";

function Block({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className={styles.paragraph}>{block.text}</p>;
    case "list":
      return (
        <ul className={styles.list}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "tip":
      return (
        <aside className={styles.tip}>
          <p className={styles.tipTitle}>{block.title}</p>
          <p>{block.text}</p>
        </aside>
      );
    case "example": {
      const verdictLabel =
        block.verdict === "bom" ? "Exemplo a seguir" : block.verdict === "ruim" ? "Exemplo a evitar" : null;
      return (
        <figure
          className={`${styles.example} ${
            block.verdict === "bom" ? styles.exampleGood : block.verdict === "ruim" ? styles.exampleBad : ""
          }`}
        >
          <figcaption className={styles.exampleHead}>
            <span>{block.label}</span>
            {verdictLabel ? <span className={styles.verdict}>{verdictLabel}</span> : null}
          </figcaption>
          <p className={styles.exampleText}>{block.text}</p>
        </figure>
      );
    }
  }
}

/** Aula renderizada a partir do conteúdo versionado (blocos tipados, sem HTML solto). */
export function LessonContent({ sections }: { sections: LessonSection[] }) {
  return (
    <div className={styles.lesson}>
      {sections.map((section) => (
        <section key={section.heading} className={styles.section}>
          <h2 className={styles.heading}>{section.heading}</h2>
          {section.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </section>
      ))}
    </div>
  );
}
