"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugifyUrl, dataDeInput } from "@/lib/utils";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";
import { StatusArtigo } from "@prisma/client";

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = base || "artigo";
  let i = 1;
  while (true) {
    const existing = await prisma.artigo.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) break;
    slug = `${base}-${i++}`;
  }
  return slug;
}

/**
 * Cria ou atualiza um artigo. Salva fisicamente a imagem de capa e a foto do
 * autor (quando enviadas) e grava os caminhos no banco.
 */
export async function salvarArtigo(
  formData: FormData,
  id?: string
): Promise<ActionResult> {
  await requireAuth();

  const titulo = String(formData.get("titulo") ?? "").trim();
  const resumo = String(formData.get("resumo") ?? "").trim();
  const conteudo = String(formData.get("conteudo") ?? "").trim();
  const autorNome = String(formData.get("autorNome") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const status = (String(formData.get("status") ?? "RASCUNHO") as StatusArtigo);
  const dataRaw = String(formData.get("dataPublicacao") ?? "");

  if (titulo.length < 3) return { success: false, error: "Informe um título." };
  if (resumo.length < 5) return { success: false, error: "Informe um resumo." };
  const conteudoLimpo = conteudo.replace(/<p><\/p>/g, "").trim();
  if (!conteudoLimpo)
    return { success: false, error: "O conteúdo não pode ficar vazio." };
  if (!autorNome)
    return { success: false, error: "Informe o nome do autor." };

  // As imagens já foram recortadas e enviadas pelo ImageCropUpload; aqui só
  // chegam os caminhos resultantes (ou vazio, se removidas).
  const caminhoImagemCapa =
    String(formData.get("caminhoImagemCapa") ?? "").trim() || null;
  const caminhoFotoAutor =
    String(formData.get("caminhoFotoAutor") ?? "").trim() || null;

  const slug = await uniqueSlug(slugifyUrl(slugInput || titulo), id);

  const data = {
    titulo,
    slug,
    resumo,
    conteudo,
    status,
    autorNome,
    caminhoImagemCapa,
    caminhoFotoAutor,
    dataPublicacao: dataRaw ? dataDeInput(dataRaw) : new Date(),
  };

  if (id) {
    await prisma.artigo.update({ where: { id }, data });
  } else {
    await prisma.artigo.create({ data });
  }

  revalidatePath("/admin/artigos");
  revalidatePath("/artigos");
  if (id) revalidatePath(`/artigos/${slug}`);
  return {
    success: true,
    message:
      status === "PUBLICADO" ? "Artigo publicado." : "Rascunho salvo.",
  };
}

/** Alterna publicado/rascunho a partir da listagem. */
export async function alternarStatusArtigo(id: string): Promise<ActionResult> {
  await requireAuth();
  const artigo = await prisma.artigo.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!artigo) return { success: false, error: "Artigo não encontrado." };
  const novo: StatusArtigo =
    artigo.status === "PUBLICADO" ? "RASCUNHO" : "PUBLICADO";
  await prisma.artigo.update({ where: { id }, data: { status: novo } });
  revalidatePath("/admin/artigos");
  revalidatePath("/artigos");
  return {
    success: true,
    message: novo === "PUBLICADO" ? "Artigo publicado." : "Movido para rascunho.",
  };
}

export async function excluirArtigo(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.artigo.delete({ where: { id } });
  revalidatePath("/admin/artigos");
  revalidatePath("/artigos");
  return { success: true, message: "Artigo excluído." };
}
