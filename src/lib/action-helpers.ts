import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type ActionResult<T = unknown> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Garante que há uma sessão autenticada antes de executar uma Server Action.
 * Lança erro se não houver sessão (a UI já protege via middleware, mas
 * validamos novamente no servidor por segurança — defesa em profundidade).
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Não autorizado. Faça login para continuar.");
  }
  return session;
}

/** Restringe a ação a administradores. */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    throw new Error("Acesso restrito a administradores.");
  }
  return session;
}
