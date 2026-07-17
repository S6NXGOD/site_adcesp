import { writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { slugify } from "@/lib/utils";
import { storageDir } from "@/lib/storage";

export const MAX_UPLOAD_SIZE = 15 * 1024 * 1024; // 15 MB (antes da otimização)

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

/**
 * Imagens que podem ser recomprimidas com segurança.
 * `.gif` fica de fora de propósito: converter quebraria a animação.
 * `.svg` é vetor (já é leve) e não entra aqui.
 */
const OTIMIZAVEIS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

/** Maior lado permitido. Cobre o hero/carrossel em telas grandes com folga. */
const MAX_DIMENSAO = 1920;

/** WebP nesta qualidade é visualmente indistinguível do original. */
const QUALIDADE_WEBP = 82;

/** Nome de arquivo único e seguro (sem acentos/espaços). */
export function nomeUnico(originalName: string, extFinal?: string): string {
  const extOriginal = path.extname(originalName).toLowerCase();
  const ext = extFinal ?? extOriginal;
  const base = slugify(path.basename(originalName, extOriginal)) || "arquivo";
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
 * Recomprime imagens grandes preservando a qualidade percebida:
 * - `rotate()` aplica a orientação do EXIF (senão fotos de celular deitam);
 * - redimensiona só para BAIXO (`withoutEnlargement`), mantendo a proporção;
 * - converte para WebP, que também remove EXIF/GPS (ganho de privacidade).
 *
 * Nunca falha o upload: em qualquer erro, ou se o resultado não ficar menor,
 * grava o arquivo original. Documentos (PDF/DOC/...) e GIF passam intactos.
 */
async function otimizarImagem(
  buf: Buffer,
  originalName: string
): Promise<{ data: Buffer; ext: string }> {
  const ext = path.extname(originalName).toLowerCase();
  if (!OTIMIZAVEIS.has(ext)) return { data: buf, ext };

  try {
    const otimizado = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize(MAX_DIMENSAO, MAX_DIMENSAO, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: QUALIDADE_WEBP })
      .toBuffer();

    // Imagens já pequenas/otimizadas podem crescer ao reconverter.
    if (otimizado.length >= buf.length) return { data: buf, ext };

    return { data: otimizado, ext: ".webp" };
  } catch {
    return { data: buf, ext };
  }
}

/**
 * Grava um arquivo público em <STORAGE_PATH>/uploads e retorna o caminho da
 * API que o serve — é ESTE valor que vai para o banco.
 * Ex.: "/api/files/uploads/1720000000-a1b2c-edital.pdf"
 */
export async function savePublicFile(file: File): Promise<string> {
  validarUpload(file);

  const dir = storageDir("uploads");
  const original = Buffer.from(await file.arrayBuffer());
  const { data, ext } = await otimizarImagem(original, file.name);
  const filename = nomeUnico(file.name, ext);

  await writeFile(path.join(dir, filename), data);

  return `/api/files/uploads/${filename}`;
}
