import { SiteHeader } from "@/components/nav/site-header";
import { getCurrentUser } from "@/lib/session";

import styles from "./app.module.css";

/** Área logada. Cada página confere a sessão com requireUser(). */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <SiteHeader user={user} />
      <main id="conteudo" className={styles.main}>
        {children}
      </main>
    </>
  );
}
