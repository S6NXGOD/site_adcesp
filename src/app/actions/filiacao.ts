"use server";

import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { filiacaoSchema } from "@/lib/validations";
import { requireAuth, type ActionResult } from "@/lib/action-helpers";
import { filiacaoDir, filiacaoUrl } from "@/lib/filiacao-storage";
import { StatusFiliado, CampusUespi, CentroUespi } from "@prisma/client";

/**
 * Server Action PÚBLICA: solicitação de filiação enviada pelo docente.
 * Não exige autenticação. Os dados são revalidados no servidor (defesa em
 * profundidade) e ficam com status PENDENTE até a moderação.
 */
export async function solicitarFiliacao(
  values: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = filiacaoSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "Verifique os campos do formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;
  const cpfDigits = d.cpf.replace(/\D/g, "");

  const existing = await prisma.filiado.findUnique({
    where: { cpf: cpfDigits },
  });
  if (existing) {
    return {
      success: false,
      error: "Já existe uma solicitação de filiação para este CPF.",
    };
  }

  const filiado = await prisma.filiado.create({
    data: {
      nome: d.nome,
      rg: d.rg,
      cpf: cpfDigits,
      dataNascimento: new Date(d.dataNascimento),
      matricula: d.matricula || null,
      curso: d.curso || null,
      endereco: d.endereco,
      numero: d.numero || null,
      apto: d.apto || null,
      cep: d.cep.replace(/\D/g, ""),
      cidade: d.cidade,
      estado: d.estado.toUpperCase(),
      telefone: d.telefone || null,
      celular: d.celular,
      email: d.email.toLowerCase(),
      campus: d.campus as CampusUespi,
      centro: d.centro as CentroUespi,
      aceiteContribuicao: d.aceiteContribuicao,
      consentimentoLgpd: d.consentimentoLgpd,
      status: "PENDENTE",
    },
    select: { id: true },
  });

  revalidatePath("/admin/filiacoes");
  revalidatePath("/admin/dashboard");
  return {
    success: true,
    data: { id: filiado.id },
    message: "Ficha registrada. Gere o PDF e anexe os documentos.",
  };
}

// ---------------------------------------------------------------------
// Envio dos anexos físicos (etapa 2) — Server Action com FormData.
// Grava os arquivos no armazenamento privado e vincula os caminhos ao
// registro do Filiado criado na etapa 1.
// ---------------------------------------------------------------------
const MAX_ANEXO = 5 * 1024 * 1024; // 5 MB
const EXT_PERMITIDAS = new Set([".pdf", ".jpg", ".jpeg", ".png"]);

const ANEXOS = [
  { campo: "fichaAssinada", label: "Ficha assinada", coluna: "caminhoArquivoFicha" },
  {
    campo: "identificacao",
    label: "Documento de identificação",
    coluna: "caminhoArquivoIdentificacao",
  },
  { campo: "contracheque", label: "Contracheque", coluna: "caminhoArquivoContracheque" },
] as const;

export async function enviarAnexosFiliacao(
  formData: FormData
): Promise<ActionResult> {
  const filiadoId = String(formData.get("filiadoId") ?? "");
  if (!filiadoId) {
    return { success: false, error: "Registro de filiação não identificado." };
  }

  const filiado = await prisma.filiado.findUnique({
    where: { id: filiadoId },
    select: { id: true, status: true },
  });
  if (!filiado) {
    return { success: false, error: "Registro de filiação não encontrado." };
  }
  if (filiado.status !== "PENDENTE") {
    return {
      success: false,
      error: "Esta filiação já foi processada e não aceita novos anexos.",
    };
  }

  // Valida os 4 arquivos antes de gravar qualquer um.
  const arquivos: { coluna: string; bytes: Buffer; ext: string; prefixo: string }[] =
    [];
  for (const def of ANEXOS) {
    const file = formData.get(def.campo);
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: `Anexe o documento: ${def.label}.` };
    }
    if (file.size > MAX_ANEXO) {
      return {
        success: false,
        error: `${def.label}: arquivo acima de 5 MB.`,
      };
    }
    const ext = path.extname(file.name).toLowerCase();
    if (!EXT_PERMITIDAS.has(ext)) {
      return {
        success: false,
        error: `${def.label}: formato inválido (use PDF, JPG ou PNG).`,
      };
    }
    arquivos.push({
      coluna: def.coluna,
      bytes: Buffer.from(await file.arrayBuffer()),
      ext,
      prefixo: def.campo,
    });
  }

  // Grava os arquivos no diretório privado (STORAGE_PATH/filiacao).
  const dir = filiacaoDir();
  const caminhos: Record<string, string> = {};
  for (const a of arquivos) {
    const filename = `${filiadoId}-${a.prefixo}-${Date.now()}${a.ext}`;
    await writeFile(path.join(dir, filename), a.bytes);
    // No banco guardamos o caminho da API que serve o arquivo (protegida).
    caminhos[a.coluna] = filiacaoUrl(filename);
  }

  await prisma.filiado.update({
    where: { id: filiadoId },
    data: {
      caminhoArquivoFicha: caminhos.caminhoArquivoFicha,
      caminhoArquivoIdentificacao: caminhos.caminhoArquivoIdentificacao,
      caminhoArquivoContracheque: caminhos.caminhoArquivoContracheque,
    },
  });

  revalidatePath("/admin/filiacoes");
  return {
    success: true,
    message: "Documentos enviados com sucesso! Sua filiação está completa.",
  };
}

/** Moderação (admin): aprovar/rejeitar uma solicitação de filiação. */
export async function moderarFiliacao(
  id: string,
  status: "APROVADO" | "REJEITADO",
  observacoes?: string
): Promise<ActionResult> {
  await requireAuth();
  await prisma.filiado.update({
    where: { id },
    data: {
      status: status as StatusFiliado,
      observacoes: observacoes || null,
    },
  });
  revalidatePath("/admin/filiacoes");
  revalidatePath("/admin/dashboard");
  return {
    success: true,
    message:
      status === "APROVADO" ? "Filiação aprovada." : "Solicitação rejeitada.",
  };
}

export async function excluirFiliacao(id: string): Promise<ActionResult> {
  await requireAuth();
  await prisma.filiado.delete({ where: { id } });
  revalidatePath("/admin/filiacoes");
  return { success: true, message: "Registro removido." };
}
