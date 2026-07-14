"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getYoutubeId } from "@/lib/utils";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";

export async function salvarVideo(
  formData: FormData,
  id?: string
): Promise<ActionResult> {
  await requireAuth();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const ordem = Number(formData.get("ordem") ?? 0) || 0;
  const ativo = formData.get("ativo") !== "false";

  if (titulo.length < 2) return { success: false, error: "Informe o título." };
  if (!url) return { success: false, error: "Informe a URL do vídeo." };
  if (!getYoutubeId(url)) {
    return {
      success: false,
      error: "URL de YouTube inválida. Cole o link do vídeo (youtube.com ou youtu.be).",
    };
  }

  const data = { titulo, url, descricao: descricao || null, ordem, ativo };

  if (id) {
    await prisma.video.update({ where: { id }, data });
  } else {
    await prisma.video.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/videos");
  revalidatePath("/admin/videos");
  return { success: true, message: "Vídeo salvo." };
}

export async function excluirVideo(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.video.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/videos");
  revalidatePath("/admin/videos");
  return { success: true, message: "Vídeo removido." };
}
