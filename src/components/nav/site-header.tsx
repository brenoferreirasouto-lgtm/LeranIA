import Link from "next/link";

import { signOutAction } from "@/app/(auth)/actions";
import { Wordmark } from "@/components/brand/wordmark";
import type { CurrentUser } from "@/lib/session";

import { NavLink } from "./nav-link";
import styles from "./site-header.module.css";

/**
 * SP14 — Menu de navegação (versão básica da Fase A).
 * Só lista o que já funciona; novas áreas entram aqui quando forem entregues.
 */
export function SiteHeader({ user }: { user: CurrentUser | null }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Wordmark href={user ? "/painel" : "/"} />
        <nav aria-label="Menu principal" className={styles.nav}>
          {user ? (
            <>
              <NavLink href="/painel">Painel</NavLink>
              <span className={styles.user} title={user.email}>
                {user.name.split(" ")[0]}
              </span>
              <form action={signOutAction}>
                <button type="submit" className={styles.signOut}>
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/entrar" className={styles.link}>
                Entrar
              </Link>
              <Link href="/cadastro" className="btn btn-primary">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
