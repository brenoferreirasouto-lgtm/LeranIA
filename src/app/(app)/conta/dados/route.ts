import { getCurrentUser } from "@/lib/session";
import { exportUserData } from "@/server/account";

/**
 * Download dos dados da própria pessoa (LGPD, art. 18, II e V). Só a pessoa
 * logada recebe os próprios dados; a resposta nunca é guardada em cache.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Entre na sua conta para baixar seus dados.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const data = await exportUserData(user.id);
  if (!data) return new Response("Conta não encontrada.", { status: 404, headers: { "Cache-Control": "no-store" } });

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="learn-ai-meus-dados.json"',
      "Cache-Control": "no-store",
    },
  });
}
