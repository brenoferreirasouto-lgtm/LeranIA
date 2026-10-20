import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/nav/site-header";
import { getCurrentUser } from "@/lib/session";
import { MIN_AGE } from "@/lib/validation/auth";

import styles from "./privacidade.module.css";

export const metadata: Metadata = { title: "Privacidade e termos de uso" };

/*
 * Descreve só o que o sistema faz hoje (ADR 0002), em linguagem simples
 * (LGPD, art. 14, §6º). Atualize a cada novo dado coletado.
 */
export default async function PrivacyPage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      <main id="conteudo" className={styles.main}>
        <article className={styles.article}>
          <p className={styles.draft}>
            Versão de 20/10/2026, escrita pela equipe do projeto. Ainda não passou por revisão jurídica.
          </p>
          <h1>Privacidade e termos de uso</h1>

          <h2>O que é o Learn AI</h2>
          <p>
            Um projeto acadêmico, sem fins lucrativos, para aprender a usar inteligência artificial com senso
            crítico. Os conteúdos são educativos e não substituem orientação profissional.
          </p>

          <h2>Quem pode usar</h2>
          <p>
            Quem tem {MIN_AGE} anos ou mais. No cadastro, você declara isso. Não pedimos nem guardamos a sua data de
            nascimento. Se você tem menos de 18 anos, vale conversar com seu responsável sobre o uso da plataforma.
          </p>

          <h2>O que guardamos</h2>
          <ul>
            <li>Nome e e-mail que você informou no cadastro.</li>
            <li>
              A senha, só como um código que não pode ser revertido (hash). A senha original nunca é gravada.
            </li>
            <li>A data em que você aceitou estes termos e a data em que declarou a idade mínima.</li>
            <li>
              Dados de acesso: endereço IP e navegador usados ao entrar, para manter você conectado e proteger a
              conta. O acesso expira depois de 7 dias sem uso.
            </li>
            <li>
              Para limitar tentativas de login, cadastro e exclusão, um código derivado do e-mail, do IP ou da conta
              (hash), nunca o valor original. A contagem zera depois de alguns minutos.
            </li>
            <li>
              O que você faz para aprender: respostas do nivelamento, das práticas, da avaliação final e das
              missões, o progresso nos módulos, o XP e as conquistas.
            </li>
          </ul>

          <h2>O que não guardamos</h2>
          <ul>
            <li>O texto que você escreve no construtor de prompt: ele fica só no seu navegador.</li>
            <li>
              Na missão &quot;Monte um prompt completo&quot;, o texto vai ao servidor só para conferir os quatro
              elementos e procurar dados pessoais, e é descartado em seguida. Fica gravado só o resultado: se a
              missão foi concluída ou não.
            </li>
          </ul>

          <h2>Para que usamos</h2>
          <p>
            Para identificar você, guardar seu progresso, calcular seu XP e suas conquistas e proteger sua conta.
            Mais nada.
          </p>

          <h2>O que não fazemos</h2>
          <ul>
            <li>Não vendemos nem compartilhamos seus dados.</li>
            <li>Não mostramos publicidade e não usamos rastreadores de terceiros.</li>
            <li>Não há ranking nem perfil público: seu XP e suas conquistas só você vê.</li>
            <li>Não enviamos o que você escreve a serviços de inteligência artificial.</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            Só um: o cookie que mantém você conectado. Ele é necessário para a plataforma funcionar e é apagado
            quando você sai ou quando o acesso expira.
          </p>

          <h2>Por quanto tempo</h2>
          <p>
            Enquanto a sua conta existir. Quando você exclui a conta, apagamos todos os dados ligados a ela na
            mesma hora.
          </p>

          <h2>Seus direitos</h2>
          <p>
            A Lei Geral de Proteção de Dados (LGPD) garante que você pode ver, levar e apagar seus dados. Na página{" "}
            {user ? <Link href="/conta">Minha conta</Link> : "Minha conta"} você baixa uma cópia de tudo o que
            guardamos e exclui a conta quando quiser. Para corrigir nome ou e-mail, fale com a equipe do projeto.
          </p>

          <h2>Uso responsável</h2>
          <p>
            Ao usar a plataforma, você se compromete a não colocar dados pessoais seus ou de outras pessoas nos
            exercícios e nas missões.
          </p>
        </article>
      </main>
    </>
  );
}
