import { createHash } from "node:crypto";

/** Só o hash entra no banco: nem o e-mail nem o IP ficam gravados. */
export function hashKey(scope: string, value: string): string {
  const digest = createHash("sha256").update(value).digest("hex");
  return `${scope}:${digest}`;
}

/** IP do cliente informado pelo proxy da hospedagem (primeiro da lista). */
export function clientIp(forwardedFor: string | null, realIp: string | null): string {
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || realIp?.trim() || "desconhecido";
}
