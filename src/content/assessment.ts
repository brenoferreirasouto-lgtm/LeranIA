import type { Assessment } from "./types";

// RASCUNHO para revisão da equipe — SP12 (quiz de avaliação do aprendizado).

/**
 * Nota para considerar a avaliação aprovada — PROPOSTA PARA VALIDAÇÃO.
 * Também é o limite abaixo do qual um tema entra nas recomendações (SP11).
 */
export const ASSESSMENT_PASS_PERCENT = 70;

export const finalAssessment: Assessment = {
  id: "avaliacao-final",
  title: "Avaliação final da trilha",
  description:
    "Doze perguntas novas sobre tudo o que você estudou. O resultado mostra seu desempenho por tema e o que vale revisar.",
  questions: [
    {
      id: "aval-q1",
      skill: "conceitos",
      prompt: "Uma IA generativa responde com muita segurança sobre um fato. Isso significa que…",
      options: [
        { id: "a", text: "o fato está confirmado." },
        { id: "b", text: "a confiança da resposta não diz se o fato está correto." },
        { id: "c", text: "a IA consultou uma fonte oficial." },
        { id: "d", text: "a resposta foi revisada por especialistas." },
      ],
      correctOptionId: "b",
      explanation:
        "O tom confiante vem dos padrões de linguagem. A IA não verifica fatos antes de responder, então segurança não é evidência.",
    },
    {
      id: "aval-q2",
      skill: "conceitos",
      prompt: "Qual tarefa combina melhor com uma IA generativa nos estudos?",
      options: [
        { id: "a", text: "Gerar uma primeira lista de ideias para você avaliar." },
        { id: "b", text: "Garantir que uma informação é verdadeira." },
        { id: "c", text: "Decidir sozinha a conclusão do seu trabalho." },
        { id: "d", text: "Substituir a leitura do material da disciplina." },
      ],
      correctOptionId: "a",
      explanation:
        "Gerar ideias é um ponto forte da IA, e a avaliação continua com você. Ela não garante veracidade nem substitui seu estudo e suas decisões.",
    },
    {
      id: "aval-q3",
      skill: "alucinacoes",
      sample: {
        label: "Resposta de um chatbot",
        text: "Dom Casmurro, romance de José de Alencar publicado em 1899, é narrado por Bento Santiago.",
      },
      prompt: "O que está errado nessa resposta?",
      options: [
        { id: "a", text: "O ano de publicação." },
        { id: "b", text: "O narrador." },
        { id: "c", text: "O autor: Dom Casmurro é de Machado de Assis." },
        { id: "d", text: "Nada, está tudo certo." },
      ],
      correctOptionId: "c",
      explanation:
        "Dom Casmurro foi publicado em 1899 e é narrado por Bento Santiago, mas o autor é Machado de Assis. Um erro entre dados certos é o tipo mais difícil de notar.",
    },
    {
      id: "aval-q4",
      skill: "alucinacoes",
      scenario: "Você pediu à IA o link da fonte de uma informação, e o endereço não abre.",
      prompt: "O que fazer?",
      options: [
        { id: "a", text: "Usar a informação mesmo assim, porque a IA deu um link." },
        { id: "b", text: "Considerar a fonte não confirmada e procurar a informação de outro jeito." },
        { id: "c", text: "Pedir outro link à IA e usar o primeiro que abrir, sem ler." },
        { id: "d", text: "Citar o link quebrado no trabalho." },
      ],
      correctOptionId: "b",
      explanation:
        "Links podem ser inventados ou não ter relação com a informação. Até encontrar e ler uma fonte confiável, a informação não está confirmada.",
    },
    {
      id: "aval-q5",
      skill: "verificacao",
      prompt: "Qual sequência descreve uma boa verificação?",
      options: [
        { id: "a", text: "Ler a resposta duas vezes e confiar se fizer sentido." },
        {
          id: "b",
          text: "Identificar o que checar, achar a fonte original e confirmar em outra fonte confiável.",
        },
        { id: "c", text: "Perguntar à IA se ela tem certeza." },
        { id: "d", text: "Ver se a informação aparece em redes sociais." },
      ],
      correctOptionId: "b",
      explanation:
        "Verificar é chegar à origem da informação e confirmá-la fora da IA. Fazer sentido, a IA ter certeza ou circular em redes sociais não confirma nada.",
    },
    {
      id: "aval-q6",
      skill: "verificacao",
      scenario: "Você confirmou que um dado está correto, mas ele é de 2015.",
      prompt: "O que ainda vale considerar?",
      options: [
        { id: "a", text: "Nada: se está correto, está pronto para usar." },
        { id: "b", text: "Se ele ainda vale hoje e se existe um dado mais recente." },
        { id: "c", text: "Trocar o ano para o atual." },
        { id: "d", text: "Arredondar o número." },
      ],
      correctOptionId: "b",
      explanation:
        "Dados mudam com o tempo. Use o mais recente disponível ou deixe claro de quando é o dado que você está citando.",
    },
    {
      id: "aval-q7",
      skill: "verificacao",
      prompt: "Para confirmar o texto atual de uma lei federal, a melhor fonte é…",
      options: [
        { id: "a", text: "a resposta do chatbot." },
        { id: "b", text: "um resumo em uma rede social." },
        { id: "c", text: "o site oficial da legislação federal (planalto.gov.br)." },
        { id: "d", text: "um vídeo sem fonte." },
      ],
      correctOptionId: "c",
      explanation: "O site oficial publica o texto das leis federais. As outras opções podem estar desatualizadas ou erradas.",
    },
    {
      id: "aval-q8",
      skill: "prompts",
      prompt: "Qual prompt preserva melhor a sua autoria num trabalho?",
      options: [
        { id: "a", text: "\"Reescreva meu texto do jeito que achar melhor.\"" },
        { id: "b", text: "\"Escreva o trabalho por mim sobre este tema.\"" },
        { id: "c", text: "\"Aponte problemas no meu texto e explique cada um; eu decido o que mudar.\"" },
        { id: "d", text: "\"Faça um texto parecido com o meu, só que melhor.\"" },
      ],
      correctOptionId: "c",
      explanation:
        "Pedir sugestões explicadas mantém você como autor: você entende cada mudança e decide. Nas outras opções, o texto passa a ser da IA.",
    },
    {
      id: "aval-q9",
      skill: "prompts",
      sample: {
        label: "Prompt",
        text: "Liste 5 ideias de projeto de extensão sobre reciclagem, em uma frase cada.",
      },
      prompt: "O que mais falta para este prompt ficar completo?",
      options: [
        { id: "a", text: "Formato." },
        { id: "b", text: "Contexto: quem você é, para quem é o projeto e com que recursos." },
        { id: "c", text: "Um ponto de exclamação." },
        { id: "d", text: "Nada, já está completo." },
      ],
      correctOptionId: "b",
      explanation:
        "O formato já está definido (5 ideias, uma frase cada). Falta contexto: curso, público do projeto, tempo e recursos mudam muito o que é viável.",
    },
    {
      id: "aval-q10",
      skill: "prompts",
      prompt: "\"Resuma o texto abaixo em 5 tópicos para eu revisar antes da prova\" é melhor que \"Resuma\" porque…",
      options: [
        { id: "a", text: "é mais educado." },
        { id: "b", text: "define o objetivo e o formato da resposta." },
        { id: "c", text: "obriga a IA a usar fontes oficiais." },
        { id: "d", text: "impede qualquer erro na resposta." },
      ],
      correctOptionId: "b",
      explanation:
        "O segundo prompt diz para que serve o resumo e como ele deve vir. Nenhum prompt impede erros: a verificação continua sendo sua.",
    },
    {
      id: "aval-q11",
      skill: "privacidade",
      scenario: "No estágio, você quer ajuda para responder a mensagem de um cliente que traz o nome e o telefone dele.",
      prompt: "O que fazer antes de usar a IA?",
      options: [
        { id: "a", text: "Colar a mensagem inteira, para a IA entender melhor." },
        { id: "b", text: "Remover os dados pessoais e seguir as regras da empresa sobre ferramentas de IA." },
        { id: "c", text: "Colar só o telefone, que é menos importante." },
        { id: "d", text: "Enviar um print da conversa." },
      ],
      correctOptionId: "b",
      explanation:
        "Os dados são do cliente. Anonimize antes de enviar e confira se a empresa permite a ferramenta. Um print expõe os mesmos dados.",
    },
    {
      id: "aval-q12",
      skill: "privacidade",
      prompt: "Qual destas informações a LGPD classifica como dado pessoal sensível?",
      options: [
        { id: "a", text: "O nome da escola onde a pessoa estudou." },
        { id: "b", text: "A convicção religiosa de uma pessoa." },
        { id: "c", text: "A cor do celular de alguém." },
        { id: "d", text: "O time de futebol favorito." },
      ],
      correctOptionId: "b",
      explanation:
        "A LGPD inclui convicção religiosa entre os dados sensíveis, junto com origem racial ou étnica, opinião política, saúde, vida sexual e dados genéticos ou biométricos.",
    },
  ],
};
