import type { ProjectTemplate } from "./types";

// RASCUNHO para revisão da equipe — modelos de referência do Laboratório de
// Projetos Autorais (SP26, ADR 0002). Cada modelo cria as etapas e as tarefas
// sugeridas de um projeto novo; a pessoa ajusta tudo depois.

export const projectTemplates: ProjectTemplate[] = [
  {
    id: "seminario",
    title: "Seminário ou trabalho escolar",
    summary: "Para apresentar ou entregar um trabalho sobre um tema pedido pela escola.",
    stages: [
      {
        title: "Entender o tema",
        tasks: ["Ler o enunciado e anotar o que o professor pede", "Listar o que você já sabe e o que precisa descobrir"],
      },
      {
        title: "Pesquisar",
        tasks: ["Encontrar pelo menos duas fontes confiáveis", "Conferir datas, números e citações nas fontes originais"],
      },
      {
        title: "Produzir",
        tasks: ["Montar o roteiro com introdução, desenvolvimento e conclusão", "Escrever com as suas palavras"],
      },
      {
        title: "Revisar e apresentar",
        tasks: ["Revisar o texto em voz alta", "Ensaiar a apresentação no tempo pedido"],
      },
    ],
  },
  {
    id: "pesquisa",
    title: "Projeto de pesquisa",
    summary: "Para investigar uma pergunta com fontes e chegar a uma conclusão fundamentada.",
    stages: [
      {
        title: "Pergunta de pesquisa",
        tasks: ["Escrever a pergunta em uma frase", "Explicar por que ela importa"],
      },
      {
        title: "Levantamento",
        tasks: ["Buscar artigos no Google Acadêmico ou na SciELO", "Registrar autor, ano e link de cada fonte"],
      },
      {
        title: "Análise",
        tasks: ["Comparar o que as fontes dizem", "Separar o que é dado do que é opinião"],
      },
      {
        title: "Conclusão",
        tasks: ["Responder à pergunta com base nas fontes", "Listar os limites do trabalho"],
      },
    ],
  },
  {
    id: "pratico",
    title: "Projeto prático",
    summary: "Para criar algo que resolva um problema real: um app, uma campanha, um produto.",
    stages: [
      {
        title: "Problema e público",
        tasks: ["Descrever quem tem o problema", "Conversar com pelo menos uma pessoa do público"],
      },
      {
        title: "Ideias",
        tasks: ["Listar pelo menos três ideias de solução", "Escolher uma e explicar por quê"],
      },
      {
        title: "Protótipo",
        tasks: ["Fazer uma primeira versão simples", "Mostrar para alguém e anotar o retorno"],
      },
      {
        title: "Melhoria",
        tasks: ["Ajustar com base no retorno", "Registrar o que mudou e por quê"],
      },
    ],
  },
];

export function findProjectTemplate(id: string): ProjectTemplate | undefined {
  return projectTemplates.find((t) => t.id === id);
}
