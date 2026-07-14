import { storageDir } from "@/lib/storage";

/**
 * Diretório PRIVADO dos documentos da filiação (LGPD): <STORAGE_PATH>/filiacao.
 * Fica fora de `public/` e é servido apenas pela rota /api/files, que exige
 * sessão do painel para esta pasta (ver `PASTAS_PROTEGIDAS` em lib/storage).
 */
export function filiacaoDir(): string {
  return storageDir("filiacao");
}

/** Caminho público (API) gravado no banco para um documento de filiação. */
export function filiacaoUrl(filename: string): string {
  return `/api/files/filiacao/${filename}`;
}
