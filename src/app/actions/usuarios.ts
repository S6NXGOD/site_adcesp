"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin, type ActionResult } from "@/lib/action-helpers";
import { Role } from "@prisma/client";

function parseModulos(raw: FormDataEntryValue | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(String(raw));
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export async function salvarUsuario(
  formData: FormData,
  id?: string
): Promise<ActionResult> {
  await requireAdmin();

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const role = (String(formData.get("role") ?? "EDITOR") as Role) || "EDITOR";
  const ativo = formData.get("ativo") !== "false";
  // ADMIN acessa tudo; para EDITOR guardamos os módulos escolhidos.
  const modulos = role === "ADMIN" ? [] : parseModulos(formData.get("modulos"));

  if (nome.length < 3) return { success: false, error: "Informe o nome." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { success: false, error: "E-mail inválido." };
  if (!id && senha.length < 6)
    return { success: false, error: "A senha deve ter ao menos 6 caracteres." };
  if (id && senha && senha.length < 6)
    return { success: false, error: "A nova senha deve ter ao menos 6 caracteres." };

  // E-mail único
  const emailEmUso = await prisma.usuario.findFirst({
    where: { email, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (emailEmUso) return { success: false, error: "Este e-mail já está em uso." };

  if (id) {
    await prisma.usuario.update({
      where: { id },
      data: {
        nome,
        email,
        role,
        ativo,
        modulos,
        ...(senha ? { senha: await bcrypt.hash(senha, 10) } : {}),
      },
    });
  } else {
    await prisma.usuario.create({
      data: {
        nome,
        email,
        role,
        ativo,
        modulos,
        senha: await bcrypt.hash(senha, 10),
      },
    });
  }

  revalidatePath("/admin/usuarios");
  return { success: true, message: "Usuário salvo com sucesso." };
}

export async function excluirUsuario(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (session.user.id === id) {
    return { success: false, error: "Você não pode excluir o próprio usuário." };
  }
  await prisma.usuario.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
  return { success: true, message: "Usuário removido." };
}
