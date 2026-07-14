"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import {
  eleicaoSchema,
  chapaSchema,
  candidatoSchema,
} from "@/lib/validations";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";
import { savePublicFile } from "@/lib/uploads";
import { StatusEleicao } from "@prisma/client";

// --------------------------- ELEIÇÃO ---------------------------

export async function salvarEleicao(
  formData: FormData,
  id?: string
): Promise<ActionResult<{ id: string }>> {
  await requireAuth();
  const raw = {
    titulo: String(formData.get("titulo") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    status: String(formData.get("status") ?? "AGUARDANDO"),
    descricao: String(formData.get("descricao") ?? ""),
  };
  const parsed = eleicaoSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;

  // Calendário (cronograma) como JSON opcional
  let calendarioJson: unknown = undefined;
  const calRaw = formData.get("calendarioJson");
  if (calRaw) {
    try {
      calendarioJson = JSON.parse(String(calRaw));
    } catch {
      calendarioJson = undefined;
    }
  }

  // slug: usa o biênio informado (ex: "2024/2026") ou deriva do título.
  const slug = slugify(d.slug || d.titulo);

  const data = {
    titulo: d.titulo,
    slug,
    status: d.status as StatusEleicao,
    descricao: d.descricao || null,
    ...(calendarioJson !== undefined
      ? { calendarioJson: calendarioJson as object }
      : {}),
  };

  let eleicaoId = id;
  try {
    if (id) {
      await prisma.eleicao.update({ where: { id }, data });
    } else {
      const nova = await prisma.eleicao.create({ data, select: { id: true } });
      eleicaoId = nova.id;
    }
  } catch {
    return {
      success: false,
      error: "Já existe uma eleição com este identificador (biênio).",
    };
  }

  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return {
    success: true,
    data: { id: eleicaoId! },
    message: "Eleição salva com sucesso.",
  };
}

// --------------------------- DOCUMENTOS ---------------------------

/**
 * Upload de um documento (edital/regulamento) via Dropzone. Salva o arquivo
 * fisicamente em <STORAGE_PATH>/uploads e registra no banco o caminho da API
 * (/api/files/uploads/...). O título inicial é o nome do arquivo (editável).
 */
export async function adicionarDocumentoEleicao(
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const eleicaoId = String(formData.get("eleicaoId") ?? "");
  if (!eleicaoId) return { success: false, error: "Eleição não identificada." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Nenhum arquivo enviado." };
  }

  let caminhoArquivo: string;
  try {
    caminhoArquivo = await savePublicFile(file);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Falha no upload.",
    };
  }

  // Título padrão = nome do arquivo sem extensão.
  const titulo =
    String(formData.get("titulo") ?? "").trim() ||
    file.name.replace(/\.[^.]+$/, "") ||
    "Documento";

  const max = await prisma.documentoEleicao.aggregate({
    where: { eleicaoId },
    _max: { ordem: true },
  });
  const ordem = (max._max.ordem ?? -1) + 1;

  await prisma.documentoEleicao.create({
    data: { eleicaoId, titulo, caminhoArquivo, ordem },
  });

  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return { success: true, message: "Documento enviado." };
}

/** Renomeia o título de um documento. */
export async function renomearDocumentoEleicao(
  id: string,
  titulo: string
): Promise<ActionResult> {
  await requireAuth();
  const t = titulo.trim();
  if (!t) return { success: false, error: "Informe um título." };
  await prisma.documentoEleicao.update({ where: { id }, data: { titulo: t } });
  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return { success: true, message: "Documento atualizado." };
}

/** Move um documento uma posição para cima (-1) ou para baixo (+1). */
export async function moverDocumentoEleicao(
  id: string,
  dir: -1 | 1
): Promise<ActionResult> {
  await requireAuth();
  const doc = await prisma.documentoEleicao.findUnique({
    where: { id },
    select: { eleicaoId: true },
  });
  if (!doc) return { success: false, error: "Documento não encontrado." };

  const todos = await prisma.documentoEleicao.findMany({
    where: { eleicaoId: doc.eleicaoId },
    orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
    select: { id: true },
  });
  const idx = todos.findIndex((d) => d.id === id);
  const alvo = idx + dir;
  if (alvo < 0 || alvo >= todos.length) {
    return { success: true, message: "Sem alteração." };
  }
  // Reordena a lista e normaliza a coluna `ordem` sequencialmente.
  [todos[idx], todos[alvo]] = [todos[alvo], todos[idx]];
  await prisma.$transaction(
    todos.map((d, i) =>
      prisma.documentoEleicao.update({ where: { id: d.id }, data: { ordem: i } })
    )
  );

  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return { success: true, message: "Ordem atualizada." };
}

export async function excluirDocumentoEleicao(
  id: string
): Promise<ActionResult> {
  await requireAuth();
  await prisma.documentoEleicao.delete({ where: { id } });
  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return { success: true, message: "Documento removido." };
}

// --------------------------- COMISSÃO ELEITORAL ---------------------------

export async function salvarMembroComissao(
  formData: FormData,
  id?: string
): Promise<ActionResult> {
  await requireAuth();
  const eleicaoId = String(formData.get("eleicaoId") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const cargo = String(formData.get("cargo") ?? "").trim();
  const ordem = Number(formData.get("ordem") ?? 0) || 0;

  if (!nome || !cargo)
    return { success: false, error: "Informe o nome e o cargo." };

  const data = { eleicaoId, nome, cargo, ordem };

  if (id) {
    await prisma.membroComissaoEleitoral.update({ where: { id }, data });
  } else {
    await prisma.membroComissaoEleitoral.create({ data });
  }

  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return { success: true, message: "Membro da comissão salvo." };
}

export async function excluirMembroComissao(
  id: string
): Promise<ActionResult> {
  await requireAuth();
  await prisma.membroComissaoEleitoral.delete({ where: { id } });
  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return { success: true, message: "Membro removido." };
}

export async function alterarStatusEleicao(
  id: string,
  status: StatusEleicao
): Promise<ActionResult> {
  await requireAuth();
  await prisma.eleicao.update({ where: { id }, data: { status } });
  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return { success: true, message: `Status alterado para ${status}.` };
}

export async function excluirEleicao(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.eleicao.delete({ where: { id } });
  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return { success: true, message: "Eleição removida." };
}

// --------------------------- CHAPA ---------------------------

export async function salvarChapa(
  formData: FormData,
  id?: string
): Promise<ActionResult> {
  await requireAuth();
  const raw = {
    eleicaoId: String(formData.get("eleicaoId") ?? ""),
    nome: String(formData.get("nome") ?? ""),
    numero: String(formData.get("numero") ?? ""),
    slogan: String(formData.get("slogan") ?? ""),
    logoUrl: String(formData.get("logoUrl") ?? ""),
  };
  const parsed = chapaSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;
  const data = {
    eleicaoId: d.eleicaoId,
    nome: d.nome,
    numero: d.numero,
    slogan: d.slogan || null,
    logoUrl: d.logoUrl || null,
  };

  try {
    if (id) {
      await prisma.chapa.update({ where: { id }, data });
    } else {
      await prisma.chapa.create({ data });
    }
  } catch {
    return {
      success: false,
      error: "Já existe uma chapa com este número nesta eleição.",
    };
  }

  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return { success: true, message: "Chapa salva com sucesso." };
}

export async function excluirChapa(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.chapa.delete({ where: { id } });
  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return { success: true, message: "Chapa removida." };
}

// --------------------------- CANDIDATO ---------------------------

export async function salvarCandidato(
  formData: FormData,
  id?: string
): Promise<ActionResult> {
  await requireAuth();
  const raw = {
    chapaId: String(formData.get("chapaId") ?? ""),
    nome: String(formData.get("nome") ?? ""),
    cargo: String(formData.get("cargo") ?? ""),
    fotoUrl: String(formData.get("fotoUrl") ?? ""),
  };
  const parsed = candidatoSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;
  const data = {
    chapaId: d.chapaId,
    nome: d.nome,
    cargo: d.cargo,
    fotoUrl: d.fotoUrl || null,
  };

  if (id) {
    await prisma.candidatoEleicao.update({ where: { id }, data });
  } else {
    await prisma.candidatoEleicao.create({ data });
  }

  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return { success: true, message: "Candidato salvo com sucesso." };
}

export async function excluirCandidato(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.candidatoEleicao.delete({ where: { id } });
  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return { success: true, message: "Candidato removido." };
}

// --------------------------- APURAÇÃO ---------------------------

/**
 * Lança os votos, calcula a chapa vencedora, grava o resultado e encerra
 * o pleito (status CONCLUIDO).
 */
export async function apurarEleicao(
  eleicaoId: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  const chapas = await prisma.chapa.findMany({ where: { eleicaoId } });
  if (chapas.length === 0) {
    return { success: false, error: "Nenhuma chapa cadastrada para apurar." };
  }

  const votosChapas = chapas.map((c) => {
    const votos = Number(formData.get(`votos_${c.id}`) ?? 0);
    return { chapaId: c.id, nome: c.nome, numero: c.numero, votos };
  });

  const votosBrancos = Number(formData.get("votosBrancos") ?? 0);
  const votosNulos = Number(formData.get("votosNulos") ?? 0);
  const totalAptos = Number(formData.get("totalAptos") ?? 0);

  const totalVotantes =
    votosChapas.reduce((acc, v) => acc + v.votos, 0) +
    votosBrancos +
    votosNulos;

  const vencedora = [...votosChapas].sort((a, b) => b.votos - a.votos)[0];

  await prisma.resultadoEleicao.upsert({
    where: { eleicaoId },
    create: {
      eleicaoId,
      chapaVencedoraId: vencedora?.chapaId ?? null,
      votosChapasJson: votosChapas,
      votosBrancos,
      votosNulos,
      totalAptos,
      totalVotantes,
    },
    update: {
      chapaVencedoraId: vencedora?.chapaId ?? null,
      votosChapasJson: votosChapas,
      votosBrancos,
      votosNulos,
      totalAptos,
      totalVotantes,
    },
  });

  await prisma.eleicao.update({
    where: { id: eleicaoId },
    data: { status: "CONCLUIDO" },
  });

  revalidatePath("/admin/eleicoes");
  revalidatePath("/eleicoes");
  return {
    success: true,
    message: `Apuração concluída. Chapa vencedora: ${vencedora?.nome ?? "—"}.`,
  };
}
