export type Skill = "Fundamentos" | "Prompting" | "Pensamento crítico" | "Privacidade" | "Autoria"
export type Level = "Iniciante" | "Intermediário" | "Avançado"
export type LessonSection = {
  title: string
  body: string
}

export type LearningCategory = "Fundamentos" | "Domínio de prompts" | "Pesquisa, análise e produtividade" | "Aplicações por profissão" | "Ferramentas e automação" | "Projetos autorais"

export type ProfessionalExample = {
  title: string
  prompt: string
  review: string
}

export type LessonDemonstration = {
  startingPrompt: string
  structuredPrompt: string
  analysis: string
}

export type LessonReference = {
  label: string
  url: string
}

export type Lesson = {
  id: string
  number: number
  title: string
  category: LearningCategory
  description: string
  duration: string
  skill: Skill
  objective: string
  sections: LessonSection[]
  practice: string
  quizId: string
  objectives?: string[]
  examples?: ProfessionalExample[]
  demonstration?: LessonDemonstration
  challenge?: string
  checklist?: string[]
  nextCapability?: string
  references?: LessonReference[]
}

export const learningCategories: LearningCategory[] = [
  "Fundamentos",
  "Domínio de prompts",
  "Pesquisa, análise e produtividade",
  "Aplicações por profissão",
  "Ferramentas e automação",
  "Projetos autorais",
]

export type Question = {
  prompt: string
  options: string[]
  answer: number
  explanations: string[]
  topic: string
}

export const lessons: Lesson[] = [
  {
    id: "generative-ai",
    number: 1,
    title: "IA generativa sem mistério",
    category: "Fundamentos",
    description: "Entenda o que esses sistemas fazem — e o que não fazem.",
    duration: "8 min",
    skill: "Fundamentos",
    objective:
      "Descrever, em linguagem simples, como um modelo generativo produz uma resposta.",
    sections: [
      {
        title: "Prever para gerar",
        body: "Um modelo generativo identifica padrões nos dados usados em seu treinamento e usa esses padrões para produzir uma continuação plausível para a instrução recebida. Ele não consulta automaticamente uma fonte confiável nem compreende o mundo como uma pessoa.",
      },
      {
        title: "Uma conversa é uma colaboração",
        body: "A qualidade do resultado depende da tarefa, do contexto que você fornece e da revisão que faz depois. Trate a resposta como um rascunho que merece avaliação, não como uma decisão pronta.",
      },
    ],
    practice:
      "Explique um uso de IA que você já viu. Que parte poderia ser automatizada e onde uma pessoa ainda precisa revisar?",
    quizId: "foundations",
  },
  {
    id: "limitations",
    number: 2,
    title: "Limitações e alucinações",
    category: "Fundamentos",
    description:
      "Reconheça quando uma resposta convincente precisa de checagem.",
    duration: "7 min",
    skill: "Pensamento crítico",
    objective:
      "Identificar sinais de uma afirmação não verificada e decidir o próximo passo.",
    sections: [
      {
        title: "Fluência não é evidência",
        body: "Um texto claro e confiante pode conter erros, referências inventadas ou informações desatualizadas. A forma da resposta não comprova que seu conteúdo seja verdadeiro.",
      },
      {
        title: "Reduza o risco",
        body: "Peça que a ferramenta separe fatos de suposições e indique o que precisa ser conferido. Depois, localize a informação em fontes primárias ou independentes e confira autoria, contexto e data.",
      },
    ],
    practice:
      "Escolha uma afirmação importante de uma resposta de IA e descreva qual fonte independente você consultaria para verificá-la.",
    quizId: "hallucinations",
  },
  {
    id: "privacy",
    number: 3,
    title: "Privacidade antes do prompt",
    category: "Fundamentos",
    description: "Decida quais informações não devem sair do seu controle.",
    duration: "6 min",
    skill: "Privacidade",
    objective:
      "Reduzir a exposição de dados pessoais, confidenciais ou identificáveis.",
    sections: [
      {
        title: "Compartilhe só o necessário",
        body: "Antes de colar um texto em uma ferramenta, procure nomes, dados de contato, identificadores, documentos e informações internas. Remova ou substitua os detalhes que não são necessários para a tarefa.",
      },
      {
        title: "Confira as regras da ferramenta",
        body: "As condições de retenção e uso de dados variam por produto e configuração. Para dados de estudo, clientes ou trabalho, siga as políticas da sua instituição e use apenas ferramentas autorizadas.",
      },
    ],
    practice:
      "Reescreva um pedido de ajuda retirando os dados pessoais que não mudam a tarefa. Não inclua dados reais neste exercício.",
    quizId: "privacy",
  },
  {
    id: "prompting",
    number: 4,
    title: "Anatomia de um bom prompt",
    category: "Domínio de prompts",
    description: "Transforme uma ideia vaga em uma instrução útil e revisável.",
    duration: "9 min",
    skill: "Prompting",
    objective:
      "Estruturar um pedido com contexto, objetivo, público, formato e critérios.",
    sections: [
      {
        title: "Dê contexto e propósito",
        body: "Diga o que está tentando resolver, para quem é o resultado e quais informações a ferramenta pode usar. Se algo for desconhecido, diga isso em vez de pedir que o modelo adivinhe.",
      },
      {
        title: "Defina o resultado esperado",
        body: "Peça um formato, um nível de detalhe e critérios de qualidade. Inclua limites relevantes e convide a ferramenta a fazer perguntas quando faltar informação essencial.",
      },
    ],
    practice:
      "Use o Construtor de prompts para desenvolver uma instrução que resolva uma tarefa real, sem dados pessoais ou confidenciais.",
    quizId: "prompt-comparison",
  },
  {
    id: "verification",
    number: 5,
    title: "Verifique antes de compartilhar",
    category: "Pesquisa, análise e produtividade",
    description: "Use um processo simples para conferir respostas importantes.",
    duration: "7 min",
    skill: "Pensamento crítico",
    objective:
      "Aplicar uma lista de verificação proporcional ao impacto de uma afirmação.",
    sections: [
      {
        title: "Isole as afirmações",
        body: "Divida a resposta em afirmações que possam ser conferidas. Priorize dados, citações, recomendações e alegações que influenciem uma decisão ou possam causar dano.",
      },
      {
        title: "Busque evidência independente",
        body: "Abra as fontes, não apenas os resumos. Confira se a fonte sustenta a afirmação, quem a produziu, quando foi publicada e se outra fonte confiável chega à mesma conclusão.",
      },
    ],
    practice:
      "Marque quais partes de uma resposta precisariam de confirmação antes de serem usadas em um trabalho acadêmico ou profissional.",
    quizId: "verification",
  },
  {
    id: "responsible-use",
    number: 6,
    title: "Use IA com responsabilidade",
    category: "Fundamentos",
    description:
      "Mantenha julgamento, transparência e autoria no centro do trabalho.",
    duration: "6 min",
    skill: "Autoria",
    objective:
      "Revisar um resultado de IA considerando qualidade, impacto e responsabilidade humana.",
    sections: [
      {
        title: "A autoria continua com você",
        body: "A ferramenta pode apoiar exploração e revisão; você continua responsável por escolher o que usar, conferir os resultados e respeitar as regras de autoria e transparência do contexto.",
      },
      {
        title: "Considere quem pode ser afetado",
        body: "Procure erros, vieses e dados expostos. Quando o resultado afeta outras pessoas, aumente o cuidado, peça revisão adequada e não delegue decisões importantes apenas ao modelo.",
      },
    ],
    practice:
      "Antes de usar um resultado, escreva uma frase sobre o que você verificou e qual decisão permaneceu sob seu julgamento.",
    quizId: "responsible-use",
  },
  {
    id: "advanced-prompting",
    number: 7,
    title: "Prompting avançado e engenharia de contexto",
    category: "Domínio de prompts",
    description:
      "Construa instruções complexas com contexto relevante, limites claros e ciclos de revisão.",
    duration: "20 min",
    skill: "Prompting",
    objective:
      "Planejar, testar e refinar uma instrução profissional usando critérios observáveis.",
    objectives: [
      "Separar contexto útil de informação desnecessária ou sensível.",
      "Definir tarefa, público, limites, formato e critérios de qualidade.",
      "Refinar o prompt comparando a saída com critérios definidos antes do teste.",
    ],
    sections: [
      {
        title: "Contexto que ajuda a decidir",
        body: "Inclua apenas os dados que mudam a resposta: situação, público, objetivo, materiais disponíveis e restrições. Se faltar uma informação essencial, instrua a ferramenta a perguntar em vez de completar a lacuna por conta própria.",
      },
      {
        title: "Exemplos e limites",
        body: "Um exemplo curto pode demonstrar tom ou estrutura; uma restrição pode delimitar tamanho, fontes ou decisões que a ferramenta não deve tomar. Não use exemplos como substitutos de critérios nem envie conteúdo confidencial sem autorização.",
      },
      {
        title: "Iterar com um critério por vez",
        body: "Compare a resposta com uma lista de requisitos. Mude uma instrução por rodada, verifique o efeito e guarde o que melhorou. Uma saída mais longa não é automaticamente melhor.",
      },
    ],
    examples: [
      {
        title: "Plano de integração de equipe",
        prompt:
          "Proponha uma agenda de integração de 45 minutos para novos atendentes. Use somente os tópicos fornecidos, organize por tempo e marque qualquer informação que ainda precise de confirmação.",
        review:
          "Confira duração, cobertura dos tópicos e lacunas; não acrescente políticas que não foram fornecidas.",
      },
    ],
    demonstration: {
      startingPrompt: "Crie um treinamento de atendimento.",
      structuredPrompt:
        "Contexto: equipe nova de atendimento, treinamento remoto de 45 minutos. Tarefa: criar uma agenda usando apenas os tópicos listados. Público: pessoas iniciantes. Saída: tabela com tempo, atividade e objetivo. Limites: não inventar políticas; sinalizar lacunas. Critérios: caber em 45 minutos e incluir prática.",
      analysis:
        "A segunda versão reduz ambiguidades, pede uma estrutura verificável e explicita como lidar com dados ausentes. Compare as duas respostas com os mesmos critérios.",
    },
    practice:
      "Resolva a mesma tarefa primeiro com uma instrução básica e depois com uma instrução estruturada. Registre o que mudou em clareza, utilidade e necessidade de revisão.",
    challenge:
      "Entregue uma comparação com o prompt inicial, o prompt revisado, três critérios de avaliação e uma decisão explicada sobre qual saída você usaria.",
    checklist: [
      "O contexto incluído é necessário e não contém dados confidenciais.",
      "O objetivo, o público e o formato estão explícitos.",
      "Os limites dizem como tratar lacunas e suposições.",
      "A revisão compara a resposta com critérios definidos antes do teste.",
    ],
    nextCapability:
      "Você poderá iterar sobre uma instrução complexa sem confundir mais contexto com melhor contexto.",
    quizId: "advanced-prompting",
  },
  {
    id: "research-synthesis",
    number: 8,
    title: "Pesquisa, síntese e análise crítica com IA",
    category: "Pesquisa, análise e produtividade",
    description:
      "Organize materiais, compare perspectivas e identifique afirmações que exigem verificação.",
    duration: "20 min",
    skill: "Pensamento crítico",
    objective:
      "Produzir uma síntese rastreável que diferencie evidência, interpretação e lacunas.",
    objectives: [
      "Delimitar uma pergunta de pesquisa e os materiais que podem respondê-la.",
      "Separar afirmações apoiadas pelo material de inferências e informações ausentes.",
      "Verificar fontes diretamente antes de citar ou compartilhar uma conclusão.",
    ],
    sections: [
      {
        title: "Comece pela pergunta e pelo material",
        body: "Defina o que quer descobrir e entregue à ferramenta um conjunto delimitado de textos que você pode consultar. Peça que a resposta identifique de qual trecho veio cada ponto; a IA não transforma uma fonte fraca em evidência confiável.",
      },
      {
        title: "Sintetize sem apagar diferenças",
        body: "Uma boa síntese organiza convergências, divergências e limites. Peça uma coluna para evidência, outra para interpretação e outra para dúvidas; não una perspectivas incompatíveis em uma conclusão artificialmente simples.",
      },
      {
        title: "Verifique as afirmações importantes",
        body: "Abra os materiais originais, confira se sustentam a afirmação e registre data, contexto e autoria. Referências que a ferramenta menciona, mas que não estão nos materiais fornecidos, precisam ser localizadas de forma independente.",
      },
    ],
    examples: [
      {
        title: "Síntese de documentos de projeto",
        prompt:
          "Com base somente nos dois trechos fornecidos, liste os pontos em comum, as divergências e as perguntas sem resposta. Para cada ponto, indique o trecho de apoio; não complete lacunas com conhecimento externo.",
        review:
          "Confira cada trecho no documento original e mantenha explícitas as divergências entre materiais.",
      },
    ],
    demonstration: {
      startingPrompt: "Resuma este tema e traga fontes.",
      structuredPrompt:
        "Use apenas os três excertos anexados para responder à pergunta definida. Monte uma tabela com afirmação, trecho de apoio, divergência e lacuna. Não crie referências; marque como 'não localizado nos materiais' o que não tiver suporte.",
      analysis:
        "A versão estruturada limita a base, exige rastreabilidade e impede que uma síntese pareça pesquisa externa quando ela não ocorreu.",
    },
    practice:
      "Use dois pequenos materiais de estudo que você possa compartilhar. Liste uma conclusão apoiada, uma divergência e uma afirmação que ainda precisaria ser checada em fonte primária.",
    challenge:
      "Entregue uma matriz de síntese com pergunta, afirmações, trechos de apoio, divergências e próximos passos de verificação.",
    checklist: [
      "A pergunta de pesquisa está delimitada.",
      "Cada conclusão aponta para material que pode ser aberto e conferido.",
      "Inferências e lacunas estão identificadas, não ocultadas.",
      "As fontes originais foram consultadas antes de compartilhar a síntese.",
    ],
    nextCapability:
      "Você poderá transformar um conjunto de materiais em uma síntese rastreável, sem delegar a verificação à ferramenta.",
    quizId: "research-synthesis",
  },
  {
    id: "professional-writing",
    number: 9,
    title: "Escrita e comunicação profissional com IA",
    category: "Pesquisa, análise e produtividade",
    description:
      "Use IA para revisar comunicação sem perder precisão, contexto, tom ou autoria.",
    duration: "18 min",
    skill: "Autoria",
    objective:
      "Adaptar um rascunho a um público e propósito definidos e revisar cada afirmação antes do uso.",
    objectives: [
      "Definir propósito, destinatário, canal e tom antes de gerar um rascunho.",
      "Preservar fatos e decisões do autor em e-mails, relatórios e propostas.",
      "Revisar clareza, precisão, acessibilidade e adequação ao contexto.",
    ],
    sections: [
      {
        title: "O gênero e o público orientam a escrita",
        body: "Um e-mail de alinhamento, um relatório de decisão e uma apresentação não pedem a mesma estrutura. Informe quem vai ler, o que precisa compreender e qual ação deve acontecer depois da leitura.",
      },
      {
        title: "Use a ferramenta para editar, não para inventar",
        body: "Peça organização, alternativas de tom, revisão gramatical ou redução de redundância. Marque nomes, números, compromissos e justificativas como conteúdo que precisa ser preservado; não aceite fatos criados para preencher um texto.",
      },
      {
        title: "Faça a última leitura como autor",
        body: "Confira se a mensagem continua fiel ao que você pensa, se está adequada ao destinatário e se nenhuma informação confidencial foi exposta. A pessoa que assina ou envia responde pelo conteúdo final.",
      },
    ],
    examples: [
      {
        title: "E-mail de atualização de projeto",
        prompt:
          "Organize este rascunho em um e-mail breve para a equipe. Preserve datas e decisões exatamente como estão, mantenha um tom direto e marque como '[confirmar]' qualquer trecho ambíguo. Não acrescente compromissos.",
        review:
          "Compare o texto final com o rascunho para confirmar fatos, responsáveis e próximos passos.",
      },
    ],
    demonstration: {
      startingPrompt: "Deixe este e-mail mais profissional.",
      structuredPrompt:
        "Reorganize o rascunho abaixo para um e-mail de atualização dirigido à equipe. Propósito: comunicar situação e próximo passo. Tom: claro e cordial. Preserve fatos, prazos e responsáveis; não invente justificativas. Entregue assunto e até três parágrafos, depois liste dúvidas que eu devo resolver.",
      analysis:
        "A instrução descreve destinatário, propósito, tom, estrutura e o que não pode mudar; ainda cabe ao autor conferir cada dado e aprovar a mensagem.",
    },
    practice:
      "Escolha um rascunho fictício ou sem dados confidenciais. Reorganize-o para um público definido e anote uma mudança que você aceitou e uma que decidiu rejeitar.",
    challenge:
      "Entregue uma versão revisada acompanhada de uma breve nota de autoria: público, propósito, fatos conferidos e alterações feitas por você.",
    checklist: [
      "Público, canal e propósito estão claros.",
      "Nomes, números, prazos e decisões foram comparados com o rascunho.",
      "O tom é adequado sem apagar a voz ou intenção do autor.",
      "O texto não expõe dados nem afirmações sem suporte.",
    ],
    nextCapability:
      "Você poderá usar IA como revisora de forma controlada e manter sua responsabilidade sobre a comunicação enviada.",
    quizId: "professional-writing",
  },
  {
    id: "data-analysis",
    number: 10,
    title: "Análise de dados e apoio à decisão",
    category: "Pesquisa, análise e produtividade",
    description:
      "Explore tabelas com perguntas verificáveis e comunique limites antes de recomendar uma ação.",
    duration: "22 min",
    skill: "Pensamento crítico",
    objective:
      "Formular uma hipótese a partir de dados, conferir os cálculos e explicar o que eles não permitem concluir.",
    objectives: [
      "Entender colunas, unidades, períodos, ausências e origem dos dados.",
      "Usar IA para explorar padrões como hipóteses, não como causas comprovadas.",
      "Conferir números e comunicar incerteza antes de apoiar uma decisão.",
    ],
    sections: [
      {
        title: "Entenda a tabela antes de perguntar",
        body: "Confira o significado de cada coluna, unidade, período, filtros, valores ausentes e tamanho da amostra. Remova identificadores e dados confidenciais; só use ferramentas autorizadas para o conjunto em questão.",
      },
      {
        title: "Explore padrões como hipóteses",
        body: "Peça à IA para descrever tendências e sugerir verificações, não para declarar uma causa. Uma diferença entre grupos pode ter várias explicações; dados observacionais, por si só, não demonstram por que algo aconteceu.",
      },
      {
        title: "Valide e comunique limites",
        body: "Confira cálculos com uma ferramenta adequada ou amostra manual, valide filtros e compare as conclusões com os dados originais. Na comunicação, separe o que os dados mostram, o que é hipótese e o que ainda precisa de evidência.",
      },
    ],
    examples: [
      {
        title: "Pesquisa fictícia de suporte",
        prompt:
          "Com esta tabela fictícia de chamados por semana, descreva as mudanças observadas, mostre como calculou cada diferença e liste duas explicações possíveis sem escolher uma como causa. Aponte dados que faltam para testar essas hipóteses.",
        review:
          "Recalcule uma diferença, confira se as semanas são comparáveis e não interprete associação como causalidade.",
      },
    ],
    demonstration: {
      startingPrompt: "Analise a planilha e diga o que devemos fazer.",
      structuredPrompt:
        "Descreva a distribuição desta tabela fictícia, verifique valores ausentes e compare as semanas usando a mesma unidade. Apresente cada observação com cálculo, hipótese separada e limite dos dados. Não recomende uma decisão sem evidência suficiente.",
      analysis:
        "O pedido limita a interpretação, pede cálculo auditável e separa observação de hipótese para que a decisão continue sob supervisão humana.",
    },
    practice:
      "Considere um conjunto de dados fictício ou público. Escreva uma pergunta, uma hipótese e um teste simples que poderia refutá-la; não envie planilhas de trabalho com dados pessoais.",
    challenge:
      "Entregue um resumo de uma página com pergunta, dado usado, cálculo conferido, hipótese, limite e decisão que ainda requer julgamento humano.",
    checklist: [
      "Unidades, período, definições e dados ausentes foram verificados.",
      "A hipótese não foi apresentada como causa comprovada.",
      "Um cálculo importante foi conferido no dado original.",
      "A recomendação explica incertezas e limites da amostra.",
    ],
    nextCapability:
      "Você poderá transformar exploração assistida de dados em hipóteses auditáveis, sem confundir padrão com explicação causal.",
    quizId: "data-analysis",
  },
  {
    id: "software-development",
    number: 11,
    title: "IA para programação e desenvolvimento de software",
    category: "Aplicações por profissão",
    description:
      "Apoie código, depuração e testes sem assumir que uma sugestão gerada está correta ou segura.",
    duration: "24 min",
    skill: "Pensamento crítico",
    objective:
      "Investigar um defeito com contexto reproduzível e validar uma correção por testes e revisão.",
    objectives: [
      "Descrever comportamento esperado, observado e passos para reproduzir um erro.",
      "Pedir explicações, casos de teste e riscos junto de uma sugestão de correção.",
      "Revisar, testar e proteger credenciais antes de executar ou integrar código gerado.",
    ],
    sections: [
      {
        title: "Peça ajuda com contexto reproduzível",
        body: "Informe linguagem e versão, comportamento esperado, entrada mínima que falha e mensagem de erro sem incluir segredos. Peça para a ferramenta declarar suposições e explicar o trecho antes de sugerir uma mudança.",
      },
      {
        title: "Teste casos normais e de borda",
        body: "Para uma função de média, por exemplo, teste uma lista comum, uma lista com um elemento e a lista vazia. Um teste que passa demonstra apenas aquele comportamento; inclua casos relevantes e observe regressões.",
      },
      {
        title: "Revise segurança e impacto",
        body: "Leia a alteração, confira dependências, permissões, tratamento de erro e dados manipulados. Não cole tokens ou dados de clientes e não execute código gerado em produção sem revisão e controles adequados.",
      },
    ],
    examples: [
      {
        title: "Depuração de uma função de média",
        prompt:
          "A função chamada media retorna a soma dos valores. Explique o defeito, proponha uma correção mínima e liste testes para lista comum, um item e lista vazia. Declare a convenção que usou para entrada vazia e não altere outras partes.",
        review:
          "Confirme a semântica esperada, rode os testes no ambiente local e examine a diferença antes de aceitar a alteração.",
      },
    ],
    demonstration: {
      startingPrompt: "Meu código está errado. Corrija.",
      structuredPrompt:
        "Contexto: função JavaScript chamada media recebe uma lista numérica e está retornando a soma. Objetivo: explicar e sugerir correção mínima. Inclua testes para lista vazia e casos de borda, declare suposições e não invente bibliotecas. Não execute a sugestão; vou revisar e testar localmente.",
      analysis:
        "A instrução oferece uma reprodução concreta, delimita a mudança e transforma testes e suposições em parte da resposta.",
    },
    practice:
      "Analise a função de média do exemplo. Registre o defeito, a regra que você espera e três testes que confirmariam ou refutariam a correção.",
    challenge:
      "Entregue um pequeno relatório de defeito com reprodução, proposta de correção, testes executados ou planejados, riscos revisados e decisão de integração.",
    checklist: [
      "A entrada que reproduz o defeito é pequena e não contém dados reais.",
      "A explicação da ferramenta foi conferida contra o código.",
      "Há testes para caso normal e casos de borda relevantes.",
      "A alteração foi revisada antes de executar ou integrar.",
    ],
    nextCapability:
      "Você poderá usar IA como apoio de depuração e revisão mantendo testes, segurança e decisão técnica sob controle.",
    quizId: "software-development",
  },
  {
    id: "workflow-automation",
    number: 12,
    title: "Automação de tarefas e fluxos de trabalho",
    category: "Ferramentas e automação",
    description:
      "Desenhe um processo antes de automatizá-lo, incluindo validações, exceções e supervisão humana.",
    duration: "20 min",
    skill: "Autoria",
    objective:
      "Mapear um fluxo repetitivo e propor uma automação com controles e alternativa manual.",
    objectives: [
      "Identificar frequência, responsáveis, gatilho, entradas e saídas de uma tarefa.",
      "Separar etapas determinísticas de etapas que exigem interpretação humana.",
      "Planejar validação, falhas, permissões e reversão antes de automatizar.",
    ],
    sections: [
      {
        title: "Mapeie o trabalho atual",
        body: "Registre quem inicia a tarefa, quais informações usa, cada decisão, a saída esperada e onde ocorrem erros ou retrabalho. Não automatize um processo que ainda não está compreendido ou autorizado.",
      },
      {
        title: "Escolha limites e pontos de revisão",
        body: "Tarefas previsíveis podem seguir etapas fixas; entradas ambíguas, dados sensíveis e ações de impacto devem parar para validação humana. Defina permissões mínimas e um caminho manual para indisponibilidade ou erro.",
      },
      {
        title: "Teste antes de conectar sistemas",
        body: "Desenhe e simule o fluxo com dados fictícios. Defina como detectar duplicações, entradas inválidas e saídas incorretas. Este módulo ensina planejamento; nenhuma integração externa é criada ou executada aqui.",
      },
    ],
    examples: [
      {
        title: "Triagem de solicitações internas",
        prompt:
          "Desenhe um fluxo hipotético para classificar solicitações por tipo. Indique gatilho, campos mínimos, regras determinísticas, casos ambíguos para revisão humana, registro de erro e alternativa manual. Não conecte nem envie dados a serviços.",
        review:
          "Verifique se cada decisão tem responsável e se a automação pode ser interrompida sem perder a solicitação original.",
      },
    ],
    demonstration: {
      startingPrompt: "Automatize o recebimento de pedidos.",
      structuredPrompt:
        "Sem executar integrações, desenhe o fluxo de recebimento: evento de início, entrada mínima, validações, roteamento por regras, condição de revisão humana, tratamento de falha, registro e alternativa manual. Marque qualquer etapa que exija autorização técnica ou política.",
      analysis:
        "O desenho torna visíveis controles e dependências antes de qualquer conexão; automação não significa remover supervisão.",
    },
    practice:
      "Escolha uma tarefa repetitiva não sensível. Desenhe as etapas atuais e marque quais são regras claras, quais exigem julgamento e quais podem falhar.",
    challenge:
      "Entregue um mapa antes/depois do fluxo com gatilho, entradas, saídas, validações, responsável humano, rota de falha e plano manual.",
    checklist: [
      "O processo atual e seu responsável estão documentados.",
      "Dados e permissões necessários foram minimizados.",
      "Há revisão humana para ambiguidades e ações de impacto.",
      "Falha, duplicação e alternativa manual têm tratamento definido.",
    ],
    nextCapability:
      "Você poderá conversar com uma equipe técnica sobre uma automação delimitada, testável e supervisionada.",
    quizId: "workflow-automation",
  },
  {
    id: "ai-by-profession",
    number: 13,
    title: "IA aplicada a diferentes profissões",
    category: "Aplicações por profissão",
    description:
      "Explore usos contextualizados em seis áreas e escolha uma tarefa compatível com sua realidade.",
    duration: "25 min",
    skill: "Autoria",
    objective:
      "Selecionar um caso de uso profissional, delimitar o que a IA pode apoiar e planejar revisão especializada.",
    objectives: [
      "Relacionar uma tarefa concreta da profissão a uma forma de apoio da IA.",
      "Adaptar um prompt ao contexto sem enviar informações restritas.",
      "Reconhecer limites que exigem revisão de alguém responsável pela área.",
    ],
    sections: [
      {
        title: "Comece pela tarefa, não pelo cargo",
        body: "Procure uma etapa repetitiva, exploratória ou de organização que tenha uma saída verificável. A mesma profissão pode conter tarefas de riscos diferentes; comece por uma tarefa pequena e de baixo impacto.",
      },
      {
        title: "Casos para diferentes áreas",
        body: "Os exemplos abaixo são pontos de partida, não recomendações universais. Adapte-os a regras, ferramentas aprovadas, contexto local e competência de quem revisará o resultado.",
      },
      {
        title: "Avalie benefício e risco juntos",
        body: "Pergunte se o resultado economiza esforço sem distorcer evidências, expor pessoas, inventar alegações ou reduzir acesso justo. Se uma falha puder afetar alguém, aumente a revisão humana ou escolha outro caso.",
      },
    ],
    examples: [
      {
        title: "Tecnologia e desenvolvimento",
        prompt:
          "Explique este erro reproduzível e proponha testes antes de sugerir uma correção; não inclua segredos nem altere dependências sem justificar.",
        review:
          "Execute e revise os testes; a pessoa responsável pelo código aprova a mudança.",
      },
      {
        title: "Design, UX/UI e produto",
        prompt:
          "Agrupe estes comentários fictícios por tema, mantenha exemplos que sustentem cada grupo e destaque ambiguidades sem afirmar que a amostra representa todos os usuários.",
        review:
          "Confira os comentários originais, viés de amostragem e acessibilidade antes de priorizar uma mudança.",
      },
      {
        title: "Marketing e comunicação",
        prompt:
          "Crie três opções de estrutura para uma campanha a partir do briefing aprovado; não invente números, resultados, depoimentos nem promessas.",
        review:
          "Valide alegações com evidências e siga regras de marca, público e canal.",
      },
      {
        title: "Administração e negócios",
        prompt:
          "Transforme esta pauta fictícia em uma lista de decisões, responsáveis e pendências; marque como pendente tudo que não estiver explicitamente registrado.",
        review:
          "Confirme nomes, decisões e responsáveis na ata original antes de circular.",
      },
      {
        title: "Educação e pesquisa",
        prompt:
          "Crie perguntas de autoavaliação somente a partir deste trecho de estudo e indique qual parte do texto sustenta cada resposta.",
        review:
          "Abra o material, corrija ambiguidades e siga as regras da instituição sobre uso de IA.",
      },
      {
        title: "Operações e atividades organizacionais",
        prompt:
          "Reorganize este procedimento aprovado em uma lista de etapas e pontos de conferência; preserve avisos de segurança e sinalize instruções contraditórias.",
        review:
          "O responsável pelo processo valida a versão antes que alguém a use operacionalmente.",
      },
    ],
    demonstration: {
      startingPrompt: "Como a IA pode ajudar no meu trabalho?",
      structuredPrompt:
        "Minha tarefa é [tarefa não sensível]. O público da saída é [público]. A IA pode apoiar [etapa], mas não deve [decisão/ação]. Produza [formato] usando somente [materiais autorizados], marque dúvidas e liste como um especialista deve revisar.",
      analysis:
        "A estrutura parte do trabalho real da pessoa e torna visíveis a permissão, o limite e a revisão profissional.",
    },
    practice:
      "Escolha uma das áreas ou descreva a sua. Defina uma tarefa pequena, escreva um prompt com limites e indique quem poderia revisar a saída.",
    challenge:
      "Entregue um cartão de caso de uso com tarefa, benefício esperado, prompt, risco, dado que não deve ser enviado e critério para aprovar a saída.",
    checklist: [
      "O caso escolhido descreve uma tarefa concreta e de baixo risco inicial.",
      "O prompt usa apenas informações permitidas e define uma saída verificável.",
      "Limites e possíveis impactos estão explicitados.",
      "Uma pessoa competente revisa antes de usar o resultado.",
    ],
    nextCapability:
      "Você poderá identificar oportunidades de IA na própria área, sem reduzir profissões a uma lista genérica de prompts.",
    quizId: "ai-by-profession",
  },
  {
    id: "assistants-and-agents",
    number: 14,
    title: "Assistentes de IA, ferramentas e fluxos inteligentes",
    category: "Ferramentas e automação",
    description:
      "Diferencie conversa, fluxo definido e agente com ferramentas; projete limites antes de conceder autonomia.",
    duration: "22 min",
    skill: "Pensamento crítico",
    objective:
      "Especificar objetivo, entradas, ferramentas permitidas, saídas, permissões e pontos de aprovação de um assistente hipotético.",
    objectives: [
      "Distinguir um chatbot de um fluxo automatizado e de um sistema com controle dinâmico de etapas.",
      "Descrever ferramentas como capacidades delimitadas com entradas e efeitos conhecidos.",
      "Planejar permissões mínimas, registros, fallback e aprovação humana para ações relevantes.",
    ],
    sections: [
      {
        title: "Três padrões com graus diferentes de controle",
        body: "Um chatbot responde em uma conversa. Um fluxo automatizado segue etapas predefinidas, com regras e chamadas organizadas no código. Um sistema agentivo pode decidir dinamicamente quais etapas ou ferramentas usar até cumprir uma tarefa ou precisar de revisão. Produtos reais podem combinar padrões; o nome 'agente' não garante autonomia nem qualidade.",
      },
      {
        title: "Ferramenta é uma permissão concreta",
        body: "Ler um documento, pesquisar um catálogo e enviar uma mensagem têm impactos diferentes. Cada ferramenta deve ter escopo mínimo, entradas validadas, resultado observável e regras claras sobre o que pode alterar. Não conceda acesso amplo só para tornar uma demonstração mais impressionante.",
      },
      {
        title: "Supervisão faz parte do desenho",
        body: "Defina quando o sistema deve parar, pedir confirmação, registrar o que fez ou transferir para uma pessoa. Para ações externas, dados pessoais ou decisões de impacto, exija aprovação explícita e ofereça um modo seguro de cancelar.",
      },
    ],
    examples: [
      {
        title: "Assistente hipotético de triagem",
        prompt:
          "Desenhe, sem conectar ferramentas, um assistente que classifica solicitações fictícias. Especifique categorias, entrada permitida, saída, casos incertos, acesso proibido e condição para encaminhar a uma pessoa.",
        review:
          "A classificação é uma sugestão; não use o desenho para tomar decisões reais sem avaliação, autorização e controles.",
      },
    ],
    demonstration: {
      startingPrompt: "Crie um agente que resolva solicitações sozinho.",
      structuredPrompt:
        "Projete um protótipo conceitual de assistente para organizar solicitações fictícias. Liste objetivo, entradas, etapas fixas, ferramenta hipotética, permissões mínimas, ações que exigem confirmação, condição de parada e transferência humana. Não execute nem conecte serviços.",
      analysis:
        "O segundo pedido reduz autonomia, explicita permissões e descreve supervisão; um desenho conceitual não equivale a integração real.",
    },
    practice:
      "Desenhe um assistente hipotético para uma tarefa profissional. Diferencie o que ele responde, o que segue por regra e o que só pode fazer após aprovação.",
    challenge:
      "Entregue uma ficha de projeto com objetivo, entradas, saídas, ferramentas hipotéticas, permissões, limites, registros, aprovação humana e fallback.",
    checklist: [
      "O padrão escolhido é o mais simples que atende à tarefa.",
      "Cada ferramenta tem uma permissão específica e escopo mínimo.",
      "Há pontos de parada, confirmação e transferência para uma pessoa.",
      "A proposta não afirma que alguma integração já existe ou foi testada.",
    ],
    nextCapability:
      "Você poderá avaliar propostas de assistentes pela tarefa e pelas permissões, em vez de confiar apenas no rótulo 'agente'.",
    references: [
      {
        label: "Anthropic — Building effective AI agents",
        url: "https://www.anthropic.com/research/building-effective-agents",
      },
      {
        label: "OpenAI — Agent definitions",
        url: "https://developers.openai.com/api/docs/guides/agents/define-agents",
      },
    ],
    quizId: "assistants-and-agents",
  },
  {
    id: "integrative-project",
    number: 15,
    title: "Projeto integrador: da ideia à solução profissional",
    category: "Projetos autorais",
    description:
      "Conecte a trilha a um problema real e construa uma entrega profissional com autoria humana.",
    duration: "30 min",
    skill: "Autoria",
    objective:
      "Planejar um projeto autoral com problema, público, evidências, uso delimitado de IA, validação e apresentação.",
    objectives: [
      "Definir um problema observável, seu público e o resultado que indicaria progresso.",
      "Pesquisar necessidades e usar IA apenas em etapas que possam ser revisadas.",
      "Validar a entrega, registrar decisões e explicar limites e autoria.",
    ],
    sections: [
      {
        title: "Encontre um problema da sua realidade",
        body: "Descreva quem é afetado, em que situação e o que acontece hoje. Converse com pessoas quando for apropriado, proteja dados e evite começar pela ferramenta; primeiro confirme que o problema merece atenção.",
      },
      {
        title: "Planeje uma solução que possa ser testada",
        body: "Defina um objetivo, um primeiro protótipo pequeno, evidências necessárias e critérios para avaliar a entrega. Especifique onde a IA pode apoiar pesquisa, alternativas ou revisão e onde uma pessoa precisa decidir.",
      },
      {
        title: "Valide, documente e apresente",
        body: "Teste com critérios e, quando possível, com pessoas representativas e consentimento adequado. Registre mudanças, fontes verificadas, erros encontrados, limites e contribuições humanas antes de apresentar o resultado.",
      },
    ],
    examples: [
      {
        title: "Projeto de orientação acadêmica",
        prompt:
          "Ajude a transformar esta necessidade fictícia de estudantes em um plano de protótipo. Separe problema, público, suposições, perguntas de pesquisa, teste de baixo risco e critérios de sucesso. Não invente entrevistas nem declare que o protótipo foi validado.",
        review:
          "Diferencie evidência coletada de hipótese e documente quem revisou cada decisão do projeto.",
      },
    ],
    demonstration: {
      startingPrompt: "Dê uma ideia de projeto com IA.",
      structuredPrompt:
        "Quero investigar [problema observado] para [público]. Gere três alternativas de protótipo pequeno, cada uma com hipótese, evidência necessária, risco, papel possível da IA e teste que eu poderia conduzir. Não trate nenhuma ideia como validada; preserve a decisão final comigo.",
      analysis:
        "O prompt explora opções sem declarar que conhecemos as necessidades do público; a validação continua sendo trabalho do projeto.",
    },
    practice:
      "Abra Projetos autorais, registre uma ideia própria e comece pelo problema e público. Use uma ferramenta de IA apenas como apoio revisável, não como substituto de pesquisa ou decisão.",
    challenge:
      "Entregue uma apresentação curta com problema, público, evidências, protótipo, decisões apoiadas por IA, validação, limites, aprendizados e autoria.",
    checklist: [
      "O problema e o público foram descritos sem alegar evidência inexistente.",
      "O protótipo tem objetivo, etapas e critério de avaliação.",
      "Dados, fontes e saídas de IA foram revisados de forma responsável.",
      "A apresentação separa resultado validado, hipótese e próximos passos.",
    ],
    nextCapability:
      "Você poderá apresentar um projeto autoral com decisões rastreáveis e uma proposta clara de evolução.",
    quizId: "integrative-project",
  },
]

export const placementQuestions: Question[] = [
  {
    prompt: "O que descreve melhor um modelo generativo?",
    options: [
      "Um sistema que produz saídas a partir de padrões aprendidos",
      "Uma base de dados sempre atualizada",
      "Uma fonte que garante a verdade",
    ],
    answer: 0,
    explanations: [
      "Isso mesmo: ele gera saídas com base em padrões aprendidos.",
      "Um modelo não é, por si só, uma base atualizada.",
      "A geração não garante que a resposta seja verdadeira.",
    ],
    topic: "Fundamentos",
  },
  {
    prompt: "Uma resposta de IA parece muito segura. O que isso prova?",
    options: [
      "Que a afirmação foi verificada",
      "Apenas que o texto foi produzido com confiança",
      "Que as fontes citadas existem",
    ],
    answer: 1,
    explanations: [
      "A confiança no tom não comprova a afirmação.",
      "Correto: estilo convincente não é evidência.",
      "Referências também precisam ser abertas e conferidas.",
    ],
    topic: "Limitações",
  },
  {
    prompt: "Qual instrução tende a ajudar mais a ferramenta?",
    options: [
      "Faça algo bom",
      "Explique o tema",
      "Resuma este texto para calouros em cinco tópicos e indique dúvidas",
    ],
    answer: 2,
    explanations: [
      "Faltam tarefa e critérios.",
      "O pedido continua amplo e sem formato.",
      "A instrução define contexto, público, formato e um limite.",
    ],
    topic: "Prompting",
  },
  {
    prompt:
      "Antes de usar uma ferramenta pública com dados de um cliente, você deve…",
    options: [
      "Enviar tudo para obter uma resposta melhor",
      "Retirar identificadores e conferir as regras da ferramenta",
      "Mudar apenas o nome",
    ],
    answer: 1,
    explanations: [
      "Isso pode expor informações confidenciais.",
      "Correto: minimize os dados e siga políticas aplicáveis.",
      "Outros detalhes ainda podem identificar a pessoa.",
    ],
    topic: "Privacidade",
  },
  {
    prompt: "Como confirmar uma afirmação importante produzida por IA?",
    options: [
      "Pedir a mesma resposta novamente",
      "Abrir fontes independentes e conferir se sustentam a afirmação",
      "Verificar apenas se a resposta está bem escrita",
    ],
    answer: 1,
    explanations: [
      "Repetir o pedido não é confirmação independente.",
      "Correto: confira a evidência e seu contexto diretamente.",
      "Boa escrita não demonstra precisão.",
    ],
    topic: "Verificação",
  },
  {
    prompt: "Qual prática preserva melhor a autoria humana?",
    options: [
      "Revisar, verificar e assumir responsabilidade pelo resultado",
      "Publicar a primeira resposta sem alterações",
      "Ocultar qualquer uso da ferramenta",
    ],
    answer: 0,
    explanations: [
      "Correto: a pessoa decide, revisa e responde pelo resultado.",
      "Uma primeira resposta pode conter erros e não reflete necessariamente seu julgamento.",
      "Transparência depende do contexto e das regras aplicáveis.",
    ],
    topic: "Autoria",
  },
]

export const quizzes: Record<string, {
  title: string
  description: string
  questions: Question[]
}> = {
  foundations: {
    title: "Revisão: fundamentos de IA",
    description: "Confira o que diferencia geração de informação verificada.",
    questions: [
      {
        prompt: "Um modelo generativo produz texto principalmente…",
        options: [
          "Completando padrões aprendidos",
          "Consultando sempre a internet",
          "Copiando uma resposta fixa",
        ],
        answer: 0,
        explanations: [
          "Correto: a geração usa padrões aprendidos e o contexto disponível.",
          "A busca na internet depende da ferramenta e configuração.",
          "As respostas são geradas; não é uma única resposta fixa.",
        ],
        topic: "Fundamentos",
      },
      {
        prompt: "Qual afirmação sobre uma resposta fluente é segura?",
        options: [
          "Ela deve estar correta",
          "Ela está bem formulada, mas precisa de avaliação",
          "Ela veio de uma fonte primária",
        ],
        answer: 1,
        explanations: [
          "Fluência não é prova de precisão.",
          "Correto: avalie o conteúdo e confira o que importa.",
          "A forma do texto não revela a fonte usada.",
        ],
        topic: "Limitações",
      },
    ],
  },
  hallucinations: {
    title: "Desafio: detecte o que precisa ser conferido",
    description:
      "Identifique uma resposta plausível que ainda não tem evidência.",
    questions: [
      {
        prompt:
          "A IA cita um estudo com título e autores específicos. Qual é o primeiro passo?",
        options: [
          "Usar a citação porque parece completa",
          "Procurar o estudo em um catálogo ou site confiável",
          "Pedir para a IA confirmar que o estudo existe",
        ],
        answer: 1,
        explanations: [
          "Detalhes podem ser inventados ou misturados.",
          "Correto: localize a publicação e confira os dados diretamente.",
          "A própria ferramenta não é uma fonte independente da citação.",
        ],
        topic: "Citações",
      },
      {
        prompt:
          "Uma resposta sobre um tema atual não indica data. Como proceder?",
        options: [
          "Assumir que foi atualizada",
          "Conferir em fontes recentes e independentes",
          "Usar a resposta se for detalhada",
        ],
        answer: 1,
        explanations: [
          "Nem toda ferramenta tem informação atualizada.",
          "Correto: consulte fontes atuais e verifique a data.",
          "Detalhamento não substitui atualidade nem evidência.",
        ],
        topic: "Atualidade",
      },
      {
        prompt:
          "A explicação parece coerente, mas você não encontrou suporte. O que fazer?",
        options: [
          "Tratá-la como hipótese e continuar verificando",
          "Compartilhar como fato",
          "Pedir uma versão mais longa",
        ],
        answer: 0,
        explanations: [
          "Correto: sem evidência, não apresente como fato confirmado.",
          "Isso pode disseminar informação incorreta.",
          "Mais texto pode repetir a mesma falta de evidência.",
        ],
        topic: "Evidência",
      },
    ],
  },
  privacy: {
    title: "Desafio: proteja os dados",
    description: "Escolha como reduzir exposição antes de usar uma ferramenta.",
    questions: [
      {
        prompt:
          "Você quer resumir prontuários de pesquisa. Qual abordagem é mais segura?",
        options: [
          "Colar prontuários identificáveis",
          "Usar somente ferramenta autorizada e remover dados desnecessários",
          "Trocar apenas o primeiro nome",
        ],
        answer: 1,
        explanations: [
          "Dados sensíveis não devem ser enviados sem autorização e controles.",
          "Correto: minimize dados e use ambiente aprovado pelas regras aplicáveis.",
          "Outros identificadores podem continuar presentes.",
        ],
        topic: "Dados sensíveis",
      },
      {
        prompt: "Qual informação é mais segura para um exemplo público?",
        options: [
          "Um cenário fictício sem identificadores reais",
          "Um e-mail de cliente",
          "Uma planilha interna com nomes removidos, mas datas e cargos",
        ],
        answer: 0,
        explanations: [
          "Correto: use um exemplo fictício e reduza detalhes identificáveis.",
          "E-mail é dado pessoal identificável.",
          "Combinações de contexto podem reidentificar pessoas.",
        ],
        topic: "Minimização",
      },
      {
        prompt: "O que fazer quando não sabe se a ferramenta retém entradas?",
        options: [
          "Enviar os dados e descobrir depois",
          "Consultar as condições e a política institucional antes",
          "Assumir que tudo é apagado",
        ],
        answer: 1,
        explanations: [
          "A exposição pode já ter ocorrido.",
          "Correto: verifique condições e regras antes de compartilhar.",
          "Não presuma controles que não foram confirmados.",
        ],
        topic: "Políticas",
      },
    ],
  },
  "prompt-comparison": {
    title: "Laboratório: compare dois prompts",
    description:
      "Escolha a instrução que oferece contexto e critérios verificáveis.",
    questions: [
      {
        prompt:
          "Para planejar uma revisão de conteúdo, qual prompt é mais útil?",
        options: [
          "Me ajude a estudar",
          "Crie um plano de revisão de 5 dias para uma prova de biologia; inclua sessões de 30 minutos e uma forma de autoavaliação",
        ],
        answer: 1,
        explanations: [
          "A tarefa não informa tema, prazo nem formato.",
          "Correto: objetivo, contexto, restrições e critério de revisão estão explícitos.",
        ],
        topic: "Clareza",
      },
      {
        prompt: "Qual prompt define melhor o formato de saída?",
        options: [
          "Explique o conceito",
          "Explique o conceito em uma tabela com definição, exemplo e uma dúvida a verificar",
        ],
        answer: 1,
        explanations: [
          "Não há orientação sobre estrutura ou profundidade.",
          "Correto: o formato e os elementos esperados ficam claros.",
        ],
        topic: "Formato",
      },
      {
        prompt:
          "Você quer evitar suposições sobre dados ausentes. O que acrescenta ao prompt?",
        options: [
          "Se faltar informação, faça perguntas antes de concluir",
          "Use sua imaginação",
          "Responda sem mencionar dúvidas",
        ],
        answer: 0,
        explanations: [
          "Correto: isso explicita como lidar com lacunas.",
          "Isso pode incentivar conteúdo inventado.",
          "O pedido pode esconder incerteza relevante.",
        ],
        topic: "Restrições",
      },
    ],
  },
  verification: {
    title: "Desafio: verifique antes de compartilhar",
    description: "Pratique a checagem de afirmações importantes.",
    questions: [
      {
        prompt: "Uma resposta dá uma estatística sem fonte. O que fazer?",
        options: [
          "Citar a estatística mesmo assim",
          "Localizar a origem, método e data em fontes confiáveis",
          "Repetir a pergunta em outro chat",
        ],
        answer: 1,
        explanations: [
          "Sem fonte, a estatística não está sustentada.",
          "Correto: confira origem, método, contexto e atualidade.",
          "Outra resposta gerada ainda não é evidência.",
        ],
        topic: "Dados",
      },
      {
        prompt: "Como avaliar uma referência fornecida pela ferramenta?",
        options: [
          "Ver se o link abre e se o conteúdo sustenta a frase",
          "Confiar no título",
          "Contar quantas referências aparecem",
        ],
        answer: 0,
        explanations: [
          "Correto: confirme existência e pertinência diretamente.",
          "Um título pode ser incorreto ou não relacionado.",
          "Quantidade não mede qualidade da evidência.",
        ],
        topic: "Fontes",
      },
      {
        prompt:
          "O resultado será usado em uma decisão relevante. Qual cuidado é adequado?",
        options: [
          "Aplicar a resposta imediatamente",
          "Fazer checagem independente e revisão humana proporcional ao impacto",
          "Remover as ressalvas para simplificar",
        ],
        answer: 1,
        explanations: [
          "Decisões relevantes exigem avaliação adequada.",
          "Correto: aumente a revisão conforme o impacto.",
          "Remover incertezas pode tornar a comunicação enganosa.",
        ],
        topic: "Impacto",
      },
    ],
  },
  "responsible-use": {
    title: "Revisão: autoria e responsabilidade",
    description: "Consolide boas práticas de uso consciente.",
    questions: [
      {
        prompt: "Quem responde por um material final apoiado por IA?",
        options: [
          "A ferramenta",
          "A pessoa que decide usar e compartilhar o resultado",
          "Quem escreveu o prompt, sempre sem exceção",
        ],
        answer: 1,
        explanations: [
          "A ferramenta não substitui a responsabilidade humana.",
          "Correto: revise e assuma responsabilidade pelo uso no seu contexto.",
          "Responsabilidade depende das funções e regras do contexto.",
        ],
        topic: "Autoria",
      },
      {
        prompt: "Qual é uma boa prática para um trabalho acadêmico?",
        options: [
          "Seguir a política da instituição e conferir o conteúdo",
          "Presumir que todo uso é permitido",
          "Esconder o uso mesmo quando a política pede transparência",
        ],
        answer: 0,
        explanations: [
          "Correto: siga as regras aplicáveis e valide o resultado.",
          "As regras variam por instituição e atividade.",
          "Pode violar as regras de transparência.",
        ],
        topic: "Transparência",
      },
    ],
  },
  "advanced-prompting": {
    title: "Prática: engenharia de contexto",
    description:
      "Escolha como estruturar e revisar instruções profissionais complexas.",
    questions: [
      {
        prompt:
          "Uma equipe precisa de um roteiro usando somente um procedimento aprovado. O que mais ajuda a reduzir suposições?",
        options: [
          "Pedir um roteiro completo e deixar a ferramenta preencher o que faltar",
          "Definir público, duração, material permitido, formato e como sinalizar lacunas",
          "Adicionar o máximo de detalhes internos, mesmo os irrelevantes",
        ],
        answer: 1,
        explanations: [
          "Sem limites, a ferramenta pode completar lacunas com conteúdo não aprovado.",
          "Correto: contexto relevante, formato e tratamento de lacunas tornam o resultado revisável.",
          "Mais contexto não é sempre melhor e pode expor dados que não são necessários.",
        ],
        topic: "Contexto e restrições",
      },
      {
        prompt:
          "A primeira saída ficou longa, mas não atende a dois critérios definidos. Qual é a próxima ação mais útil?",
        options: [
          "Pedir uma versão ainda mais longa",
          "Remover os critérios para aceitar a resposta atual",
          "Indicar quais critérios falharam, mudar uma instrução e comparar a nova saída",
        ],
        answer: 2,
        explanations: [
          "Comprimento não resolve necessariamente a falta de aderência.",
          "Os critérios existem para avaliar a utilidade; removê-los esconde o problema.",
          "Correto: iteração controlada permite observar se a alteração melhora o resultado.",
        ],
        topic: "Iteração",
      },
    ],
  },
  "research-synthesis": {
    title: "Prática: sintetize com evidências",
    description:
      "Diferencie síntese rastreável de afirmações que ainda precisam ser verificadas.",
    questions: [
      {
        prompt:
          "Dois documentos fornecidos discordam sobre um ponto. Como a síntese deve tratar isso?",
        options: [
          "Registrar as duas posições e mostrar os trechos que as sustentam",
          "Escolher a posição mais convincente e ocultar a divergência",
          "Criar uma terceira posição que pareça conciliar as duas",
        ],
        answer: 0,
        explanations: [
          "Correto: preservar a divergência mantém a síntese fiel aos materiais.",
          "Uma síntese não deve apagar evidência relevante sem justificar a escolha.",
          "Uma conciliação inventada pode atribuir aos documentos algo que eles não dizem.",
        ],
        topic: "Divergências",
      },
      {
        prompt:
          "A resposta cita uma publicação que não estava nos materiais enviados. O que fazer antes de usá-la?",
        options: [
          "Assumir que existe porque o título parece plausível",
          "Localizar a publicação em uma fonte confiável e conferir se sustenta a afirmação",
          "Pedir ao mesmo modelo que confirme a própria referência",
        ],
        answer: 1,
        explanations: [
          "Um título verossímil não confirma existência nem pertinência.",
          "Correto: a referência precisa ser encontrada e aberta de forma independente.",
          "A confirmação pelo mesmo sistema não é uma checagem independente.",
        ],
        topic: "Verificação de fontes",
      },
    ],
  },
  "professional-writing": {
    title: "Prática: comunicação profissional",
    description:
      "Revise uma mensagem sem alterar fatos nem transferir a autoria para a ferramenta.",
    questions: [
      {
        prompt:
          "Ao revisar um e-mail com datas e responsáveis, qual orientação protege melhor a precisão?",
        options: [
          "Permitir que a ferramenta complete os dados que parecem faltar",
          "Pedir que preserve os dados e marque ambiguidades para confirmação",
          "Retirar nomes e datas do texto mesmo quando são essenciais ao destinatário",
        ],
        answer: 1,
        explanations: [
          "Completar lacunas pode criar compromissos ou fatos incorretos.",
          "Correto: a ferramenta pode organizar o texto, enquanto a pessoa confirma os fatos.",
          "Minimização é importante, mas a mensagem ainda precisa ser útil e autorizada para o contexto.",
        ],
        topic: "Precisão",
      },
      {
        prompt:
          "Uma versão revisada está clara, mas mudou a intenção do autor. O que fazer?",
        options: [
          "Enviar porque o texto está mais profissional",
          "Manter a versão e alterar a intenção para combinar com o tom",
          "Revisar ou rejeitar a alteração e preservar o propósito original",
        ],
        answer: 2,
        explanations: [
          "Clareza não compensa uma mudança de sentido não aprovada.",
          "O tom deve servir à intenção, não substituí-la.",
          "Correto: autoria inclui decidir o que expressar e aprovar a mensagem final.",
        ],
        topic: "Autoria e tom",
      },
    ],
  },
  "data-analysis": {
    title: "Prática: dados e decisões",
    description: "Avalie hipóteses e limites ao explorar um conjunto de dados.",
    questions: [
      {
        prompt:
          "Uma tabela mostra que duas medidas mudaram no mesmo período. O que é possível concluir primeiro?",
        options: [
          "Uma medida causou a mudança da outra",
          "Há uma associação observada que pode gerar uma hipótese a testar",
          "A IA identificou a causa porque analisou todas as linhas",
        ],
        answer: 1,
        explanations: [
          "Coincidência temporal não demonstra causalidade.",
          "Correto: trate o padrão como hipótese e planeje como investigar outras explicações.",
          "A ferramenta não transforma automaticamente associação em evidência causal.",
        ],
        topic: "Hipóteses e causalidade",
      },
      {
        prompt:
          "Antes de pedir uma análise de planilha, qual verificação é mais importante?",
        options: [
          "Conferir definições, unidades, período, ausências e autorização de uso dos dados",
          "Pedir uma recomendação executiva antes de olhar as colunas",
          "Enviar a planilha inteira para evitar perder contexto",
        ],
        answer: 0,
        explanations: [
          "Correto: sem definições e permissão, a análise pode ser inválida ou expor dados.",
          "Uma recomendação sem contexto pode se apoiar em pressupostos errados.",
          "Envie apenas dados necessários e autorizados; contexto excessivo aumenta risco.",
        ],
        topic: "Qualidade e privacidade dos dados",
      },
    ],
  },
  "software-development": {
    title: "Prática: depuração assistida",
    description:
      "Escolha passos que tornam uma correção de código reproduzível e verificável.",
    questions: [
      {
        prompt:
          "Uma função `media` devolve a soma. O que pedir junto de uma proposta de correção?",
        options: [
          "Uma explicação da regra e testes para lista normal, um elemento e lista vazia",
          "Uma reescrita completa do sistema sem explicar as mudanças",
          "Garantia de que o código gerado está seguro porque compila",
        ],
        answer: 0,
        explanations: [
          "Correto: explicar a semântica e testar casos de borda ajudam a validar a proposta.",
          "Uma mudança ampla dificulta isolar o defeito e aumenta risco de regressão.",
          "Compilar não prova segurança nem correção em todos os cenários.",
        ],
        topic: "Testes e casos de borda",
      },
      {
        prompt:
          "Antes de colar um trecho de código de trabalho em uma ferramenta externa, o que fazer?",
        options: [
          "Remover apenas comentários para manter o contexto completo",
          "Conferir autorização, remover segredos e dados desnecessários e usar ferramenta aprovada",
          "Enviar o trecho e pedir que o modelo não o armazene",
        ],
        answer: 1,
        explanations: [
          "Comentários e código ainda podem revelar detalhes internos ou credenciais.",
          "Correto: autorização e minimização vêm antes do envio; não presuma controles não confirmados.",
          "Uma instrução no prompt não garante política de retenção do serviço.",
        ],
        topic: "Segurança e privacidade",
      },
    ],
  },
  "workflow-automation": {
    title: "Prática: desenhe antes de automatizar",
    description:
      "Identifique controles e responsabilidade em uma automação hipotética.",
    questions: [
      {
        prompt:
          "Uma etapa recebe solicitações ambíguas e pode gerar uma ação externa. Qual desenho é mais seguro?",
        options: [
          "Executar a ação automaticamente para reduzir o tempo de resposta",
          "Parar, apresentar a ambiguidade e pedir aprovação humana antes da ação",
          "Repetir a tentativa sem limite até obter uma saída clara",
        ],
        answer: 1,
        explanations: [
          "Automatizar ambiguidade com efeito externo pode produzir impacto indevido.",
          "Correto: uma condição de parada e aprovação preservam supervisão em ação relevante.",
          "Retentativas ilimitadas podem duplicar efeitos ou ocultar falhas.",
        ],
        topic: "Supervisão humana",
      },
      {
        prompt:
          "O que deve existir quando a automação falha ou fica indisponível?",
        options: [
          "Um modo manual documentado e um registro para localizar a solicitação",
          "Uma etapa que descarte silenciosamente a entrada",
          "Uma segunda integração externa não revisada",
        ],
        answer: 0,
        explanations: [
          "Correto: continuidade e rastreabilidade ajudam a recuperar o processo com segurança.",
          "Descartar entradas pode causar perda de trabalho sem que alguém perceba.",
          "Adicionar integrações sem revisão amplia dependências e riscos.",
        ],
        topic: "Fallback e falhas",
      },
    ],
  },
  "ai-by-profession": {
    title: "Prática: escolha um caso profissional",
    description:
      "Avalie um caso de uso pela tarefa, pelo risco e pela revisão disponível.",
    questions: [
      {
        prompt:
          "Uma equipe quer agrupar comentários de usuários usando IA. Qual descrição é mais responsável?",
        options: [
          "Os grupos representam todos os clientes e definem a prioridade final",
          "Os grupos são hipóteses; a equipe confere exemplos, limites da amostra e impacto antes de priorizar",
          "O modelo deve descartar comentários que não se encaixam",
        ],
        answer: 1,
        explanations: [
          "Uma amostra pode não representar todas as pessoas e não decide prioridade sozinha.",
          "Correto: exemplos, viés de amostra e julgamento da equipe precisam ser revistos.",
          "Casos fora das categorias podem revelar um tema importante ou uma classificação ruim.",
        ],
        topic: "Design e produto",
      },
      {
        prompt:
          "Como escolher uma primeira tarefa profissional para experimentar com IA?",
        options: [
          "Uma tarefa concreta, de baixo risco e com saída que alguém possa verificar",
          "Uma decisão de alto impacto com dados confidenciais",
          "A tarefa mais difícil, para testar autonomia máxima",
        ],
        answer: 0,
        explanations: [
          "Correto: baixo risco e verificabilidade permitem aprender sem delegar responsabilidade.",
          "Esse cenário exige autorização e controles que não estão garantidos neste protótipo.",
          "Começar com autonomia máxima aumenta risco antes de entender limites e benefício.",
        ],
        topic: "Escolha de caso de uso",
      },
    ],
  },
  "assistants-and-agents": {
    title: "Prática: desenhe um assistente supervisionado",
    description:
      "Diferencie padrões de fluxo e estabeleça limites para ferramentas hipotéticas.",
    questions: [
      {
        prompt:
          "Uma tarefa segue sempre quatro etapas conhecidas e precisa de resultados previsíveis. Qual desenho tende a ser mais simples de controlar?",
        options: [
          "Um fluxo com etapas e regras predefinidas",
          "Um sistema com autonomia ampla para escolher qualquer ferramenta",
          "Um chatbot sem instrução de saída",
        ],
        answer: 0,
        explanations: [
          "Correto: etapas estáveis podem ser coordenadas por um fluxo explícito e testável.",
          "Autonomia ampla adiciona complexidade sem benefício claro para uma tarefa fixa.",
          "Sem objetivo e formato, uma conversa não define o processo necessário.",
        ],
        topic: "Fluxos e agentes",
      },
      {
        prompt:
          "Um assistente hipotético pode enviar mensagens externas. Qual controle deve ser definido?",
        options: [
          "Permitir envio automático sempre que a resposta parecer confiante",
          "Exigir confirmação humana, limitar destinatários e registrar a ação",
          "Conceder acesso amplo e pedir que o modelo seja cuidadoso",
        ],
        answer: 1,
        explanations: [
          "Tom confiante não comprova que destinatário e conteúdo estão corretos.",
          "Correto: confirmação, escopo mínimo e registro tornam a ação observável e controlável.",
          "Um pedido de cautela não substitui permissões técnicas e supervisão.",
        ],
        topic: "Permissões e controle",
      },
    ],
  },
  "integrative-project": {
    title: "Prática: planeje um projeto autoral",
    description:
      "Prepare uma proposta testável sem confundir hipótese com resultado validado.",
    questions: [
      {
        prompt:
          "Uma equipe tem uma ideia de solução, mas ainda não conversou com o público. Como apresentá-la?",
        options: [
          "Como uma necessidade comprovada e um produto validado",
          "Como hipótese a investigar, com perguntas e teste planejados",
          "Como resultado da pesquisa feita pela IA",
        ],
        answer: 1,
        explanations: [
          "Sem evidência, não se deve apresentar necessidade ou validação como fato.",
          "Correto: separar hipótese de evidência orienta o próximo passo de pesquisa.",
          "Uma resposta gerada não substitui pesquisa com o público ou evidência de uso.",
        ],
        topic: "Pesquisa e validação",
      },
      {
        prompt:
          "O que fortalece a autoria humana em um projeto apoiado por IA?",
        options: [
          "Registrar decisões, verificações, limites e contribuições próprias",
          "Ocultar toda participação da ferramenta em qualquer contexto",
          "Aceitar a primeira proposta como decisão final",
        ],
        answer: 0,
        explanations: [
          "Correto: registro e revisão tornam o processo mais transparente e responsável.",
          "As regras de transparência variam; não há uma regra universal de ocultar o uso.",
          "A pessoa mantém o julgamento e precisa avaliar a proposta antes de usá-la.",
        ],
        topic: "Autoria e responsabilidade",
      },
    ],
  },
}

export function levelForScore(
  score: number,
  total = placementQuestions.length,
): Level {
  const ratio = total ? score / total : 0
  if (ratio >= 0.75) return "Avançado"
  if (ratio >= 0.4) return "Intermediário"
  return "Iniciante"
}
