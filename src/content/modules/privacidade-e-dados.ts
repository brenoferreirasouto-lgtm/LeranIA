import type { Module } from "../types";

// RASCUNHO para revisão da equipe — U07 (conteúdo e quiz de privacidade).
export const privacidadeEDados: Module = {
  slug: "privacidade-e-dados",
  storyIds: ["U07"],
  title: "Privacidade e dados sensíveis",
  summary: "O que acontece com o que você digita, o que nunca colar num chat de IA e como pedir ajuda sem expor ninguém.",
  skill: "privacidade",
  estimatedMinutes: 9,
  lesson: [
    {
      heading: "O que acontece com o que você digita",
      blocks: [
        {
          type: "paragraph",
          text: "O que você escreve num chat de IA é enviado aos servidores da empresa responsável. Dependendo da ferramenta e das configurações, a conversa pode ser armazenada, revisada por pessoas ou usada para melhorar os modelos.",
        },
        {
          type: "paragraph",
          text: "Por isso, antes de usar uma ferramenta nova, leia a política de privacidade e veja quais opções existem nas configurações.",
        },
      ],
    },
    {
      heading: "Dados pessoais e dados sensíveis",
      blocks: [
        {
          type: "paragraph",
          text: "Pela Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018), dado pessoal é qualquer informação que identifica uma pessoa ou permite identificá-la, como nome completo, CPF, endereço, telefone e e-mail.",
        },
        {
          type: "paragraph",
          text: "Alguns dados são sensíveis e pedem ainda mais cuidado: origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização religiosa, filosófica ou política, dados de saúde ou da vida sexual, e dados genéticos ou biométricos.",
        },
      ],
    },
    {
      heading: "O que não colar num chat de IA",
      blocks: [
        {
          type: "list",
          items: [
            "Senhas, códigos de verificação e chaves de acesso.",
            "Documentos com CPF, RG, dados bancários ou de cartão.",
            "Informações de saúde, suas ou de outras pessoas.",
            "Dados de colegas, clientes ou pacientes sem autorização.",
            "Documentos internos ou confidenciais do trabalho ou do estágio.",
          ],
        },
      ],
    },
    {
      heading: "Como pedir ajuda sem expor ninguém",
      blocks: [
        {
          type: "list",
          items: [
            "Anonimize: troque nomes por \"Pessoa A\" e remova números, endereços e e-mails.",
            "Generalize: descreva a situação sem detalhes que identifiquem alguém.",
            "Pergunte-se: \"Eu publicaria isso num lugar público?\" Se não, não cole.",
            "Veja se a ferramenta permite desativar o uso das conversas para treinamento.",
          ],
        },
        {
          type: "example",
          label: "Expõe dados de outra pessoa",
          text: "Revise este e-mail para a cliente Joana Martins, CPF 000.000.000-00, sobre o atraso no pagamento dela.",
          verdict: "ruim",
        },
        {
          type: "example",
          label: "Mesmo pedido, sem dados pessoais",
          text: "Revise este e-mail para uma cliente sobre um atraso no pagamento. Quero um tom educado e direto.",
          verdict: "bom",
        },
        {
          type: "tip",
          title: "Vale também para a IA dentro de outros apps",
          text: "Assistentes embutidos em e-mail, editores de texto e redes sociais seguem a mesma lógica: o que você envia sai do seu computador.",
        },
      ],
    },
  ],
  practice: [
    {
      id: "priv-q1",
      skill: "privacidade",
      prompt: "Qual destas informações você não deve colar num chat de IA?",
      options: [
        { id: "a", text: "Uma pergunta sobre como funciona a fotossíntese." },
        { id: "b", text: "A senha do seu e-mail, para a IA organizar sua caixa de entrada." },
        { id: "c", text: "Um texto seu, sem dados pessoais, para revisão." },
        { id: "d", text: "O enunciado de um exercício da disciplina." },
      ],
      correctOptionId: "b",
      explanation:
        "Senhas nunca devem ser compartilhadas com nenhuma ferramenta de chat. As outras opções não expõem dados pessoais.",
    },
    {
      id: "priv-q2",
      skill: "privacidade",
      scenario:
        "No estágio, você quer ajuda para analisar uma planilha com nome, telefone e histórico de compras de clientes.",
      prompt: "O que fazer?",
      options: [
        { id: "a", text: "Colar a planilha inteira, já que é para o trabalho." },
        {
          id: "b",
          text: "Remover ou substituir nomes e telefones e confirmar se a empresa permite usar a ferramenta.",
        },
        { id: "c", text: "Colar só metade da planilha." },
        { id: "d", text: "Enviar a planilha e pedir para a IA apagar depois." },
      ],
      correctOptionId: "b",
      explanation:
        "Os dados são dos clientes, não seus. Anonimizar e seguir a política da empresa protege as pessoas e você. Pedir para \"apagar depois\" não garante nada.",
    },
    {
      id: "priv-q3",
      skill: "privacidade",
      prompt: "Pela LGPD, qual destes é um dado pessoal sensível?",
      options: [
        { id: "a", text: "A cor favorita de alguém." },
        { id: "b", text: "Uma informação sobre a saúde de uma pessoa." },
        { id: "c", text: "O nome da cidade onde você estuda." },
        { id: "d", text: "O curso que você faz." },
      ],
      correctOptionId: "b",
      explanation:
        "A LGPD lista dados de saúde entre os dados sensíveis, junto com origem racial ou étnica, religião, opinião política, filiação sindical, vida sexual e dados genéticos ou biométricos.",
    },
    {
      id: "priv-q4",
      skill: "privacidade",
      sample: {
        label: "Prompt",
        text: "Minha colega Ana Paula Ribeiro, do 3º período, está com dengue e faltou às provas. Escreva um e-mail para o professor explicando.",
      },
      prompt: "Qual é o problema deste prompt?",
      options: [
        { id: "a", text: "Nenhum, é para ajudar a colega." },
        { id: "b", text: "Expõe o nome e uma informação de saúde de outra pessoa sem autorização." },
        { id: "c", text: "Está longo demais." },
        { id: "d", text: "Não diz o formato da resposta." },
      ],
      correctOptionId: "b",
      explanation:
        "Saúde é dado sensível e pertence à colega. Dá para pedir o mesmo e-mail sem o nome nem o diagnóstico, e ela decide o que contar ao professor.",
    },
    {
      id: "priv-q5",
      skill: "privacidade",
      prompt: "Antes de usar uma ferramenta de IA nova com textos do seu trabalho, o que vale conferir?",
      options: [
        { id: "a", text: "Se o aplicativo tem modo escuro." },
        { id: "b", text: "A política de privacidade e se as conversas podem ser usadas para treinar o modelo." },
        { id: "c", text: "Quantas pessoas usam a ferramenta." },
        { id: "d", text: "Se a ferramenta é gratuita." },
      ],
      correctOptionId: "b",
      explanation:
        "A política de privacidade e as configurações dizem o que acontece com o que você envia. Popularidade e preço não respondem isso.",
    },
  ],
};
