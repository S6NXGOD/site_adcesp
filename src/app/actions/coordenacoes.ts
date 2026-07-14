"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";
import { TipoCoordenacao, StatusDiretoria } from "@prisma/client";

type Membro = { cargo: string; nome: string; foto?: string; email?: string };

function parseMembros(formData: FormData): Membro[] {
  const raw = formData.get("membrosJson");
  if (!raw) return [];
  try {
    const arr = JSON.parse(String(raw));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// --------------------------- COORDENAÇÕES ---------------------------

export async function salvarCoordenacao(
  formData: FormData,
  id?: string
): Promise<ActionResult> {
  await requireAuth();
  const tipo = String(formData.get("tipo") ?? "ESTADUAL") as TipoCoordenacao;
  const nomeRegiao = String(formData.get("nomeRegiao") ?? "");
  const descricao = String(formData.get("descricao") ?? "");
  const ordem = Number(formData.get("ordem") ?? 0);
  const membros = parseMembros(formData);

  if (tipo === "REGIONAL" && !nomeRegiao) {
    return { success: false, error: "Informe o nome da região/campus." };
  }

  const data = {
    tipo,
    nomeRegiao: tipo === "REGIONAL" ? nomeRegiao : null,
    descricao: descricao || null,
    membrosJson: membros,
    ordem,
  };

  if (id) {
    await prisma.coordenacao.update({ where: { id }, data });
  } else {
    await prisma.coordenacao.create({ data });
  }

  revalidatePath("/admin/coordenacoes");
  revalidatePath("/quem-somos");
  return { success: true, message: "Coordenação salva com sucesso." };
}

export async function excluirCoordenacao(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.coordenacao.delete({ where: { id } });
  revalidatePath("/admin/coordenacoes");
  revalidatePath("/quem-somos");
  return { success: true, message: "Coordenação removida." };
}

// --------------------------- DIRETORIAS ---------------------------

export async function salvarDiretoria(
  formData: FormData,
  id?: string
): Promise<ActionResult> {
  await requireAuth();
  const gestao = String(formData.get("gestao") ?? "");
  const status = String(formData.get("status") ?? "PASSADA") as StatusDiretoria;
  const descricao = String(formData.get("descricao") ?? "");
  const cargos = parseMembros(formData); // mesmo formato { cargo, nome, foto }

  if (!gestao) {
    return { success: false, error: "Informe a gestão (ex: 2024-2026)." };
  }

  const data = {
    gestao,
    status,
    descricao: descricao || null,
    cargosJson: cargos,
  };

  // Se marcar como ATUAL, rebaixa as demais para PASSADA
  if (status === "ATUAL") {
    await prisma.diretoriaHistorico.updateMany({
      where: { status: "ATUAL" },
      data: { status: "PASSADA" },
    });
  }

  if (id) {
    await prisma.diretoriaHistorico.update({ where: { id }, data });
  } else {
    await prisma.diretoriaHistorico.create({ data });
  }

  revalidatePath("/admin/diretorias");
  revalidatePath("/quem-somos");
  return { success: true, message: "Diretoria salva com sucesso." };
}

export async function excluirDiretoria(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.diretoriaHistorico.delete({ where: { id } });
  revalidatePath("/admin/diretorias");
  revalidatePath("/quem-somos");
  return { success: true, message: "Diretoria removida." };
}
