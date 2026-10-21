# Roteiro de demonstração — Learn AI

Uma apresentação de cerca de 10 minutos que segue o fluxo do aluno: entrar, continuar a trilha, praticar, cumprir uma missão, ver a jornada e trabalhar num projeto. Cada passo indica as histórias do backlog que ele mostra.

## Antes de apresentar

1. Banco no ar e tabelas criadas (veja "Como rodar o projeto" no README).
2. Crie a conta de demonstração, com uma senha que a equipe combine:

   ```bash
   DEMO_PASSWORD="uma senha da equipe" npm run db:seed-demo -- --reset
   ```

3. Rode a versão de produção, que responde mais rápido que a de desenvolvimento:

   ```bash
   npm run build && npm start      # http://localhost:3000
   ```

4. Ensaie uma vez e rode o passo 2 de novo: o ensaio consome a missão e muda a lista de conferência.

**Como a conta começa** (e-mail `demo@learnai.example`, nome "Lia Demonstração"):

| O quê | Estado |
|---|---|
| Nivelamento | 6 de 10, Trilha Intermediária |
| Módulos | Alucinações (prática 5 de 5), Verificar informações (4 de 5) e Estrutura de um bom prompt (5 de 5) concluídos; aula de Comparar prompts aberta |
| Missões | Caça às alucinações concluída; Checagem de fonte e Monte um prompt completo disponíveis |
| Jornada | 340 XP, Estágio 4 de 5, 3 conquistas |
| Laboratório | "Seminário: IA generativa na escola" com a primeira etapa concluída e uma referência conferida; sem registro de uso de IA |

## Roteiro

1. **Página inicial e privacidade** (1 min, sem login). A proposta, o público a partir de 13 anos e, em "Privacidade", o que o sistema guarda e o que não guarda. *SP14, ADR 0002.*
2. **Cadastro** (30 s). Mostre o formulário: aceite dos termos, declaração "Tenho 13 anos ou mais" e a mensagem de cada campo ao enviar vazio. Não precisa criar a conta. *SP15.*
3. **Entrar** com a conta de demonstração (30 s). Conte que o login tem limite de tentativas e que e-mail inexistente e senha errada recebem a mesma mensagem. *U02.*
4. **Painel** (1 min). "Continue de onde parou" aponta para Comparar prompts; o progresso mostra 3 de 5 módulos obrigatórios e o estágio da jornada. *SP05, SP09, SP03.*
5. **Aula e prática com feedback** (1,5 min). Clique em "Continuar", conclua a aula, comece a prática e responda uma ou duas perguntas: cada resposta mostra se acertou e por quê. Não precisa terminar a prática; nada do resto depende dela. *SP07, SP13.*
6. **Missão do construtor** (2 min). Em Missões, abra "Monte um prompt completo" e preencha os quatro elementos com o texto abaixo. Na primeira vez, deixe o e-mail nas restrições: a missão recusa e explica. Troque as restrições e envie de novo: +30 XP e a conquista "Prompt completo". *SP06, SP24, SP25.*

   | Elemento | Texto |
   |---|---|
   | Contexto | Sou estudante do ensino médio e vou apresentar um seminário de 10 minutos. |
   | Objetivo | Monte o roteiro da apresentação sobre o ciclo da água. |
   | Formato | Introdução, três partes e conclusão, em tópicos curtos. |
   | Restrições (1ª vez) | Linguagem simples. Meu contato: lia@escola.com |
   | Restrições (2ª vez) | Linguagem simples, e indique o que devo conferir em fontes oficiais. |

7. **Minha jornada** (1 min). O estágio, o histórico com a origem de cada ponto de XP, as conquistas com o critério de cada uma e o mapa de habilidades. Reforce: XP só vem de atividade corrigida pelo servidor, e cada atividade conta uma vez. *SP23, SP25.*
8. **Laboratório** (2 min). Abra o projeto. A lista de conferência mostra 6 de 7 itens; marque "Não usei IA neste projeto" e ela vai para 7 de 7. Mostre que a conquista "Projeto autoral" ainda não aparece porque faltam etapas, a referência marcada como conferida e o histórico. Se quiser, digite um e-mail no objetivo para mostrar o aviso de dados pessoais. *SP26.*
9. **Minha conta** (30 s). O botão de baixar os dados (um arquivo JSON com tudo) e a exclusão da conta com senha. Não exclua a conta de demonstração. *LGPD, art. 18.*
10. **Fechamento** (30 s). Os testes automáticos rodam a cada pull request no GitHub: unidade, integração e sistema, em tela de computador e de celular, com verificação de acessibilidade.

## Se algo sair do roteiro

| Situação | O que fazer |
|---|---|
| A conta já foi usada no ensaio | `npm run db:seed-demo -- --reset` recria do zero |
| "Muitas tentativas seguidas" no login | O limite é de 10 tentativas em 15 minutos por e-mail; aguarde ou recrie a conta com outro `DEMO_EMAIL` |
| Errou perguntas na prática ao vivo | Nada depende dela; siga para a missão |
| A missão do construtor já está concluída | Mostre a mensagem de missão concluída e siga para a jornada |
