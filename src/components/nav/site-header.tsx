import Link from "next/link";

import { signOutAction } from "@/app/(auth)/actions";
import { Wordmark } from "@/components/brand/wordmark";
import type { CurrentUser } from "@/lib/session";

import { MainMenu } from "./main-menu";
import styles from "./site-header.module.css";

/** Cabeçalho com a marca e o menu (SP14). Só lista o que já funciona. */
export function SiteHeader({ user }: { user: CurrentUser | null }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Wordmark href={user ? "/painel" : "/"} />
        {user ? (
          <MainMenu firstName={user.name.split(" ")[0]} email={user.email} signOut={signOutAction} />
        ) : (
          <nav aria-label="Menu principal" className={styles.publicNav}>
            <Link href="/entrar" className={styles.link}>
              Entrar
            </Link>
            <Link href="/cadastro" className="btn btn-primary">
              Criar conta
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
