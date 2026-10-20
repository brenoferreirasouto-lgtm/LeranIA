import { Wordmark } from "@/components/brand/wordmark";

import styles from "./auth.module.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.brand}>
        <Wordmark tone="dark" />
        <div className={styles.brandBody}>
          <p className={styles.motto}>Aprenda · Aplique · Evolua</p>
          <p className={styles.thesis}>
            Aprender a usar IA também é aprender <span className={styles.underline}>quando questioná-la</span>.
          </p>
        </div>
        <p className={styles.brandFoot}>Plataforma de letramento em inteligência artificial · ODS 4</p>
      </aside>
      <main id="conteudo" className={styles.main}>
        <div className={styles.panel}>{children}</div>
      </main>
    </div>
  );
}
