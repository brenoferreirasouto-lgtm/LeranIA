import type { Level, Question } from "./types";

// RASCUNHO para revisão da equipe — SP02 (quiz de nivelamento) e SP03 (direcionamento).

/** Alternativa presente em todas as questões: escolher é melhor que chutar. */
export const DONT_KNOW_OPTION_ID = "nao-sei";
const dontKnow = { id: DONT_KNOW_OPTION_ID, text: "Ainda não sei" };

/**
 * Faixas de nível — PROPOSTA PARA VALIDAÇÃO, não requisito aprovado.
 * Com 10 questões: até 4 acertos → iniciante; 5 a 7 → intermediário; 8 ou mais → avançado.
 */
export const LEVEL_RULES: { level: Level; maxPercent: number }[] = [
  { level: "iniciante", maxPercent: 40 },
  { level: "intermediario", maxPercent: 75 },
  { level: "avancado", maxPercent: 100 },
];

export const placementQuestions: Question[] = [
  {
    id: "niv-q1",
    skill: "conceitos",
    prompt: "O que uma IA generativa faz?",
    options: [
      { id: "a", text: "Cria conteúdo novo, como textos e imagens, a partir de um pedido." },
      { id: "b", text: "Só encontra páginas que já existem na internet." },
      { id: "c", text: "Só corrige erros de ortografia." },
      dontKnow,
    ],
    correctOptionId: "a",
    explanation: "IA generativa produz conteúdo novo a partir de um pedido.",
  },
  {
    id: "niv-q2",
    skill: "conceitos",
    prompt: "Quando um assistente de IA escreve uma resposta, ele…",
    options: [
      { id: "a", text: "consulta uma base de fatos verificados." },
      { id: "b", text: "gera o texto com base em padrões aprendidos, escolhendo continuações prováveis." },
      { id: "c", text: "copia o primeiro resultado de um buscador." },
      dontKnow,
    ],
    correctOptionId: "b",
    explanation: "Modelos de linguagem geram texto provável para o contexto; não conferem fatos.",
  },
  {
    id: "niv-q3",
    skill: "conceitos",
    prompt: "Por que um assistente sem acesso à internet pode errar sobre um fato da semana passada?",
    options: [
      { id: "a", text: "Porque o conhecimento dele vem de dados até uma data de corte." },
      { id: "b", text: "Porque ele está com defeito." },
      { id: "c", text: "Porque ele só funciona em inglês." },
      dontKnow,
    ],
    correctOptionId: "a",
    explanation: "Sem consulta externa, o modelo só sabe o que estava nos dados de treinamento.",
  },
  {
    id: "niv-q4",
    skill: "alucinacoes",
    prompt: "O que é uma \"alucinação\" de IA?",
    options: [
      { id: "a", text: "Uma informação falsa apresentada como se fosse verdadeira." },
      { id: "b", text: "Uma imagem com cores muito fortes." },
      { id: "c", text: "Quando a IA demora para responder." },
      dontKnow,
    ],
    correctOptionId: "a",
    explanation: "Alucinação é uma informação inventada ou errada apresentada com confiança.",
  },
  {
    id: "niv-q5",
    skill: "alucinacoes",
    prompt: "A IA citou um artigo com autor, ano e revista. Antes de usar a citação, você…",
    options: [
      { id: "a", text: "cita direto, porque tem todos os dados." },
      { id: "b", text: "procura o artigo em uma base confiável." },
      { id: "c", text: "pergunta à própria IA se o artigo é real." },
      dontKnow,
    ],
    correctOptionId: "b",
    explanation: "Referências podem ser inventadas; só uma fonte independente confirma.",
  },
  {
    id: "niv-q6",
    skill: "alucinacoes",
    prompt: "Qual destes é um sinal de alerta numa resposta de IA?",
    options: [
      { id: "a", text: "Um número muito preciso, sem fonte nem data." },
      { id: "b", text: "Uma explicação em linguagem simples." },
      { id: "c", text: "Uma resposta curta." },
      dontKnow,
    ],
    correctOptionId: "a",
    explanation: "Números precisos sem origem são um sinal comum de alucinação.",
  },
  {
    id: "niv-q7",
    skill: "prompts",
    prompt: "Qual destes prompts é mais completo?",
    options: [
      { id: "a", text: "Resumo de história." },
      {
        id: "b",
        text: "Estou estudando para uma prova sobre a Revolução Francesa. Resuma as causas em 5 tópicos curtos, em linguagem simples.",
      },
      { id: "c", text: "Fala tudo de história pra mim." },
      dontKnow,
    ],
    correctOptionId: "b",
    explanation: "O prompt B tem contexto, objetivo, formato e restrição.",
  },
  {
    id: "niv-q8",
    skill: "prompts",
    prompt: "Num prompt, a instrução \"responda em uma tabela com duas colunas\" define…",
    options: [
      { id: "a", text: "o formato da resposta." },
      { id: "b", text: "o contexto de quem pergunta." },
      { id: "c", text: "o objetivo do pedido." },
      dontKnow,
    ],
    correctOptionId: "a",
    explanation: "Tabela, lista, tamanho e tom fazem parte do formato.",
  },
  {
    id: "niv-q9",
    skill: "privacidade",
    prompt: "Qual destas informações não deve ir para um chat de IA?",
    options: [
      { id: "a", text: "Seu CPF e sua senha." },
      { id: "b", text: "Uma dúvida de matemática." },
      { id: "c", text: "Um texto seu sem dados pessoais." },
      dontKnow,
    ],
    correctOptionId: "a",
    explanation: "Documentos e senhas nunca devem ser enviados a uma ferramenta de chat.",
  },
  {
    id: "niv-q10",
    skill: "privacidade",
    prompt: "Para pedir ajuda com um caso real do estágio, o mais seguro é…",
    options: [
      { id: "a", text: "colar o documento inteiro para a IA entender melhor." },
      { id: "b", text: "anonimizar nomes e dados pessoais antes de enviar." },
      { id: "c", text: "mandar um print da tela." },
      dontKnow,
    ],
    correctOptionId: "b",
    explanation: "Anonimizar protege as pessoas envolvidas; um print expõe os mesmos dados.",
  },
];
