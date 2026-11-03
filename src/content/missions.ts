import type { Mission } from "./types";

// RASCUNHO para revisão da equipe — card "Missões e Desafios Práticos" (Fase C2).
// Cada missão libera quando a pessoa conclui o módulo que ela pratica. Conclui
// com 70% dos passos certos (MISSION_PASS_PERCENT) e paga XP uma vez.
// Exemplos de respostas de IA, estudos e pessoas são fictícios.

export const MISSION_PASS_PERCENT = 70;

export const missions: Mission[] = [
  {
    id: "monte-um-prompt",
    kind: "prompt",
    title: "Monte um prompt completo",
    summary: "Use o construtor de prompt para transformar um caso real em uma instrução clara.",
    skill: "prompts",
    unlock: { kind: "module", moduleSlug: "estrutura-de-um-bom-prompt" },
    xp: 30,
    brief:
      "Você tem um seminário de 10 minutos sobre o ciclo da água na próxima semana e quer que a IA ajude a montar o roteiro da apresentação. Escreva o prompt preenchendo os quatro elementos, sem colocar dados pessoais.",
  },
  {
    id: "conserte-o-prompt",
    kind: "steps",
    title: "Conserte o prompt",
    summary: "Descubra o que falta num prompt fraco e escolha a melhor versão.",
    skill: "prompts",
    unlock: { kind: "module", moduleSlug: "comparacao-de-prompts" },
    xp: 30,
    steps: [
      {
        id: "cp-1",
        skill: "prompts",
        scenario: "Você tem prova de História na quinta-feira e pediu ajuda à IA assim:",
        sample: { label: "Prompt", text: "Faz um resumo sobre a Revolução Industrial." },
        prompt: "O que falta neste prompt? Marque todas as que se aplicam.",
        multiple: true,
        options: [
          { id: "a", text: "Contexto: para quem é e em que situação" },
          { id: "b", text: "Formato: tamanho ou estrutura da resposta" },
          { id: "c", text: "Restrições: o que evitar ou incluir" },
          { id: "d", text: "Objetivo: o que a IA deve fazer" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "O prompt diz o que fazer (resumir), então o objetivo está lá. Faltam para quem é, em que tamanho e o que evitar, e por isso a resposta tende a sair genérica.",
        hint: "O prompt já diz o que a IA deve fazer? Se sim, o objetivo não está faltando.",
      },
      {
        id: "cp-2",
        skill: "prompts",
        prompt: "Qual versão consertada é a melhor?",
        optionStyle: "prompt",
        options: [
          { id: "a", text: "Faz um resumo bem completo sobre a Revolução Industrial, por favor." },
          {
            id: "b",
            text: "Sou estudante do ensino médio e tenho prova de História na quinta. Resuma as causas e as consequências da Revolução Industrial em até 10 tópicos curtos. Não invente datas e diga o que devo conferir no meu livro.",
          },
          { id: "c", text: "Você é o maior historiador do mundo. Escreva tudo o que sabe sobre a Revolução Industrial." },
        ],
        correctOptionIds: ["b"],
        explanation:
          "O prompt B tem contexto, um objetivo específico (causas e consequências), formato (10 tópicos) e restrições. O A só pede \"completo\", e o C troca o contexto por um elogio e pede \"tudo\", o que gera um texto longo e genérico.",
        hint: "Procure a versão que tem os quatro elementos.",
      },
      {
        id: "cp-3",
        skill: "prompts",
        scenario: "A IA respondeu com 30 tópicos longos, difíceis de revisar antes da prova.",
        prompt: "Qual ajuste no prompt resolve melhor?",
        options: [
          { id: "a", text: "Enviar o mesmo prompt de novo até vir uma resposta menor" },
          { id: "b", text: "Deixar o formato explícito: \"no máximo 10 tópicos, de uma linha cada\"" },
          { id: "c", text: "Escrever \"seja breve, por favor\", sem dizer quanto" },
          { id: "d", text: "Trocar de ferramenta de IA" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "Um formato com número e tamanho é uma instrução que a IA consegue seguir. \"Seja breve\" é vago, e repetir ou trocar de ferramenta não corrige o que faltou no prompt.",
        hint: "Qual opção diz exatamente o tamanho da resposta?",
      },
      {
        id: "cp-4",
        skill: "prompts",
        prompt:
          "Você quer usar o resumo para estudar, e não para copiar. O que vale incluir nas restrições? Marque todas as que se aplicam.",
        multiple: true,
        options: [
          { id: "a", text: "Peça perguntas no fim para testar o que você entendeu" },
          { id: "b", text: "Peça para indicar o que conferir no livro ou com o professor" },
          { id: "c", text: "Peça para escrever como se fosse você, para entregar como trabalho" },
          { id: "d", text: "Peça para dizer quando não tiver certeza, em vez de inventar" },
        ],
        correctOptionIds: ["a", "b", "d"],
        explanation:
          "Perguntas de revisão, indicação do que conferir e admitir incerteza ajudam a estudar e a checar. Entregar o texto da IA como se fosse seu não é aprendizado e pode ferir as regras da escola.",
        hint: "Pense no que ajuda você a aprender e a conferir, não no que faz o trabalho por você.",
      },
    ],
  },
  {
    id: "caca-as-alucinacoes",
    kind: "steps",
    title: "Caça às alucinações",
    summary: "Encontre os sinais de conteúdo inventado numa resposta de IA e decida o que fazer.",
    skill: "alucinacoes",
    unlock: { kind: "module", moduleSlug: "alucinacoes" },
    xp: 30,
    steps: [
      {
        id: "ca-1",
        skill: "alucinacoes",
        scenario: "Para um trabalho de Ciências, você perguntou à IA sobre a história das vacinas.",
        sample: {
          label: "Resposta da IA",
          text: "A primeira vacina foi desenvolvida por Edward Jenner em 1796, contra a varíola. Segundo o estudo \"Imunização e memória coletiva\" (Revista Latino-Americana de Medicina Histórica, v. 12, p. 44-58, 2015), 98,7% dos brasileiros confiam totalmente nas vacinas. A palavra \"vacina\" vem do latim \"vacca\", porque o material usado por Jenner vinha de vacas.",
        },
        prompt: "Quais trechos têm sinais típicos de alucinação? Marque todos os que se aplicam.",
        multiple: true,
        options: [
          { id: "a", text: "O autor e o ano da primeira vacina" },
          { id: "b", text: "O título, a revista e as páginas do estudo citado" },
          { id: "c", text: "O número exato de 98,7%" },
          { id: "d", text: "A origem da palavra \"vacina\"" },
        ],
        correctOptionIds: ["b", "c"],
        explanation:
          "Citações completas, com título, volume e páginas, e números muito precisos sem fonte que dê para conferir são os sinais mais comuns de conteúdo inventado. O autor, o ano e a origem da palavra são fatos bem documentados. Se for usá-los, confira também, mas eles não são os sinais de alerta aqui.",
        hint: "Procure o que é específico demais para conferir de cabeça: nomes de estudos, páginas, porcentagens com casas decimais.",
      },
      {
        id: "ca-2",
        skill: "verificacao",
        prompt: "Você quer citar o estudo no trabalho. Qual é o primeiro passo?",
        options: [
          { id: "a", text: "Copiar a referência, já que ela tem até as páginas" },
          { id: "b", text: "Procurar o título exato do estudo no Google Acadêmico ou na SciELO" },
          { id: "c", text: "Perguntar à mesma IA se o estudo existe" },
          { id: "d", text: "Arredondar o número para 99%, para ficar mais natural" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "Buscar o título exato em bases acadêmicas é o jeito mais rápido de confirmar se o estudo existe. A mesma IA pode confirmar a própria invenção, e detalhes como páginas não provam que o estudo é real.",
        hint: "Quem pode confirmar que o estudo existe, além de quem o citou?",
      },
      {
        id: "ca-3",
        skill: "alucinacoes",
        scenario: "Você procurou o título em três bases acadêmicas e não encontrou nada.",
        prompt: "O que fazer?",
        options: [
          { id: "a", text: "Citar mesmo assim, avisando que a informação veio da IA" },
          { id: "b", text: "Não usar a citação nem o número, e buscar uma fonte confiável sobre o tema" },
          { id: "c", text: "Trocar por outra referência parecida" },
          { id: "d", text: "Manter o número e apagar só a referência" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "Se a fonte não existe, o número que dependia dela também não tem base. Avisar que veio da IA não torna a informação verdadeira, e manter o número sem a fonte esconde o problema.",
        hint: "O número continua confiável se a fonte dele não existe?",
      },
      {
        id: "ca-4",
        skill: "alucinacoes",
        prompt: "Qual pedido à IA reduz o risco de receber citações inventadas?",
        options: [
          { id: "a", text: "\"Seja mais confiante nas respostas.\"" },
          {
            id: "b",
            text: "\"Se você não tiver certeza de uma fonte, diga que não sabe e não invente referências.\"",
          },
          { id: "c", text: "\"Cite pelo menos cinco estudos.\"" },
          { id: "d", text: "\"Responda mais rápido.\"" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "Pedir que a IA admita incerteza ajuda, mas não elimina o risco: conferir continua necessário. Exigir muitos estudos aumenta a chance de invenção.",
        hint: "Qual pedido dá à IA permissão para dizer \"não sei\"?",
      },
    ],
  },
  {
    id: "checagem-de-fonte",
    kind: "steps",
    title: "Checagem de fonte",
    summary: "Siga uma resposta de IA até a fonte e decida o que pode entrar no trabalho.",
    skill: "verificacao",
    unlock: { kind: "module", moduleSlug: "verificar-informacoes" },
    xp: 30,
    steps: [
      {
        id: "cf-1",
        skill: "verificacao",
        scenario: "Para um trabalho de Sociologia, a IA respondeu:",
        sample: {
          label: "Resposta da IA",
          text: "Segundo o IBGE, o Censo 2022 contou mais de 203 milhões de pessoas no Brasil. Um estudo de Harvard mostrou que estudar ouvindo música aumenta a memória em 40%.",
        },
        prompt: "Por onde começar a conferir o número da população?",
        options: [
          { id: "a", text: "No site do IBGE (ibge.gov.br), que é a fonte citada" },
          { id: "b", text: "Num vídeo curto de curiosidades sobre o Brasil" },
          { id: "c", text: "Perguntando a outra IA" },
          { id: "d", text: "Num blog que repete o mesmo número" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "Quando a resposta cita uma fonte oficial, o primeiro passo é ir direto a ela. Vídeos, blogs e outras IAs podem só repetir o mesmo número sem conferir.",
        hint: "A própria resposta diz de onde o número veio.",
      },
      {
        id: "cf-2",
        skill: "verificacao",
        prompt: "O \"estudo de Harvard\" não tem título, autores nem ano. Qual é o problema?",
        options: [
          { id: "a", text: "Nenhum: Harvard é uma universidade confiável" },
          {
            id: "b",
            text: "Sem título, autores ou ano não dá para encontrar o estudo, e o nome da instituição sozinho não prova nada",
          },
          { id: "c", text: "O problema é só o número de 40%" },
          { id: "d", text: "Estudos de fora não valem para o Brasil" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "Uma instituição famosa sem os dados do estudo é um apelo à autoridade: soa confiável, mas não pode ser conferido. Sem título, autores e ano, não há como saber se o estudo existe.",
        hint: "Como você acharia esse estudo com o que foi dito?",
      },
      {
        id: "cf-3",
        skill: "verificacao",
        prompt: "Quais sinais mostram que uma fonte é confiável? Marque todos os que se aplicam.",
        multiple: true,
        options: [
          { id: "a", text: "Diz quem escreveu e quando" },
          { id: "b", text: "Mostra de onde vieram os dados" },
          { id: "c", text: "Aparece em primeiro lugar na busca" },
          { id: "d", text: "Usa muitas palavras difíceis" },
          { id: "e", text: "Outras fontes sérias confirmam a mesma informação" },
        ],
        correctOptionIds: ["a", "b", "e"],
        explanation:
          "Autoria, data, origem dos dados e confirmação independente permitem conferir a informação. A posição na busca e o vocabulário difícil não dizem nada sobre se ela é verdadeira.",
        hint: "Quais sinais deixam você conferir a informação por conta própria?",
      },
      {
        id: "cf-4",
        skill: "verificacao",
        scenario: "Você confirmou a população no site do IBGE, mas não encontrou o estudo sobre música.",
        prompt: "Como fica o trabalho?",
        options: [
          { id: "a", text: "Usa as duas informações, já que uma delas está certa" },
          { id: "b", text: "Usa o dado do IBGE, com a fonte, e deixa de fora a afirmação sobre música" },
          { id: "c", text: "Usa as duas sem citar fonte" },
          { id: "d", text: "Deixa as duas de fora" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "O que foi confirmado entra com a fonte; o que não foi fica de fora. Descartar tudo jogaria fora um dado verificado, e usar o que não foi confirmado espalha desinformação.",
        hint: "Trate cada afirmação separadamente.",
      },
    ],
  },
  {
    id: "o-que-nao-colar",
    kind: "steps",
    title: "O que não colar no chat",
    summary: "Limpe uma mensagem antes de enviá-la para a IA, sem perder o que ela precisa para ajudar.",
    skill: "privacidade",
    unlock: { kind: "module", moduleSlug: "privacidade-e-dados" },
    xp: 30,
    steps: [
      {
        id: "nc-1",
        skill: "privacidade",
        scenario: "Você escreveu esta mensagem para pedir ajuda à IA:",
        sample: {
          label: "Rascunho",
          text: "Oi! Sou a Marina Costa, CPF 123.456.789-00, aluna do 3º B da Escola Monte Verde. Meu colega Diego tem diabetes e faltou muito no bimestre. Escreve um e-mail para a coordenação pedindo a revisão da nota do nosso trabalho de Geografia. Meu telefone é (81) 99876-5432.",
        },
        prompt: "Quais trechos você deve tirar antes de enviar? Marque todos os que se aplicam.",
        multiple: true,
        options: [
          { id: "a", text: "O nome completo e o CPF" },
          { id: "b", text: "A informação sobre a saúde do colega" },
          { id: "c", text: "O telefone" },
          { id: "d", text: "O pedido de revisão da nota de Geografia" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "O pedido é o que a IA precisa para ajudar. Nome completo, CPF e telefone identificam você, e a saúde do colega é um dado sensível de outra pessoa, que nem é necessário para o e-mail.",
        hint: "Separe o que a IA precisa para escrever o e-mail do que só identifica pessoas.",
      },
      {
        id: "nc-2",
        skill: "privacidade",
        prompt: "Como fazer o pedido sem expor ninguém?",
        options: [
          {
            id: "a",
            text: "\"Sou estudante do ensino médio e quero pedir a revisão da nota de um trabalho de Geografia. Escreva um e-mail curto e educado para a coordenação.\"",
          },
          { id: "b", text: "Manter tudo e pedir para a IA não guardar a conversa" },
          { id: "c", text: "Trocar só o CPF por um número inventado e manter o resto" },
          { id: "d", text: "Enviar a mensagem em inglês" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "A versão A mantém a necessidade e tira os dados. Pedir para a IA não guardar não garante nada, porque você não controla o que a ferramenta faz com o texto. Trocar só o CPF deixa o nome, o telefone e a saúde do colega.",
        hint: "Qual versão a IA consegue atender sem saber quem você é?",
      },
      {
        id: "nc-3",
        skill: "privacidade",
        prompt: "A IA escreveu o e-mail. Onde entram o seu nome e a sua turma?",
        options: [
          { id: "a", text: "Você completa no e-mail, fora da IA, antes de enviar para a escola" },
          { id: "b", text: "Você pede para a IA completar com os seus dados" },
          { id: "c", text: "Em lugar nenhum: o e-mail vai sem identificação" },
          { id: "d", text: "Você manda os dados para a IA numa segunda mensagem" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "A coordenação precisa saber quem pede a revisão, mas a IA não. Use a IA para o texto e complete os seus dados você mesmo, no seu e-mail.",
        hint: "Quem precisa dos seus dados: a escola ou a IA?",
      },
      {
        id: "nc-4",
        skill: "privacidade",
        scenario:
          "Sua redação sobre cuidado com idosos conta a história da sua avó, com o nome dela, o bairro e o hospital onde ela se trata.",
        prompt: "Você quer que a IA revise o texto. Como fazer?",
        options: [
          {
            id: "a",
            text: "Trocar o que identifica a pessoa (nome, bairro, hospital) por termos genéricos antes de colar",
          },
          { id: "b", text: "Colar o texto inteiro, já que é só para a escola" },
          { id: "c", text: "Pedir para a IA ignorar os nomes" },
          { id: "d", text: "Desistir de usar IA em qualquer redação" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "Dá para pedir a revisão sem expor a sua avó: \"minha avó\", \"um bairro da cidade\" e \"o hospital\" bastam para a IA revisar o texto. Pedir para ignorar os nomes não muda o que você enviou.",
        hint: "A revisão depende do nome real dela?",
      },
    ],
  },
  {
    id: "trabalho-em-grupo",
    kind: "steps",
    title: "Trabalho em grupo com IA",
    summary: "Um caso completo: escolher o prompt, achar o erro, verificar a fonte e proteger os dados de um colega.",
    skill: "integradora",
    unlock: { kind: "track-completed" },
    xp: 60,
    steps: [
      {
        id: "tg-1",
        skill: "prompts",
        scenario:
          "Seu grupo vai apresentar um seminário de 15 minutos sobre energia solar, e você ficou responsável por usar a IA para preparar o roteiro.",
        prompt: "Qual prompt você usa para começar?",
        optionStyle: "prompt",
        options: [
          { id: "a", text: "Fala sobre energia solar." },
          {
            id: "b",
            text: "Somos um grupo do ensino médio e vamos apresentar um seminário de 15 minutos sobre energia solar. Monte um roteiro com introdução, três partes e conclusão, com uma frase de abertura para cada parte. Use linguagem simples e indique o que precisamos conferir em fontes oficiais.",
          },
          { id: "c", text: "Escreva o seminário inteiro para lermos na apresentação." },
        ],
        correctOptionIds: ["b"],
        explanation:
          "O prompt B tem contexto, objetivo, formato e uma restrição que já prepara a verificação. O A é vago, e o C pede um texto pronto para ler, que não ajuda o grupo a entender o tema.",
        hint: "Procure os quatro elementos de um bom prompt.",
      },
      {
        id: "tg-2",
        skill: "alucinacoes",
        sample: {
          label: "Trecho da resposta da IA",
          text: "Segundo relatório de 2023 da Agência Internacional de Energia Solar, a energia solar já responde por 45% da eletricidade do Brasil. Os painéis solares transformam a luz do sol em eletricidade. Em dias nublados, eles continuam gerando energia, mas menos.",
        },
        prompt: "Qual afirmação tem sinal de alerta e precisa ser checada antes de entrar no roteiro?",
        options: [
          { id: "a", text: "Os 45% e o relatório citado" },
          { id: "b", text: "Que os painéis transformam luz em eletricidade" },
          { id: "c", text: "Que eles geram menos em dias nublados" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "Um número preciso atribuído a uma organização com nome genérico é o sinal clássico de alerta. As outras duas frases descrevem como a tecnologia funciona e são fáceis de confirmar em qualquer material didático.",
        hint: "Qual trecho tem um número e uma fonte que você nunca ouviu falar?",
      },
      {
        id: "tg-3",
        skill: "verificacao",
        prompt: "Onde conferir quanto da eletricidade do Brasil vem da energia solar?",
        options: [
          {
            id: "a",
            text: "Em órgãos oficiais do setor de energia, como a Empresa de Pesquisa Energética (EPE) ou a ANEEL",
          },
          { id: "b", text: "No comentário mais curtido de um vídeo" },
          { id: "c", text: "Na própria resposta da IA" },
          { id: "d", text: "No site de uma loja que vende painéis solares" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "Órgãos oficiais publicam os dados do setor e dizem de onde eles vêm. Uma loja tem interesse em vender, um comentário não tem fonte, e a IA não pode confirmar o próprio número.",
        hint: "Quem publica dados oficiais sobre energia no Brasil?",
      },
      {
        id: "tg-4",
        skill: "privacidade",
        scenario:
          "Um colega do grupo colou na IA o nome completo e o telefone dele para a ferramenta \"personalizar\" a apresentação.",
        prompt: "O que fazer agora?",
        options: [
          { id: "a", text: "Nada: o que foi enviado não tem volta" },
          {
            id: "b",
            text: "Avisar o colega, não enviar mais dados pessoais e, se a ferramenta permitir, apagar a conversa",
          },
          { id: "c", text: "Enviar também os dados do resto do grupo, para padronizar" },
          { id: "d", text: "Pedir para a IA esquecer o que leu" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "Não dá para garantir que a ferramenta apague o que recebeu só pedindo a ela. O que está ao alcance do grupo é parar de enviar dados, apagar a conversa quando houver essa opção e combinar o cuidado com todos.",
        hint: "O que está ao alcance do grupo, e não da IA?",
      },
      {
        id: "tg-5",
        skill: "conceitos",
        prompt: "Na apresentação, como o grupo deve tratar o que veio da IA? Marque todas as que se aplicam.",
        multiple: true,
        options: [
          { id: "a", text: "Contar ao professor como a IA foi usada no trabalho" },
          { id: "b", text: "Apresentar só informações conferidas em fontes confiáveis" },
          { id: "c", text: "Ler o texto da IA como se fosse do grupo" },
          { id: "d", text: "Explicar o conteúdo com as próprias palavras" },
        ],
        correctOptionIds: ["a", "b", "d"],
        explanation:
          "A IA ajudou a organizar, mas o trabalho é do grupo: ser transparente sobre o uso, conferir as informações e explicar com as próprias palavras mostram o que vocês aprenderam. Ler o texto da IA como seu esconde o uso e não demonstra aprendizado.",
        hint: "O que mostra que o grupo entendeu o tema e foi honesto sobre o uso da IA?",
      },
    ],
  },
];

export function findMission(id: string): Mission | undefined {
  return missions.find((m) => m.id === id);
}
