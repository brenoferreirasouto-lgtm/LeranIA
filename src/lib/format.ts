/**
 * Datas no horário de Brasília. O servidor de produção roda em UTC; sem o
 * fuso explícito, uma atividade feita às 22h apareceria com a data do dia seguinte.
 */
const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

const dateTimeFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

/** Data e hora no horário de Brasília (ex.: 20/10/2026, 14:32). */
export function formatDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}

/** Junta itens como numa frase: "e-mail", "e-mail e CPF", "e-mail, CPF e telefone". */
export function listPt(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`;
}
