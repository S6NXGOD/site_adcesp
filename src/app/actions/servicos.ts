"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";
import { TipoServico } from "@prisma/client";

const slugByTipo: Record<string, string> = {
  ESPACO_JURIDICO: "espaco-juridico",
  PARCERIA_SESC: "parceria-sesc",
  ESPACO_LAZER: "espaco-lazer",
  PLANO_SAUDE: "plano-saude",
};

export async function salvarServico(
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const tipo = String(formData.get("tipo") ?? "") as TipoServico;
  const titulo = String(formData.get("titulo") ?? "");
  const resumo = String(formData.get("resumo") ?? "");
  const conteudo = String(formData.get("conteudo") ?? "");
  const imagem = String(formData.get("imagem") ?? "");
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const publicado = formData.get("publicado") !== "false";

  if (!tipo || !titulo) {
    return { success: false, error: "Tipo e título são obrigatórios." };
  }

  const slug = slugByTipo[tipo] ?? slugify(titulo);
  const dados = {
    titulo,
    resumo,
    conteudo,
    imagem: imagem || null,
    videoUrl: videoUrl || null,
    publicado,
  };

  await prisma.servico.upsert({
    where: { tipo },
    create: { tipo, slug, ...dados },
    update: dados,
  });

  revalidatePath("/admin/servicos");
  revalidatePath(`/servicos/${slug}`);
  return { success: true, message: "Serviço salvo com sucesso." };
}
