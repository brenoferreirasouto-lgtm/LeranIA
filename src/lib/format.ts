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
