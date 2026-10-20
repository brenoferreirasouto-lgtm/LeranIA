"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import styles from "./site-header.module.css";

export const MENU_ITEMS = [
  { href: "/painel", label: "Painel" },
  { href: "/jornada", label: "Minha jornada" },
  { href: "/trilha", label: "Trilha" },
  { href: "/missoes", label: "Missões" },
  { href: "/laboratorio", label: "Laboratório" },
  { href: "/nivelamento", label: "Nivelamento" },
  { href: "/construtor", label: "Construtor de prompt" },
  { href: "/avaliacao", label: "Avaliação final" },
  { href: "/resultado", label: "Resultado" },
];

type Props = {
  firstName: string;
  email: string;
  signOut: () => Promise<void>;
};

/**
 * SP14 — menu com todas as funcionalidades. Em telas largas fica sempre
 * visível; no celular abre e fecha pelo botão "Menu" (Esc também fecha).
 */
export function MainMenu({ firstName, email, signOut }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Trocou de página: fecha o menu.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div
      className={styles.menu}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls="menu-principal"
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
        Menu
      </button>

      <nav id="menu-principal" aria-label="Menu principal" className={styles.nav} data-open={open}>
        <ul className={styles.navList}>
          {MENU_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={styles.link}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.account}>
          <Link
            href="/conta"
            className={styles.user}
            title={email}
            aria-current={isActive("/conta") ? "page" : undefined}
          >
            <span className="visually-hidden">Minha conta: </span>
            {firstName}
          </Link>
          <form action={signOut}>
            <button type="submit" className={styles.signOut}>
              Sair
            </button>
          </form>
        </div>
      </nav>
    </div>
  );
}
