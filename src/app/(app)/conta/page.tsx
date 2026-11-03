import type { Metadata } from "next";
import Link from "next/link";

import { DeleteAccountForm } from "@/components/account/delete-account-form";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { getAccount } from "@/server/account";

import styles from "./conta.module.css";

export const metadata: Metadata = { title: "Minha conta" };

/** Dados da conta, download dos dados e exclusão (LGPD, art. 18; ADR 0002). */
export default async function AccountPage() {
  const user = await requireUser("/conta");
  const account = await getAccount(user.id);
  if (!account) return null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className="eyebrow-text">Conta</p>
        <h1 className={styles.title}>Minha conta</h1>
        <p className={styles.lead}>
          Seus dados são só seus: veja o que está guardado, baixe uma cópia ou exclua tudo. Saiba mais na{" "}
          <Link href="/privacidade">política de privacidade</Link>.
        </p>
      </header>

      <section className={styles.card} aria-labelledby="dados">
        <h2 id="dados" className={styles.cardTitle}>
          Seus dados
        </h2>
        <dl className={styles.facts}>
          <div>
            <dt>Nome</dt>
            <dd>{account.name}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{account.email}</dd>
          </div>
          <div>
            <dt>Conta criada em</dt>
            <dd>{formatDate(account.createdAt)}</dd>
          </div>
          <div>
            <dt>Termos aceitos em</dt>
            <dd>{account.termsAcceptedAt ? formatDate(account.termsAcceptedAt) : "Não registrado"}</dd>
          </div>
          <div>
            <dt>Idade mínima confirmada em</dt>
            <dd>{account.ageConfirmedAt ? formatDate(account.ageConfirmedAt) : "Não registrado"}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.card} aria-labelledby="baixar">
        <h2 id="baixar" className={styles.cardTitle}>
          Baixar meus dados
        </h2>
        <p className={styles.cardText}>
          Um arquivo com tudo o que o Learn AI guarda sobre você: conta, respostas, progresso, XP, conquistas e
          acessos. Por segurança, ficam de fora só o código da sua senha e os códigos das sessões.
        </p>
        <div>
          <a href="/conta/dados" className="btn btn-secondary" download>
            Baixar meus dados (JSON)
          </a>
        </div>
      </section>

      <section className={`${styles.card} ${styles.danger}`} aria-labelledby="excluir">
        <h2 id="excluir" className={styles.cardTitle}>
          Excluir minha conta
        </h2>
        <p className={styles.cardText}>
          Apaga a conta e todos os dados ligados a ela: respostas, progresso, XP e conquistas. Não dá para
          desfazer. Se quiser guardar uma cópia, baixe seus dados antes.
        </p>
        <DeleteAccountForm />
      </section>
    </div>
  );
}
