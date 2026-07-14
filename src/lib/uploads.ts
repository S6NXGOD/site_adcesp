import { writeFile } from "fs/promises";
import path from "path";
import { slugify } from "@/lib/utils";
import { storageDir } from "@/lib/storage";

export const MAX_UPLOAD_SIZE = 15 * 1024 * 1024; // 15 MB

/** Extensões aceitas nos uploads do painel (imagens + documentos). */
export const ALLOWED_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".odt",
]);

/** Nome de arquivo único e seguro (sem acentos/espaços). */
export function nomeUnico(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = slugify(path.basename(originalName, ext)) || "arquivo";
  const rand = Math.random().toString(36).slice(2, 7);
  return `${Date.now()}-${rand}-${base}${ext}`;
}

/** Valida tamanho e extensão. Lança Error com mensagem amigável. */
export function validarUpload(file: File): string {
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Arquivo muito grande (máx. 15 MB).");
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error(`Tipo de arquivo não permitido (${ext || "sem extensão"}).`);
  }
  return ext;
}

/**
 * Grava um arquivo público em <STORAGE_PATH>/uploads e retorna o caminho da
 * API que o serve — é ESTE valor que vai para o banco.
 * Ex.: "/api/files/uploads/1720000000-a1b2c-edital.pdf"
 */
export async function savePublicFile(file: File): Promise<string> {
  validarUpload(file);

  const dir = storageDir("uploads");
  const filename = nomeUnico(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(dir, filename), bytes);

  return `/api/files/uploads/${filename}`;
}
