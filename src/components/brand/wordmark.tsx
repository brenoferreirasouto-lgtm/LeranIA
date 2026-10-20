import Link from "next/link";

import styles from "./wordmark.module.css";

type Props = {
  /** "light" sobre fundos claros, "dark" sobre o azul-marinho. */
  tone?: "light" | "dark";
  href?: string;
};

/** Logotipo textual do Learn AI: "Learn" + "AI" no azul da marca. */
export function Wordmark({ tone = "light", href = "/" }: Props) {
  return (
    <Link href={href} className={`${styles.wordmark} ${styles[tone]}`} aria-label="Learn AI, página inicial">
      <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M16 4.5 4.8 25.2a1.6 1.6 0 0 0 1.4 2.3h19.6a1.6 1.6 0 0 0 1.4-2.3L16 4.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="19" r="3.4" className={styles.node} />
      </svg>
      <span>
        Learn <span className={styles.ai}>AI</span>
      </span>
    </Link>
  );
}
