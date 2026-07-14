"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Loader2,
  FileText,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatDate } from "@/lib/utils";
import {
  adicionarDocumentoEleicao,
  renomearDocumentoEleicao,
  moverDocumentoEleicao,
  excluirDocumentoEleicao,
} from "@/app/actions/eleicoes";

type Documento = {
  id: string;
  titulo: string;
  caminhoArquivo: string;
  dataPublicacao: Date;
};

export function DocumentosTab({
  eleicaoId,
  documentos,
}: {
  eleicaoId: string;
  documentos: Documento[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [pending, startTransition] = useTransition();

  async function enviarArquivos(files: FileList | File[]) {
    const lista = Array.from(files).filter((f) =>
      f.name.toLowerCase().endsWith(".pdf")
    );
    if (lista.length === 0) {
      toast.error("Envie arquivos PDF.");
      return;
    }
    setEnviando(true);
    try {
      for (const file of lista) {
        const fd = new FormData();
        fd.set("eleicaoId", eleicaoId);
        fd.set("file", file);
        const res = await adicionarDocumentoEleicao(fd);
        if (!res.success) toast.error(`${file.name}: ${res.error}`);
      }
      toast.success("Documento(s) enviado(s).");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  function renomear(id: string, titulo: string, original: string) {
    if (titulo.trim() === original.trim() || !titulo.trim()) return;
    startTransition(async () => {
      const res = await renomearDocumentoEleicao(id, titulo);
      if (res.success) router.refresh();
      else toast.error(res.error);
    });
  }

  function mover(id: string, dir: -1 | 1) {
    startTransition(async () => {
      const res = await moverDocumentoEleicao(id, dir);
      if (res.success) router.refresh();
      else toast.error(res.error);
    });
  }

  return (
    <div className="space-y-5">
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          enviarArquivos(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          drag ? "border-primary bg-primary/5" : "border-slate-300 bg-slate-50"
        }`}
      >
        {enviando ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <UploadCloud className="h-8 w-8 text-primary" />
        )}
        <p className="text-sm font-medium text-slate-700">
          {enviando
            ? "Enviando..."
            : "Arraste os PDFs aqui ou clique para selecionar"}
        </p>
        <p className="text-xs text-muted-foreground">
          Editais, regulamentos, etc. — apenas PDF.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) enviarArquivos(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Lista */}
      {documentos.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nenhum documento enviado ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {documentos.map((doc, i) => (
            <li
              key={doc.id}
              className="flex items-center gap-2 rounded-lg border bg-white p-2"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => mover(doc.id, -1)}
                  disabled={i === 0 || pending}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  aria-label="Mover para cima"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => mover(doc.id, 1)}
                  disabled={i === documentos.length - 1 || pending}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  aria-label="Mover para baixo"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <FileText className="h-5 w-5 shrink-0 text-red-600" />
              <Input
                defaultValue={doc.titulo}
                onBlur={(e) => renomear(doc.id, e.target.value, doc.titulo)}
                className="h-9 flex-1"
              />
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {formatDate(doc.dataPublicacao)}
              </span>
              <a
                href={doc.caminhoArquivo}
                target="_blank"
                rel="noreferrer"
                className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary"
                aria-label="Abrir"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <DeleteButton
                id={doc.id}
                action={excluirDocumentoEleicao}
                label="Excluir documento"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
