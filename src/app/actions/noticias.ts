"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugifyUrl } from "@/lib/utils";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";

const MAX_SLIDE = 5;
const AUTORIA_PADRAO = "ASCOM ADCESP";

type Parsed = {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  imagemCapa: string | null;
  dataPublicacao: Date;
  publicado: boolean;
  destaque: boolean;
  galeria: string[];
  documentos: { url: string; nome: string; tipo?: string }[];
  categoriaIds: string[];
};

function jsonArray<T>(raw: FormDataEntryValue | null): T[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(String(raw));
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

function parse(formData: FormData): { data?: Parsed; error?: string } {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const resumo = String(formData.get("resumo") ?? "").trim();
  const conteudo = String(formData.get("conteudo") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const imagemCapa = String(formData.get("imagemCapa") ?? "").trim();
  const publicado =
    formData.get("publicado") === "on" || formData.get("publicado") === "true";
  const destaque =
    formData.get("destaque") === "on" || formData.get("destaque") === "true";
  const dataRaw = String(formData.get("dataPublicacao") ?? "");

  if (titulo.length < 3) return { error: "Informe um título válido." };
  if (resumo.length < 5) return { error: "Informe um resumo." };
  // conteudo pode vir como "<p></p>" vazio do editor
  const conteudoLimpo = conteudo.replace(/<p><\/p>/g, "").trim();
  if (!conteudoLimpo || conteudoLimpo === "<p></p>")
    return { error: "O conteúdo da notícia não pode ficar vazio." };
  if (destaque && !imagemCapa)
    return {
      error:
        "Para destacar no carrossel é necessário enviar a imagem de destaque.",
    };

  return {
    data: {
      titulo,
      slug: slugifyUrl(slugInput || titulo),
      resumo,
      conteudo,
      imagemCapa: imagemCapa || null,
      dataPublicacao: dataRaw ? new Date(dataRaw) : new Date(),
      publicado,
      destaque,
      galeria: jsonArray<string>(formData.get("galeria")),
      documentos: jsonArray<{ url: string; nome: string; tipo?: string }>(
        formData.get("documentos")
      ),
      categoriaIds: jsonArray<string>(formData.get("categoriaIds")),
    },
  };
}

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = base || "noticia";
  let i = 1;
  while (true) {
    const existing = await prisma.noticia.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) break;
    slug = `${base}-${i++}`;
  }
  return slug;
}

/**
 * Mantém no máximo 5 notícias em destaque (carrossel). Ao exceder, remove o
 * destaque das mais antigas (menor destaqueEm) — FIFO.
 */
async function enforceCarouselLimit() {
  const destaques = await prisma.noticia.findMany({
    where: { destaque: true },
    orderBy: { destaqueEm: "desc" },
    select: { id: true },
  });
  if (destaques.length > MAX_SLIDE) {
    const remover = destaques.slice(MAX_SLIDE).map((d) => d.id);
    await prisma.noticia.updateMany({
      where: { id: { in: remover } },
      data: { destaque: false, destaqueEm: null },
    });
  }
}

function revalidarTudo(slug?: string) {
  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
  revalidatePath("/");
  if (slug) revalidatePath(`/noticias/${slug}`);
}

export async function criarNoticia(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth();
  const { data, error } = parse(formData);
  if (error) return { success: false, error };
  const d = data!;
  const slug = await uniqueSlug(d.slug);

  await prisma.noticia.create({
    data: {
      titulo: d.titulo,
      slug,
      resumo: d.resumo,
      conteudo: d.conteudo,
      imagemCapa: d.imagemCapa,
      autoria: AUTORIA_PADRAO,
      dataPublicacao: d.dataPublicacao,
      publicado: d.publicado,
      destaque: d.destaque,
      destaqueEm: d.destaque ? new Date() : null,
      galeria: d.galeria,
      documentos: d.documentos,
      autorId: session.user.id,
      categorias: { connect: d.categoriaIds.map((id) => ({ id })) },
    },
  });

  if (d.destaque) await enforceCarouselLimit();
  revalidarTudo(slug);
  return {
    success: true,
    message: d.publicado ? "Notícia publicada." : "Rascunho salvo.",
  };
}

export async function atualizarNoticia(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const { data, error } = parse(formData);
  if (error) return { success: false, error };
  const d = data!;

  const anterior = await prisma.noticia.findUnique({
    where: { id },
    select: { destaque: true, destaqueEm: true },
  });
  if (!anterior) return { success: false, error: "Notícia não encontrada." };

  // Define destaqueEm: novo timestamp ao ativar; mantém ao permanecer; limpa ao desativar.
  let destaqueEm: Date | null = null;
  if (d.destaque) {
    destaqueEm = anterior.destaque && anterior.destaqueEm
      ? anterior.destaqueEm
      : new Date();
  }

  const slug = await uniqueSlug(d.slug, id);

  await prisma.noticia.update({
    where: { id },
    data: {
      titulo: d.titulo,
      slug,
      resumo: d.resumo,
      conteudo: d.conteudo,
      imagemCapa: d.imagemCapa,
      dataPublicacao: d.dataPublicacao,
      publicado: d.publicado,
      destaque: d.destaque,
      destaqueEm,
      galeria: d.galeria,
      documentos: d.documentos,
      categorias: { set: d.categoriaIds.map((cid) => ({ id: cid })) },
    },
  });

  if (d.destaque && !anterior.destaque) await enforceCarouselLimit();
  revalidarTudo(slug);
  return { success: true, message: "Notícia atualizada." };
}

/** Alterna publicado/rascunho a partir da listagem. */
export async function alternarPublicacao(
  id: string
): Promise<ActionResult> {
  await requireAuth();
  const noticia = await prisma.noticia.findUnique({
    where: { id },
    select: { publicado: true },
  });
  if (!noticia) return { success: false, error: "Notícia não encontrada." };
  await prisma.noticia.update({
    where: { id },
    data: { publicado: !noticia.publicado },
  });
  revalidarTudo();
  return {
    success: true,
    message: noticia.publicado
      ? "Notícia movida para rascunho."
      : "Notícia publicada.",
  };
}

/** Alterna destaque no carrossel a partir da listagem (aplica limite de 5). */
export async function alternarDestaque(id: string): Promise<ActionResult> {
  await requireAuth();
  const noticia = await prisma.noticia.findUnique({
    where: { id },
    select: { destaque: true, imagemCapa: true },
  });
  if (!noticia) return { success: false, error: "Notícia não encontrada." };
  if (!noticia.destaque && !noticia.imagemCapa) {
    return {
      success: false,
      error: "Adicione uma imagem de destaque antes de enviar ao carrossel.",
    };
  }
  const ativar = !noticia.destaque;
  await prisma.noticia.update({
    where: { id },
    data: { destaque: ativar, destaqueEm: ativar ? new Date() : null },
  });
  if (ativar) await enforceCarouselLimit();
  revalidarTudo();
  return {
    success: true,
    message: ativar
      ? "Adicionada ao carrossel."
      : "Removida do carrossel.",
  };
}

export async function excluirNoticia(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.noticia.delete({ where: { id } });
  revalidarTudo();
  return { success: true, message: "Notícia excluída." };
}
