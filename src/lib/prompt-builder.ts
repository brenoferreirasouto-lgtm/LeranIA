/*
 * SP06 — construtor guiado de prompts. Funções puras: rodam no navegador e
 * nada do que a pessoa escreve é enviado ao servidor.
 */

export type PromptFields = {
  contexto: string;
  objetivo: string;
  formato: string;
  restricoes: string;
};

export type FieldKey = keyof PromptFields;

export const EMPTY_FIELDS: PromptFields = { contexto: "", objetivo: "", formato: "", restricoes: "" };

/** Monta o prompt final na ordem contexto → objetivo → formato → restrições. */
export function buildPrompt(fields: PromptFields): string {
  const contexto = fields.contexto.trim();
  const objetivo = fields.objetivo.trim();
  const formato = fields.formato.trim();
  const restricoes = fields.restricoes.trim();

  return [
    contexto,
    objetivo,
    formato ? `Formato da resposta: ${formato}` : "",
    restricoes ? `Restrições: ${restricoes}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export type PersonalDataKind = "e-mail" | "CPF" | "telefone" | "número de cartão" | "senha";

const PATTERNS: { kind: PersonalDataKind; regex: RegExp }[] = [
  { kind: "e-mail", regex: /[^\s@]+@[^\s@]+\.[^\s@]{2,}/ },
  { kind: "CPF", regex: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b/ },
  { kind: "número de cartão", regex: /\b(?:\d{4}[ -]){3}\d{4}\b|\b\d{16}\b/ },
  { kind: "telefone", regex: /\(?\b\d{2}\)?[\s-]?9?\d{4}[\s-]\d{4}\b/ },
  { kind: "senha", regex: /\bsenhas?\b\s*[:=]?\s*\S+/i },
];

/** Encontra sinais de dados pessoais no texto (U07): avisa, não bloqueia. */
export function findPersonalData(text: string): PersonalDataKind[] {
  return PATTERNS.filter((p) => p.regex.test(text)).map((p) => p.kind);
}

export type PromptCheck = {
  ready: boolean;
  /** Dicas para melhorar o prompt (elementos vazios ou vagos). */
  tips: string[];
  personalData: PersonalDataKind[];
};

const MIN_OBJECTIVE = 15;

/** Feedback sobre o prompt montado: o que falta e o que pode expor alguém. */
export function checkPrompt(fields: PromptFields): PromptCheck {
  const tips: string[] = [];
  const objetivo = fields.objetivo.trim();

  if (!objetivo) {
    tips.push("Escreva o objetivo: é o único elemento obrigatório.");
  } else if (objetivo.length < MIN_OBJECTIVE) {
    tips.push("O objetivo está curto. Diga exatamente o que você quer, como \"Explique a diferença entre…\".");
  }
  if (!fields.contexto.trim()) {
    tips.push("Sem contexto, a resposta tende a ser genérica. Conte para quem é e em que situação.");
  }
  if (!fields.formato.trim()) {
    tips.push("Sem formato, a resposta pode vir longa demais. Defina tamanho ou estrutura.");
  }
  if (!fields.restricoes.trim()) {
    tips.push("Pense no que evitar: termos técnicos, fontes sem referência, reescrever o seu texto…");
  }

  const allText = Object.values(fields).join("\n");
  return { ready: objetivo.length > 0, tips, personalData: findPersonalData(allText) };
}
