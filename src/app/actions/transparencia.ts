"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { transparenciaSchema } from "@/lib/validations";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";
import { TipoTransparencia } from "@prisma/client";

function parseForm(formData: FormData) {
  return {
    tipo: String(formData.get("tipo") ?? "PRESTACAO_CONTAS"),
    titulo: String(formData.get("titulo") ?? ""),
    descricao: String(formData.get("descricao") ?? ""),
    arquivoUrl: String(formData.get("arquivoUrl") ?? ""),
    dataDocumento: String(formData.get("dataDocumento") ?? ""),
  };
}

export async function criarDocumento(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAuth();
  const parsed = transparenciaSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;

  await prisma.transparencia.create({
    data: {
      tipo: d.tipo as TipoTransparencia,
      titulo: d.titulo,
      descricao: d.descricao || null,
      arquivoUrl: d.arquivoUrl,
      dataDocumento: new Date(d.dataDocumento),
      autorId: session.user.id,
    },
  });

  revalidatePath("/admin/transparencia");
  revalidatePath("/transparencia");
  return { success: true, message: "Documento publicado." };
}

export async function atualizarDocumento(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const parsed = transparenciaSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;

  await prisma.transparencia.update({
    where: { id },
    data: {
      tipo: d.tipo as TipoTransparencia,
      titulo: d.titulo,
      descricao: d.descricao || null,
      arquivoUrl: d.arquivoUrl,
      dataDocumento: new Date(d.dataDocumento),
    },
  });

  revalidatePath("/admin/transparencia");
  revalidatePath("/transparencia");
  return { success: true, message: "Documento atualizado." };
}

export async function excluirDocumento(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.transparencia.delete({ where: { id } });
  revalidatePath("/admin/transparencia");
  revalidatePath("/transparencia");
  return { success: true, message: "Documento excluído." };
}
