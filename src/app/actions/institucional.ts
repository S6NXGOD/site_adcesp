"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";

type InstitucionalInput = {
  quemSomosTexto: string;
  quemSomosVideoUrl?: string;
  historiaTexto?: string;
  historiaVideoUrl?: string;
  historiaImagem?: string;
};

/**
 * Upsert do registro único (singleton) da página institucional: texto do
 * "Quem Somos", vídeo opcional, e a seção "Nossa História" da home (texto +
 * vídeo OU imagem).
 */
export async function salvarPaginaInstitucional(
  input: InstitucionalInput
): Promise<ActionResult> {
  await requireAuth();

  const texto = (input.quemSomosTexto ?? "").trim();
  const limpo = texto.replace(/<p><\/p>/g, "").trim();
  if (!limpo) {
    return { success: false, error: "O texto do Quem Somos não pode ficar vazio." };
  }

  const data = {
    quemSomosTexto: texto,
    quemSomosVideoUrl: input.quemSomosVideoUrl?.trim() || null,
    historiaTexto: input.historiaTexto?.trim() || null,
    historiaVideoUrl: input.historiaVideoUrl?.trim() || null,
    historiaImagem: input.historiaImagem?.trim() || null,
  };

  await prisma.paginaInstitucional.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/", "layout");
  revalidatePath("/quem-somos");
  revalidatePath("/admin/institucional");
  return { success: true, message: "Conteúdo institucional atualizado." };
}
