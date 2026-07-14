import fs from "fs";
import path from "path";

/**
 * Raiz do armazenamento de arquivos.
 *
 * - Local:   STORAGE_PATH=./private/storage  (fora de `public/`, fora do git)
 * - Railway: STORAGE_PATH=/data             (mount path do Railway Volume)
 *
 * Lido em tempo de execução (função, não const de módulo) para que o valor do
 * ambiente de produção seja sempre respeitado, mesmo que o módulo tenha sido
 * importado durante o build.
 */
export function getStorageRoot(): string {
  return path.resolve(process.env.STORAGE_PATH || "./private/storage");
}

/** Cria o diretório (recursivamente) se ele ainda não existir. */
export function ensureDir(dir: string): string {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Retorna (garantindo a existência) um subdiretório do storage.
 * Ex.: storageDir("uploads") -> <STORAGE_PATH>/uploads
 */
export function storageDir(...segments: string[]): string {
  return ensureDir(path.join(getStorageRoot(), ...segments));
}

/**
 * Resolve com segurança um caminho relativo dentro do storage.
 * Retorna `null` se o caminho escapar da raiz (path traversal, ex.: "../").
 */
export function resolveInStorage(relativePath: string): string | null {
  const root = getStorageRoot();
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    return null;
  }
  return resolved;
}

/** Content-Type por extensão, para servir os arquivos pela API. */
const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain; charset=utf-8",
  ".odt": "application/vnd.oasis.opendocument.text",
};

export function contentTypeFor(filename: string): string {
  return MIME[path.extname(filename).toLowerCase()] ?? "application/octet-stream";
}

/**
 * Subpastas cujo conteúdo é sensível (LGPD) e só pode ser servido a usuários
 * autenticados do painel. Ver `app/api/files/[...path]/route.ts`.
 */
export const PASTAS_PROTEGIDAS = ["filiacao"];

export function isProtegido(relativePath: string): boolean {
  const primeira = relativePath.split("/")[0]?.toLowerCase();
  return PASTAS_PROTEGIDAS.includes(primeira ?? "");
}
