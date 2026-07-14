"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { eventoSchema } from "@/lib/validations";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";

function parseForm(formData: FormData) {
  return {
    titulo: String(formData.get("titulo") ?? ""),
    descricao: String(formData.get("descricao") ?? ""),
    dataInicio: String(formData.get("dataInicio") ?? ""),
    dataFim: String(formData.get("dataFim") ?? ""),
    local: String(formData.get("local") ?? ""),
    imagem: String(formData.get("imagem") ?? ""),
    linkInscricao: String(formData.get("linkInscricao") ?? ""),
    publicado: formData.get("publicado") === "on" || formData.get("publicado") === "true",
  };
}

async function uniqueSlug(titulo: string, ignoreId?: string) {
  const base = slugify(titulo);
  let slug = base;
  let i = 1;
  while (true) {
    const existing = await prisma.evento.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) break;
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function criarEvento(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth();
  const parsed = eventoSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;

  await prisma.evento.create({
    data: {
      titulo: d.titulo,
      slug: await uniqueSlug(d.titulo),
      descricao: d.descricao,
      dataInicio: new Date(d.dataInicio),
      dataFim: d.dataFim ? new Date(d.dataFim) : null,
      local: d.local || null,
      imagem: d.imagem || null,
      linkInscricao: d.linkInscricao || null,
      publicado: d.publicado,
      autorId: session.user.id,
    },
  });

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");
  return { success: true, message: "Evento criado com sucesso." };
}

export async function atualizarEvento(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const parsed = eventoSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;

  await prisma.evento.update({
    where: { id },
    data: {
      titulo: d.titulo,
      slug: await uniqueSlug(d.titulo, id),
      descricao: d.descricao,
      dataInicio: new Date(d.dataInicio),
      dataFim: d.dataFim ? new Date(d.dataFim) : null,
      local: d.local || null,
      imagem: d.imagem || null,
      linkInscricao: d.linkInscricao || null,
      publicado: d.publicado,
    },
  });

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  return { success: true, message: "Evento atualizado com sucesso." };
}

export async function excluirEvento(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.evento.delete({ where: { id } });
  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  return { success: true, message: "Evento excluído." };
}
