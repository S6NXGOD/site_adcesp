"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";

// =====================================================================
// CONTATOS (WhatsApp)
// =====================================================================

export async function salvarContato(
  formData: FormData,
  id?: string
): Promise<ActionResult> {
  await requireAuth();
  const setor = String(formData.get("setor") ?? "").trim();
  const numero = String(formData.get("numero") ?? "").trim();
  if (!setor || !numero) {
    return { success: false, error: "Informe o setor e o número." };
  }
  const data = {
    setor,
    numero,
    mensagem: String(formData.get("mensagem") ?? "").trim() || null,
    ordem: Number(formData.get("ordem") ?? 0) || 0,
    ativo: formData.get("ativo") !== "false",
  };

  if (id) {
    await prisma.contatoWhatsapp.update({ where: { id }, data });
  } else {
    await prisma.contatoWhatsapp.create({ data });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/contato");
  return { success: true, message: "Contato salvo." };
}

export async function excluirContato(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.contatoWhatsapp.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/contato");
  return { success: true, message: "Contato removido." };
}
