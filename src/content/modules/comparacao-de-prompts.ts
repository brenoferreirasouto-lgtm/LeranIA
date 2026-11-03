import type { Module } from "../types";

// RASCUNHO para revisão da equipe — SP07 (menu de comparação de prompts).
export const comparacaoDePrompts: Module = {
  slug: "comparacao-de-prompts",
  storyIds: ["SP07"],
  title: "Comparar prompts bons e ruins",
  summary: "Pares de prompts com o mesmo objetivo: escolha o mais eficiente e entenda o que faz a diferença.",
  skill: "prompts",
  estimatedMinutes: 6,
  relatedTool: {
    href: "/construtor",
    label: "Montar um prompt no construtor",
    description: "Depois de comparar, monte o seu passo a passo: contexto, objetivo, formato e restrições.",
  },
  lesson: [
    {
      heading: "O que olhar ao comparar dois prompts",
      blocks: [
        {
          type: "paragraph",
          text: "Dois pedidos com o mesmo objetivo podem gerar respostas muito diferentes. Ao comparar, pergunte qual deles deixa menos coisas para a IA adivinhar.",
        },
        {
          type: "list",
          items: [
            "Objetivo: diz exatamente o que você quer?",
            "Contexto: conta para quem é e em que situação?",
            "Formato: define tamanho, estrutura ou tom da resposta?",
            "Restrições: diz o que evitar?",
            "Autoria: deixa as decisões importantes com você?",
            "Verificação: pede algo que você consegue conferir depois?",
          ],
        },
      ],
    },
    {
      heading: "Um par para começar",
      blocks: [
        { type: "example", label: "Prompt A", text: "Me explica química.", verdict: "ruim" },
        {
          type: "example",
          label: "Prompt B",
          text: "Tenho prova de Química sobre ligações iônicas e covalentes na quinta. Explique a diferença entre as duas em até 6 tópicos, com um exemplo de cada, e termine com 3 perguntas para eu me testar.",
          verdict: "bom",
        },
        {
          type: "paragraph",
          text: "O prompt B define o assunto exato, a situação, o formato e ainda pede perguntas de revisão. O A deixa tudo para a IA decidir, e a resposta tende a ser genérica.",
        },
      ],
    },
  ],
  practice: [
    {
      id: "comp-q1",
      skill: "prompts",
      scenario: "Objetivo: entender um conceito de programação.",
      prompt: "Qual prompt é mais eficiente?",
      optionStyle: "prompt",
      options: [
        {
          id: "a",
          text: "Sou iniciante em programação e estou aprendendo Python. Explique o que é um laço for com um exemplo curto, comentado linha a linha.",
        },
        { id: "b", text: "for python" },
      ],
      correctOptionId: "a",
      explanation:
        "O prompt A diz o nível de quem pergunta, a linguagem, o conceito e o formato (exemplo curto e comentado). O B obriga a IA a adivinhar o que você quer saber.",
    },
    {
      id: "comp-q2",
      skill: "prompts",
      scenario: "Objetivo: melhorar um texto que você escreveu.",
      prompt: "Qual prompt é mais eficiente e preserva a sua autoria?",
      optionStyle: "prompt",
      options: [
        { id: "a", text: "Corrija meu texto e deixe ele melhor." },
        {
          id: "b",
          text: "Revise o texto abaixo, que é a introdução de um relatório da faculdade. Aponte erros de gramática e trechos confusos e explique cada sugestão. Não reescreva o texto inteiro: quero decidir o que mudar.",
        },
      ],
      correctOptionId: "b",
      explanation:
        "O B dá contexto (relatório da faculdade), objetivo (gramática e clareza), formato (sugestões explicadas) e uma restrição que mantém as decisões com você. O A troca o seu texto pelo da IA.",
    },
    {
      id: "comp-q3",
      skill: "prompts",
      scenario: "Objetivo: preparar uma apresentação de 10 minutos.",
      prompt: "Qual prompt é mais eficiente?",
      optionStyle: "prompt",
      options: [
        {
          id: "a",
          text: "Vou apresentar sobre reciclagem para uma turma do ensino médio, em 10 minutos. Sugira 3 formas de abrir a apresentação e uma estrutura em 5 partes. O conteúdo eu escrevo.",
        },
        { id: "b", text: "Faça minha apresentação sobre reciclagem." },
      ],
      correctOptionId: "a",
      explanation:
        "O A informa público, duração e o tipo de ajuda (aberturas e estrutura), deixando o conteúdo com você. O B pede que a IA faça o trabalho inteiro, sem saber para quem é.",
    },
    {
      id: "comp-q4",
      skill: "prompts",
      scenario: "Objetivo: encontrar fontes para um trabalho sobre IA na educação.",
      prompt: "Qual prompt é mais eficiente?",
      optionStyle: "prompt",
      options: [
        { id: "a", text: "Liste 5 artigos científicos sobre o uso de IA na educação, com os links." },
        {
          id: "b",
          text: "Quais termos de busca e bases acadêmicas eu posso usar para encontrar artigos sobre IA na educação? Explique como filtrar artigos revisados por pares.",
        },
      ],
      correctOptionId: "b",
      explanation:
        "Pedir artigos prontos com links é um convite à alucinação: referências podem ser inventadas. O B usa a IA para a estratégia de busca, e você encontra as fontes reais nas bases.",
    },
    {
      id: "comp-q5",
      skill: "prompts",
      scenario: "Objetivo: estudar o conteúdo de um texto da disciplina.",
      prompt: "Qual prompt é mais eficiente?",
      optionStyle: "prompt",
      options: [
        { id: "a", text: "Resuma." },
        {
          id: "b",
          text: "Resuma o texto abaixo em 5 tópicos para eu revisar antes da prova. Indique em cada tópico o trecho do texto de onde ele saiu.",
        },
      ],
      correctOptionId: "b",
      explanation:
        "O B define objetivo, formato e pede o trecho de origem de cada tópico, o que facilita conferir se o resumo é fiel ao texto.",
    },
  ],
};
