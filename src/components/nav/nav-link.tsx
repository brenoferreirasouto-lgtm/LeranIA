"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./site-header.module.css";

/** Link do menu que marca a página atual (aria-current) para leitores de tela e visualmente. */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link href={href} className={styles.link} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}
