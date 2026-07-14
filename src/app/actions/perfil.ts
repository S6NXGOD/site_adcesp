"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";

/** Atualiza os dados de perfil do usuário logado (nome, e-mail). */
export async function atualizarPerfil(input: {
  nome: string;
  email: string;
}): Promise<ActionResult> {
  const session = await requireAuth();
  const nome = input.nome.trim();
  const email = input.email.trim().toLowerCase();

  if (nome.length < 3) return { success: false, error: "Informe seu nome." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { success: false, error: "E-mail inválido." };

  const emailEmUso = await prisma.usuario.findFirst({
    where: { email, NOT: { id: session.user.id } },
    select: { id: true },
  });
  if (emailEmUso) {
    return { success: false, error: "Este e-mail já está em uso." };
  }

  await prisma.usuario.update({
    where: { id: session.user.id },
    data: { nome, email },
  });

  revalidatePath("/admin/configuracoes");
  return { success: true, message: "Perfil atualizado com sucesso." };
}

/** Altera a senha do usuário logado (exige a senha atual). */
export async function alterarSenha(input: {
  senhaAtual: string;
  novaSenha: string;
}): Promise<ActionResult> {
  const session = await requireAuth();

  if (input.novaSenha.length < 6) {
    return {
      success: false,
      error: "A nova senha deve ter ao menos 6 caracteres.",
    };
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    select: { senha: true },
  });
  if (!usuario) return { success: false, error: "Usuário não encontrado." };

  const ok = await bcrypt.compare(input.senhaAtual, usuario.senha);
  if (!ok) return { success: false, error: "Senha atual incorreta." };

  const hash = await bcrypt.hash(input.novaSenha, 10);
  await prisma.usuario.update({
    where: { id: session.user.id },
    data: { senha: hash },
  });

  return { success: true, message: "Senha alterada com sucesso." };
}
