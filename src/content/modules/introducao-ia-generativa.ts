import type { Module } from "../types";

// RASCUNHO para revisão da equipe — SP01.
export const introducaoIaGenerativa: Module = {
  slug: "introducao-ia-generativa",
  storyIds: ["SP01"],
  title: "Introdução à IA generativa",
  summary: "O que é, como produz respostas, o que faz bem e quais são seus limites.",
  skill: "conceitos",
  estimatedMinutes: 8,
  lesson: [
    {
      heading: "O que é IA generativa",
      blocks: [
        {
          type: "paragraph",
          text: "IA generativa é o tipo de inteligência artificial que cria conteúdo novo a partir de um pedido: textos, imagens, áudios e até códigos. Assistentes de conversa (chatbots) e geradores de imagem são exemplos do dia a dia.",
        },
        {
          type: "paragraph",
          text: "Um buscador encontra páginas que já existem. Uma IA generativa produz uma resposta nova a cada pedido, mesmo quando o assunto já foi escrito mil vezes.",
        },
      ],
    },
    {
      heading: "Como um modelo de linguagem escreve uma resposta",
      blocks: [
        {
          type: "paragraph",
          text: "Os assistentes de texto usam modelos de linguagem. Eles foram treinados com uma quantidade enorme de textos e aprenderam padrões: quais palavras costumam aparecer juntas e em que contexto.",
        },
        {
          type: "paragraph",
          text: "Quando recebe o seu pedido, o modelo monta a resposta pedaço por pedaço, escolhendo a continuação mais provável para aquele contexto. Ele não consulta uma lista de fatos verificados antes de escrever.",
        },
        {
          type: "tip",
          title: "Por que isso importa",
          text: "Uma resposta bem escrita e confiante é resultado de padrões de linguagem. Isso não garante que a informação esteja correta.",
        },
      ],
    },
    {
      heading: "O que ela faz bem",
      blocks: [
        {
          type: "list",
          items: [
            "Gerar e organizar ideias para começar um trabalho.",
            "Resumir ou reescrever um texto em outro tom, tamanho ou formato.",
            "Explicar um conceito de outro jeito, com exemplos.",
            "Apontar possíveis erros em textos e códigos para você revisar.",
          ],
        },
      ],
    },
    {
      heading: "Limites que você precisa conhecer",
      blocks: [
        {
          type: "list",
          items: [
            "Pode inventar informações com aparência de verdade. Isso tem nome: alucinação.",
            "Pode não saber de fatos recentes. O conhecimento vem de dados até uma data de corte, a menos que a ferramenta consulte a internet.",
            "Pode repetir vieses que existem nos textos usados no treinamento.",
            "Não sabe o que você não contou: sem contexto, a resposta sai genérica.",
          ],
        },
      ],
    },
    {
      heading: "Quem decide é você",
      blocks: [
        {
          type: "paragraph",
          text: "A IA ajuda mais quando apoia o seu trabalho e você continua responsável pelo resultado: você define o objetivo, avalia a resposta, verifica o que é importante e decide o que usar.",
        },
        {
          type: "example",
          label: "Uso que mantém você no controle",
          text: "Peço ideias de temas para o trabalho, escolho uma e pesquiso fontes confiáveis sobre ela.",
          verdict: "bom",
        },
        {
          type: "example",
          label: "Uso que tira você do trabalho",
          text: "Copio a resposta inteira e entrego como se fosse minha, sem ler nem conferir.",
          verdict: "ruim",
        },
      ],
    },
  ],
  practice: [
    {
      id: "intro-q1",
      skill: "conceitos",
      prompt: "O que caracteriza uma IA generativa?",
      options: [
        { id: "a", text: "Ela cria conteúdo novo, como textos e imagens, a partir de um pedido." },
        { id: "b", text: "Ela só encontra páginas que já existem na internet." },
        { id: "c", text: "Ela consulta um banco de fatos verificados antes de cada resposta." },
        { id: "d", text: "Ela serve apenas para gerar imagens." },
      ],
      correctOptionId: "a",
      explanation:
        "IA generativa produz conteúdo novo (texto, imagem, áudio, código) a partir do pedido. Encontrar páginas existentes é o trabalho de um buscador, e ela não verifica fatos antes de responder.",
    },
    {
      id: "intro-q2",
      skill: "conceitos",
      prompt: "Como um modelo de linguagem escreve uma resposta?",
      options: [
        { id: "a", text: "Copia um texto pronto guardado para cada pergunta." },
        { id: "b", text: "Monta o texto pedaço por pedaço, escolhendo continuações prováveis para o contexto." },
        { id: "c", text: "Consulta especialistas humanos em tempo real." },
        { id: "d", text: "Sorteia palavras de um dicionário." },
      ],
      correctOptionId: "b",
      explanation:
        "O modelo aprendeu padrões de linguagem no treinamento e gera a resposta escolhendo a continuação mais provável. Por isso o texto soa natural mesmo quando a informação está errada.",
    },
    {
      id: "intro-q3",
      skill: "conceitos",
      scenario:
        "Você pergunta a um assistente sem acesso à internet quem venceu um campeonato que terminou na semana passada.",
      prompt: "O que é mais provável acontecer?",
      options: [
        { id: "a", text: "Ele sabe a resposta, porque aprende sozinho todos os dias." },
        { id: "b", text: "Ele pode não saber ou errar, porque o conhecimento dele vai até uma data de corte." },
        { id: "c", text: "Ele sempre avisa quando não sabe." },
        { id: "d", text: "Ele consulta automaticamente o site oficial do campeonato." },
      ],
      correctOptionId: "b",
      explanation:
        "Sem acesso à internet, o modelo só conhece o que estava nos dados até a data de corte. E ele nem sempre avisa: pode inventar um vencedor com toda a confiança.",
    },
    {
      id: "intro-q4",
      skill: "conceitos",
      prompt: "Qual destes usos mantém você no controle do trabalho?",
      options: [
        { id: "a", text: "Entregar o texto gerado sem ler." },
        { id: "b", text: "Pedir ideias de temas, escolher uma e pesquisar fontes confiáveis sobre ela." },
        { id: "c", text: "Deixar a IA escolher a conclusão do trabalho e não revisar." },
        { id: "d", text: "Usar a primeira resposta porque ela parece bem escrita." },
      ],
      correctOptionId: "b",
      explanation:
        "A IA ajudou a gerar ideias, mas a escolha, a pesquisa e a responsabilidade continuaram com você. Nas outras opções, a decisão foi entregue para a ferramenta.",
    },
    {
      id: "intro-q5",
      skill: "conceitos",
      prompt: "Uma resposta longa, bem escrita e confiante…",
      options: [
        { id: "a", text: "prova que a informação está correta." },
        { id: "b", text: "pode estar errada: o estilo vem de padrões de linguagem, não de verificação." },
        { id: "c", text: "só erra quando tem erros de português." },
        { id: "d", text: "é sempre melhor que uma resposta curta." },
      ],
      correctOptionId: "b",
      explanation:
        "Confiança e boa escrita não dizem nada sobre a veracidade. O modelo escreve bem porque aprendeu padrões de linguagem, inclusive quando a informação está errada.",
    },
  ],
};
