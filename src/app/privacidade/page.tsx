import type { Metadata } from "next";

import { SiteHeader } from "@/components/nav/site-header";
import { getCurrentUser } from "@/lib/session";

import styles from "./privacidade.module.css";

export const metadata: Metadata = { title: "Privacidade e termos de uso" };

/*
 * RASCUNHO para revisão da equipe (e, se possível, da orientação da disciplina).
 * Descreve apenas o que o sistema faz hoje. Atualize a cada novo dado coletado.
 */
export default async function PrivacyPage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      <main id="conteudo" className={styles.main}>
        <article className={styles.article}>
          <p className={styles.draft}>Versão preliminar, em revisão pela equipe do projeto.</p>
          <h1>Privacidade e termos de uso</h1>

          <h2>Para que serve o Learn AI</h2>
          <p>
            O Learn AI é um projeto acadêmico de letramento em inteligência artificial. Os
            conteúdos são educativos e não substituem orientação profissional.
          </p>

          <h2>Quais dados guardamos</h2>
          <ul>
            <li>Nome e e-mail informados no cadastro.</li>
            <li>A senha, apenas na forma de um código irreversível (hash). A senha original nunca é gravada.</li>
            <li>A data e a hora em que você aceitou estes termos.</li>
            <li>
              Dados da sessão de acesso: endereço IP e navegador usados no login, para manter você
              conectado e proteger a conta.
            </li>
            <li>
              Para limitar tentativas de login, guardamos por alguns minutos um código derivado do
              e-mail e do IP, sem o valor original.
            </li>
          </ul>

          <h2>Para que usamos</h2>
          <p>
            Só para identificar você, manter seu progresso e proteger sua conta. Não vendemos nem
            compartilhamos seus dados com terceiros, e não os enviamos a serviços de IA.
          </p>

          <h2>Seus direitos</h2>
          <p>
            Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento,
            conforme a Lei Geral de Proteção de Dados (LGPD). Enquanto a exclusão pela própria
            conta não estiver disponível, faça o pedido à equipe do projeto.
          </p>

          <h2>Uso responsável</h2>
          <p>
            Ao usar a plataforma, você se compromete a não inserir dados pessoais de terceiros nem
            informações sensíveis nos exercícios.
          </p>
        </article>
      </main>
    </>
  );
}
