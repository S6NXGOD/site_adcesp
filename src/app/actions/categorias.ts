"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";

export type CategoriaDTO = {
  id: string;
  nome: string;
  slug: string;
  cor: string | null;
};

/** Cadastro rápido de categoria (usado no formulário de notícia). */
export async function criarCategoria(
  nome: string,
  cor?: string
): Promise<ActionResult<CategoriaDTO>> {
  await requireAuth();
  const limpo = nome.trim();
  if (limpo.length < 2) {
    return { success: false, error: "Nome de categoria muito curto." };
  }
  const slug = slugify(limpo);

  const existente = await prisma.categoria.findFirst({
    where: { OR: [{ slug }, { nome: limpo }] },
  });
  if (existente) {
    // Já existe: retorna a existente para o formulário apenas selecioná-la.
    return {
      success: true,
      data: {
        id: existente.id,
        nome: existente.nome,
        slug: existente.slug,
        cor: existente.cor,
      },
      message: "Categoria já existia — selecionada.",
    };
  }

  const cat = await prisma.categoria.create({
    data: { nome: limpo, slug, cor: cor || null },
  });
  revalidatePath("/admin/noticias");
  return {
    success: true,
    data: { id: cat.id, nome: cat.nome, slug: cat.slug, cor: cat.cor },
    message: "Categoria criada.",
  };
}

export async function excluirCategoria(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.categoria.delete({ where: { id } });
  revalidatePath("/admin/noticias");
  return { success: true, message: "Categoria removida." };
}
