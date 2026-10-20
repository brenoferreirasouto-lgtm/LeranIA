import type { Module } from "../types";

// RASCUNHO para revisão da equipe — SP04.
export const alucinacoes: Module = {
  slug: "alucinacoes",
  storyIds: ["SP04"],
  title: "Como identificar alucinações",
  summary: "Por que a IA inventa informações, quais são os sinais de alerta e como checar antes de usar.",
  skill: "alucinacoes",
  estimatedMinutes: 10,
  lesson: [
    {
      heading: "O que é uma alucinação",
      blocks: [
        {
          type: "paragraph",
          text: "Alucinação é quando a IA apresenta uma informação falsa ou inventada como se fosse verdadeira: um número, uma citação, um autor, um link, um acontecimento.",
        },
      ],
    },
    {
      heading: "Por que acontece",
      blocks: [
        {
          type: "paragraph",
          text: "O modelo gera o texto mais provável para o contexto; ele não confere fatos. Quando falta informação, tende a preencher a lacuna com algo plausível em vez de dizer que não sabe.",
        },
      ],
    },
    {
      heading: "Sinais de alerta",
      blocks: [
        {
          type: "list",
          items: [
            "Números muito precisos sem fonte nem data.",
            "Referências (artigos, livros, leis) que você não encontra em nenhum outro lugar.",
            "Frases entre aspas atribuídas a pessoas reais.",
            "Detalhes muito específicos sobre temas pouco conhecidos.",
            "Links que não abrem ou levam a uma página sobre outro assunto.",
            "Respostas que mudam quando você repete a pergunta.",
          ],
        },
      ],
    },
    {
      heading: "Um exemplo",
      blocks: [
        {
          type: "example",
          label: "Resposta de um chatbot",
          text: "O romance O Cortiço, publicado em 1890, é uma das obras mais conhecidas de Machado de Assis.",
          verdict: "ruim",
        },
        {
          type: "paragraph",
          text: "O ano está certo, mas o autor não: O Cortiço é de Aluísio Azevedo. Um erro no meio de informações verdadeiras é difícil de perceber justamente porque o resto parece correto.",
        },
      ],
    },
    {
      heading: "Como checar",
      blocks: [
        {
          type: "list",
          items: [
            "Procure a informação em uma fonte confiável e independente da IA.",
            "Para artigos, busque o título e os autores no Google Acadêmico ou na base da biblioteca.",
            "Peça a fonte e abra a fonte você mesmo. Perguntar \"isso é verdade?\" ao mesmo chatbot não é verificação.",
            "Quando a IA resumir um texto, compare o resumo com o original.",
          ],
        },
        {
          type: "tip",
          title: "Regra prática",
          text: "Quanto mais uma informação vai pesar no seu trabalho, mais ela precisa ser verificada.",
        },
      ],
    },
  ],
  practice: [
    {
      id: "aluc-q1",
      skill: "alucinacoes",
      sample: {
        label: "Resposta de um chatbot",
        text: "Segundo Silva e Costa (2021), na Revista Brasileira de Educação Digital, 78% dos professores já usam IA em sala de aula.",
      },
      prompt: "Você quer citar esse estudo no seu trabalho. O que fazer primeiro?",
      options: [
        { id: "a", text: "Citar, porque tem autor, ano e revista." },
        { id: "b", text: "Procurar o artigo pelo título e pelos autores em uma base acadêmica." },
        { id: "c", text: "Perguntar ao chatbot se o estudo é real e confiar na resposta." },
        { id: "d", text: "Arredondar para 80%, que é mais fácil de lembrar." },
      ],
      correctOptionId: "b",
      explanation:
        "Autor, ano e revista dão aparência de credibilidade, mas podem ter sido inventados. Só a busca em uma fonte independente confirma que o estudo existe e diz isso mesmo.",
    },
    {
      id: "aluc-q2",
      skill: "alucinacoes",
      prompt: "Qual destes é um sinal de alerta de possível alucinação?",
      options: [
        { id: "a", text: "A resposta diz que não tem certeza e sugere conferir." },
        { id: "b", text: "Um número muito preciso, sem fonte nem data." },
        { id: "c", text: "A resposta usa linguagem simples." },
        { id: "d", text: "A resposta vem organizada em lista." },
      ],
      correctOptionId: "b",
      explanation:
        "Números precisos sem origem são um dos sinais mais comuns. Admitir incerteza é um bom sinal, e linguagem simples ou listas não dizem nada sobre a veracidade.",
    },
    {
      id: "aluc-q3",
      skill: "alucinacoes",
      sample: {
        label: "Resposta de um chatbot",
        text: "Vidas Secas, romance de Jorge Amado publicado em 1938, retrata uma família de retirantes no sertão nordestino.",
      },
      prompt: "O que está errado nessa resposta?",
      options: [
        { id: "a", text: "O ano de publicação." },
        { id: "b", text: "O autor: Vidas Secas é de Graciliano Ramos." },
        { id: "c", text: "O tema do livro." },
        { id: "d", text: "Nada, está tudo certo." },
      ],
      correctOptionId: "b",
      explanation:
        "Vidas Secas foi publicado em 1938 e retrata uma família de retirantes, mas o autor é Graciliano Ramos. É o padrão típico: um dado errado escondido entre dados certos.",
    },
    {
      id: "aluc-q4",
      skill: "alucinacoes",
      prompt: "Por que perguntar \"isso é verdade?\" ao mesmo chatbot não é uma verificação suficiente?",
      options: [
        { id: "a", text: "Porque ele pode confirmar a informação errada com a mesma confiança." },
        { id: "b", text: "Porque é falta de educação desconfiar." },
        { id: "c", text: "Porque ele sempre responde que não." },
        { id: "d", text: "Porque isso só funciona em inglês." },
      ],
      correctOptionId: "a",
      explanation:
        "O chatbot gera a resposta do mesmo jeito que gerou a primeira. Verificar é consultar uma fonte independente, como um site oficial, um livro ou uma base acadêmica.",
    },
    {
      id: "aluc-q5",
      skill: "alucinacoes",
      scenario:
        "Você pediu para a IA resumir um texto da disciplina. O resumo traz uma conclusão que você não lembra de ter lido.",
      prompt: "O que fazer?",
      options: [
        { id: "a", text: "Usar o resumo: a IA leu o texto inteiro." },
        { id: "b", text: "Conferir no texto original se essa conclusão aparece." },
        { id: "c", text: "Apagar só essa frase e usar o resto sem conferir." },
        { id: "d", text: "Pedir um resumo maior." },
      ],
      correctOptionId: "b",
      explanation:
        "Mesmo com o texto em mãos, a IA pode acrescentar ideias que não estão nele. Se uma frase foi inventada, outras também podem ter sido: compare com o original.",
    },
  ],
};
