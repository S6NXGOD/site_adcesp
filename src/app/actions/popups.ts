"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";

function revalidar() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/popup");
}

/** Cria ou edita um pop-up de imagem. */
export async function salvarPopup(
  formData: FormData,
  id?: string
): Promise<ActionResult> {
  await requireAuth();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const imagem = String(formData.get("imagem") ?? "").trim();
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  const tempoExibicao = Math.max(
    0,
    Math.min(120, Number(formData.get("tempoExibicao") ?? 0) || 0)
  );

  if (titulo.length < 2)
    return { success: false, error: "Informe um título (referência interna)." };
  if (!imagem)
    return { success: false, error: "Envie a imagem (arte) do pop-up." };

  const data = {
    titulo,
    imagem,
    linkUrl: linkUrl || null,
    tempoExibicao,
  };

  if (id) {
    await prisma.popup.update({ where: { id }, data });
  } else {
    await prisma.popup.create({ data });
  }

  revalidar();
  return { success: true, message: "Pop-up salvo." };
}

/**
 * Ativa/desativa um pop-up. Apenas um pode ficar ativo por vez: ao ativar,
 * os demais são desativados.
 */
export async function alternarAtivoPopup(id: string): Promise<ActionResult> {
  await requireAuth();
  const popup = await prisma.popup.findUnique({
    where: { id },
    select: { ativo: true },
  });
  if (!popup) return { success: false, error: "Pop-up não encontrado." };

  const ativar = !popup.ativo;
  if (ativar) {
    await prisma.$transaction([
      prisma.popup.updateMany({
        where: { id: { not: id } },
        data: { ativo: false },
      }),
      prisma.popup.update({ where: { id }, data: { ativo: true } }),
    ]);
  } else {
    await prisma.popup.update({ where: { id }, data: { ativo: false } });
  }

  revalidar();
  return {
    success: true,
    message: ativar ? "Pop-up ativado." : "Pop-up desativado.",
  };
}

export async function excluirPopup(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.popup.delete({ where: { id } });
  revalidar();
  return { success: true, message: "Pop-up removido." };
}
