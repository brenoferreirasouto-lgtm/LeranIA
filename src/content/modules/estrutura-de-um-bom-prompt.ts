import type { Module } from "../types";

// RASCUNHO para revisão da equipe — U08.
export const estruturaDeUmBomPrompt: Module = {
  slug: "estrutura-de-um-bom-prompt",
  storyIds: ["U08"],
  title: "Estrutura de um bom prompt",
  summary: "Contexto, objetivo, formato e restrições: como transformar um pedido vago em uma instrução clara.",
  skill: "prompts",
  estimatedMinutes: 10,
  lesson: [
    {
      heading: "O que é um prompt",
      blocks: [
        {
          type: "paragraph",
          text: "Prompt é o pedido que você escreve para a IA. A qualidade da resposta depende muito da clareza do pedido: a ferramenta não sabe quem você é, para que precisa da resposta nem o que já sabe sobre o assunto.",
        },
      ],
    },
    {
      heading: "Os quatro elementos",
      blocks: [
        {
          type: "list",
          items: [
            "Contexto: quem você é, para que é a resposta e o que você já tem. Ex.: \"Sou estudante do 1º período e tenho prova na sexta.\"",
            "Objetivo: o que exatamente você quer. Ex.: \"Explique a fotossíntese.\"",
            "Formato: como a resposta deve vir: lista, tabela, tamanho, tom. Ex.: \"Em até 8 tópicos curtos.\"",
            "Restrições: o que evitar ou respeitar. Ex.: \"Não use termos em inglês.\"",
          ],
        },
      ],
    },
    {
      heading: "Do vago ao claro",
      blocks: [
        {
          type: "example",
          label: "Prompt vago",
          text: "Me fala sobre fotossíntese.",
          verdict: "ruim",
        },
        {
          type: "example",
          label: "Prompt com os quatro elementos",
          text: "Sou estudante do 1º período de Biologia e tenho prova na sexta. Explique a fotossíntese em até 8 tópicos curtos, com um exemplo do dia a dia em cada um. Não use termos em inglês. No fim, faça 3 perguntas para eu testar se entendi.",
          verdict: "bom",
        },
        {
          type: "paragraph",
          text: "O segundo pedido diz quem pergunta (contexto), o que quer (objetivo), como quer (formato) e o que evitar (restrições). A resposta tende a ser mais útil e mais fácil de conferir.",
        },
      ],
    },
    {
      heading: "Refine em conversa",
      blocks: [
        {
          type: "paragraph",
          text: "A primeira resposta não precisa ser a final. Peça ajustes específicos: \"reduza para 5 tópicos\", \"dê um exemplo\", \"explique como se eu nunca tivesse visto o assunto\".",
        },
        {
          type: "tip",
          title: "Deixe a IA perguntar primeiro",
          text: "Em pedidos maiores, comece com: \"Antes de responder, pergunte o que você precisa saber para fazer isso bem.\" Assim você completa o contexto que faltou.",
        },
      ],
    },
    {
      heading: "Contexto, sim. Dados pessoais, não",
      blocks: [
        {
          type: "paragraph",
          text: "Dar contexto não significa colar documentos com nomes, CPF ou informações de outras pessoas. Descreva a situação sem detalhes que identifiquem alguém. O módulo de privacidade mostra como.",
        },
      ],
    },
  ],
  practice: [
    {
      id: "prompt-q1",
      skill: "prompts",
      prompt: "Quais são os quatro elementos de um prompt bem estruturado, segundo esta aula?",
      options: [
        { id: "a", text: "Contexto, objetivo, formato e restrições." },
        { id: "b", text: "Título, introdução, desenvolvimento e conclusão." },
        { id: "c", text: "Pergunta, resposta, fonte e data." },
        { id: "d", text: "Tamanho, idioma, cor e fonte." },
      ],
      correctOptionId: "a",
      explanation:
        "Contexto diz quem pergunta e para quê; objetivo diz o que você quer; formato diz como a resposta deve vir; restrições dizem o que evitar.",
    },
    {
      id: "prompt-q2",
      skill: "prompts",
      sample: { label: "Prompt", text: "Faz um resumo." },
      prompt: "O que mais falta neste prompt?",
      options: [
        { id: "a", text: "Contexto e objetivo: resumo de quê, para quê e para quem." },
        { id: "b", text: "Um ponto de exclamação no final." },
        { id: "c", text: "Pedir \"por favor\"." },
        { id: "d", text: "Nada. Prompts curtos são sempre melhores." },
      ],
      correctOptionId: "a",
      explanation:
        "Sem dizer qual texto resumir, para que serve o resumo e para quem, a IA não tem como acertar o tamanho, o foco nem o tom. Educação não faz mal, mas não resolve a falta de informação.",
    },
    {
      id: "prompt-q3",
      skill: "prompts",
      prompt: "Qual prompt tende a gerar a resposta mais útil?",
      options: [
        { id: "a", text: "Ideias de TCC." },
        { id: "b", text: "Me dá ideias boas de TCC." },
        {
          id: "c",
          text: "Curso Sistemas de Informação e quero um tema de TCC sobre IA na educação. Liste 5 ideias que caibam em um semestre, com o problema que cada uma resolve, em uma frase cada.",
        },
        { id: "d", text: "Faça meu TCC sobre IA." },
      ],
      correctOptionId: "c",
      explanation:
        "A opção C tem contexto (curso e área), objetivo (tema de TCC), formato (5 ideias, uma frase cada) e restrição (caber em um semestre). A opção D pede que a IA faça o trabalho por você.",
    },
    {
      id: "prompt-q4",
      skill: "prompts",
      sample: {
        label: "Prompt",
        text: "Explique o que é a LGPD em até 5 frases, sem usar termos jurídicos.",
      },
      prompt: "Qual parte deste prompt é uma restrição?",
      options: [
        { id: "a", text: "\"Explique o que é a LGPD\"" },
        { id: "b", text: "\"em até 5 frases\"" },
        { id: "c", text: "\"sem usar termos jurídicos\"" },
        { id: "d", text: "O prompt não tem restrição." },
      ],
      correctOptionId: "c",
      explanation:
        "\"Explique o que é a LGPD\" é o objetivo e \"em até 5 frases\" define o formato (tamanho). \"Sem usar termos jurídicos\" diz o que evitar: é a restrição.",
    },
    {
      id: "prompt-q5",
      skill: "prompts",
      scenario: "A primeira resposta veio longa demais para o que você precisa.",
      prompt: "Qual é o melhor próximo passo?",
      options: [
        { id: "a", text: "Desistir e fazer tudo sozinho." },
        { id: "b", text: "Pedir um ajuste específico: \"Reduza para 5 tópicos de uma linha.\"" },
        { id: "c", text: "Usar só o primeiro parágrafo sem ler o resto." },
        { id: "d", text: "Repetir exatamente o mesmo prompt até a resposta mudar." },
      ],
      correctOptionId: "b",
      explanation:
        "Refinar em conversa com um pedido específico costuma resolver em uma mensagem. Repetir o mesmo prompt não diz à ferramenta o que precisa mudar.",
    },
  ],
};
