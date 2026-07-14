"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Upload, FileText, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enviarAnexosFiliacao } from "@/app/actions/filiacao";

const MAX = 5 * 1024 * 1024; // 5 MB
const EXTS = [".pdf", ".jpg", ".jpeg", ".png"];

const DOCS = [
  { key: "fichaAssinada", label: "Ficha de filiação assinada" },
  {
    key: "identificacao",
    label: "Documento de identificação (CNH, CPF, RG, passaporte etc.)",
  },
  { key: "contracheque", label: "Contracheque atualizado" },
] as const;

function validar(file: File): string | null {
  const nome = file.name.toLowerCase();
  const ext = nome.slice(nome.lastIndexOf("."));
  if (!EXTS.includes(ext)) return "Formato inválido (use PDF, JPG ou PNG).";
  if (file.size > MAX) return "Arquivo acima de 5 MB.";
  return null;
}

function tamanhoLegivel(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FiliacaoAnexos({
  filiadoId,
  onConcluido,
}: {
  filiadoId: string;
  onConcluido: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [erros, setErros] = useState<Record<string, string>>({});

  function pick(key: string, file?: File) {
    if (!file) return;
    const err = validar(file);
    setErros((e) => ({ ...e, [key]: err ?? "" }));
    setFiles((f) => ({ ...f, [key]: err ? undefined : file }));
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const faltando = DOCS.filter((d) => !files[d.key]);
    if (faltando.length > 0) {
      toast.error("Anexe todos os 3 documentos obrigatórios.");
      return;
    }
    const fd = new FormData();
    fd.set("filiadoId", filiadoId);
    DOCS.forEach((d) => fd.set(d.key, files[d.key] as File));

    startTransition(async () => {
      const res = await enviarAnexosFiliacao(fd);
      if (res.success) {
        toast.success(res.message ?? "Documentos enviados!");
        onConcluido();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {DOCS.map((d) => {
          const file = files[d.key];
          const erro = erros[d.key];
          return (
            <div key={d.key}>
              <p className="mb-1.5 text-sm font-medium">
                {d.label} <span className="text-destructive">*</span>
              </p>
              {file ? (
                <div className="flex items-center gap-2 rounded-md border bg-emerald-50 p-2">
                  <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                    {file.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {tamanhoLegivel(file.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((f) => ({ ...f, [d.key]: undefined }))
                    }
                    className="text-destructive"
                    aria-label="Remover"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed bg-slate-50 p-3 text-sm text-muted-foreground hover:bg-slate-100">
                  <Upload className="h-4 w-4" />
                  Selecionar arquivo
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => pick(d.key, e.target.files?.[0])}
                  />
                </label>
              )}
              {erro && (
                <p className="mt-1 text-xs text-destructive">{erro}</p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Formatos aceitos: PDF, JPG ou PNG — até 5 MB por arquivo. Os documentos
        são armazenados com segurança e visíveis apenas para a diretoria.
      </p>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Enviar documentos e concluir filiação
      </Button>
    </form>
  );
}
