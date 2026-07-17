"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { clippingSchema, type ClippingInput } from "@/lib/validations";
import { dataDeInput } from "@/lib/utils";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";

function revalidar() {
  revalidatePath("/admin/imprensa");
  revalidatePath("/saiu-na-imprensa");
  revalidatePath("/");
}

function toData(d: ClippingInput) {
  return {
    titulo: d.titulo,
    urlExterna: d.urlExterna,
    nomeVeiculo: d.nomeVeiculo,
    dataPublicacao: dataDeInput(d.dataPublicacao),
    caminhoImagemCapa: d.caminhoImagemCapa || null,
    status: d.status,
  };
}

export async function criarClipping(
  input: ClippingInput
): Promise<ActionResult> {
  await requireAuth();
  const parsed = clippingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.clippingImprensa.create({ data: toData(parsed.data) });
  revalidar();
  return { success: true, message: "Recorte cadastrado." };
}

export async function atualizarClipping(
  id: string,
  input: ClippingInput
): Promise<ActionResult> {
  await requireAuth();
  const parsed = clippingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.clippingImprensa.update({
    where: { id },
    data: toData(parsed.data),
  });
  revalidar();
  return { success: true, message: "Recorte atualizado." };
}

export async function excluirClipping(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.clippingImprensa.delete({ where: { id } });
  revalidar();
  return { success: true, message: "Recorte excluído." };
}
