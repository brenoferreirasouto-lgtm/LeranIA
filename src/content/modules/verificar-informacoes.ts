import type { Module } from "../types";

// RASCUNHO para revisão da equipe — SP08 (verificar informações produzidas por IA).
export const verificarInformacoes: Module = {
  slug: "verificar-informacoes",
  storyIds: ["SP08"],
  title: "Verificar informações produzidas por IA",
  summary: "Um roteiro para checar fontes antes de usar uma resposta, e onde procurar cada tipo de informação.",
  skill: "verificacao",
  estimatedMinutes: 8,
  lesson: [
    {
      heading: "Por que verificar",
      blocks: [
        {
          type: "paragraph",
          text: "Uma resposta de IA é um ponto de partida, não uma fonte. Antes de usar um dado num trabalho, numa decisão ou numa mensagem para outras pessoas, confirme de onde ele veio.",
        },
      ],
    },
    {
      heading: "Roteiro de verificação",
      blocks: [
        {
          type: "checklist",
          title: "Antes de usar uma informação",
          items: [
            "Identifique o que precisa ser checado: números, datas, nomes, citações e leis.",
            "Procure a fonte original: o site oficial, o artigo, a lei ou o livro.",
            "Confirme em pelo menos uma fonte confiável e independente da IA.",
            "Confira a data: a informação ainda vale hoje?",
            "Desconfie de links que não abrem ou que falam de outro assunto.",
            "Anote a fonte que você usou, para citar e para conferir depois.",
          ],
        },
      ],
    },
    {
      heading: "Onde procurar",
      blocks: [
        {
          type: "list",
          items: [
            "Leis federais: o site oficial da legislação (planalto.gov.br).",
            "Dados oficiais do Brasil: o IBGE e os sites dos órgãos públicos responsáveis.",
            "Artigos científicos: Google Acadêmico, SciELO e o Portal de Periódicos da CAPES.",
            "Notícias: veículos que mostram autor e data, e agências de checagem.",
          ],
        },
        {
          type: "tip",
          title: "Uma fonte que só repete a IA não conta",
          text: "Se a informação só aparece em sites sem autor nem referência, ela ainda não está verificada. Procure a origem.",
        },
      ],
    },
  ],
  practice: [
    {
      id: "verif-q1",
      skill: "verificacao",
      scenario: "A IA afirmou que a Lei Geral de Proteção de Dados é a Lei nº 13.709/2018.",
      prompt: "Qual é a forma mais confiável de confirmar?",
      options: [
        { id: "a", text: "Perguntar a outro chatbot." },
        { id: "b", text: "Buscar a lei no site oficial da legislação federal." },
        { id: "c", text: "Aceitar, porque número de lei parece oficial." },
        { id: "d", text: "Procurar a resposta em um fórum de perguntas." },
      ],
      correctOptionId: "b",
      explanation:
        "O texto oficial da lei é a fonte original. Outro chatbot e fóruns podem repetir o mesmo erro, e um número com cara de oficial pode ter sido inventado.",
    },
    {
      id: "verif-q2",
      skill: "verificacao",
      scenario: "A IA informou a população de uma cidade \"segundo dados recentes\", sem dizer a fonte.",
      prompt: "O que você precisa conferir?",
      options: [
        { id: "a", text: "Só se o número parece razoável." },
        { id: "b", text: "A fonte oficial do dado e a data em que ele foi publicado." },
        { id: "c", text: "Se outras pessoas já compartilharam esse número." },
        { id: "d", text: "Nada: dados recentes são sempre confiáveis." },
      ],
      correctOptionId: "b",
      explanation:
        "\"Recentes\" sem data e sem fonte não diz nada. Dados populacionais vêm de órgãos oficiais, como o IBGE, e mudam com o tempo.",
    },
    {
      id: "verif-q3",
      skill: "verificacao",
      scenario: "Você só encontrou a informação da IA em um blog sem autor e sem referências.",
      prompt: "A informação está verificada?",
      options: [
        { id: "a", text: "Sim, porque apareceu em outro lugar além da IA." },
        { id: "b", text: "Não. É preciso encontrar a fonte original ou uma fonte confiável." },
        { id: "c", text: "Sim, se o blog tiver muitas visitas." },
        { id: "d", text: "Depende do tamanho do texto do blog." },
      ],
      correctOptionId: "b",
      explanation:
        "Um site sem autoria nem referências pode ter copiado a mesma informação errada. Verificar é chegar à origem ou a uma fonte que responda pelo que publica.",
    },
    {
      id: "verif-q4",
      skill: "verificacao",
      prompt: "Para confirmar se um artigo científico citado pela IA existe, a melhor fonte é…",
      options: [
        { id: "a", text: "uma base acadêmica, como o Google Acadêmico ou a SciELO." },
        { id: "b", text: "uma rede social." },
        { id: "c", text: "a própria IA que citou o artigo." },
        { id: "d", text: "um site de resumos sem autor." },
      ],
      correctOptionId: "a",
      explanation:
        "Bases acadêmicas indexam artigos publicados. Se o título e os autores não aparecem em nenhuma delas, a referência pode ter sido inventada.",
    },
    {
      id: "verif-q5",
      skill: "verificacao",
      prompt: "Por que anotar a fonte que você usou para verificar?",
      options: [
        { id: "a", text: "Para você e outras pessoas poderem conferir depois e citar corretamente." },
        { id: "b", text: "Porque o trabalho fica mais longo." },
        { id: "c", text: "Para a IA aprender com a sua fonte." },
        { id: "d", text: "Não é necessário anotar." },
      ],
      correctOptionId: "a",
      explanation:
        "A fonte anotada permite que qualquer pessoa refaça a checagem, e é o que você cita no trabalho. A IA não aprende com o que você anota.",
    },
  ],
};
