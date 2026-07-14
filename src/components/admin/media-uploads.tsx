"use client";

import { useState } from "react";
import {
  Upload,
  Loader2,
  X,
  ImageIcon,
  ArrowUp,
  ArrowDown,
  FileText,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type DocumentoAnexo = { url: string; nome: string; tipo?: string };

async function uploadFile(file: File): Promise<DocumentoAnexo> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Falha no upload.");
  return { url: data.url, nome: data.nome, tipo: data.tipo };
}

// -------------------------------------------------------------------
// Imagem de destaque (upload único, sem link)
// -------------------------------------------------------------------
export function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLoading(true);
    try {
      const { url } = await uploadFile(file);
      onChange(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setLoading(false);
    }
  }

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-lg border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Imagem de destaque"
          className="aspect-video w-full object-cover"
        />
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
          aria-label="Remover imagem"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-slate-50 text-muted-foreground transition-colors hover:bg-slate-100">
      {loading ? (
        <Loader2 className="h-7 w-7 animate-spin" />
      ) : (
        <ImageIcon className="h-7 w-7" />
      )}
      <span className="text-sm font-medium">
        {loading ? "Enviando..." : "Enviar imagem de destaque"}
      </span>
      <span className="text-xs">Clique para selecionar (JPG, PNG, WebP)</span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handle}
        disabled={loading}
      />
    </label>
  );
}

// -------------------------------------------------------------------
// Galeria de fotos (upload múltiplo + reordenar)
// -------------------------------------------------------------------
export function GaleriaUpload({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setLoading(true);
    try {
      const results = await Promise.all(files.map((f) => uploadFile(f)));
      onChange([...value, ...results.map((r) => r.url)]);
      toast.success(`${results.length} foto(s) adicionada(s).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setLoading(false);
    }
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, i) => (
            <div
              key={url}
              className="group relative overflow-hidden rounded-lg border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/55 p-1">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30"
                    aria-label="Mover para trás"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === value.length - 1}
                    className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30"
                    aria-label="Mover para frente"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-[10px] font-medium text-white">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="rounded p-1 text-white hover:bg-red-500"
                  aria-label="Remover foto"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-slate-50 p-4 text-sm font-medium text-muted-foreground hover:bg-slate-100">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Upload className="h-5 w-5" />
        )}
        {loading ? "Enviando fotos..." : "Adicionar fotos (várias de uma vez)"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handle}
          disabled={loading}
        />
      </label>
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Use as setas para reordenar. A ordem aqui é a ordem exibida no site.
        </p>
      )}
    </div>
  );
}

// -------------------------------------------------------------------
// Documentos anexos (PDF, DOC, etc — upload múltiplo)
// -------------------------------------------------------------------
export function DocumentosUpload({
  value,
  onChange,
}: {
  value: DocumentoAnexo[];
  onChange: (docs: DocumentoAnexo[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setLoading(true);
    try {
      const results = await Promise.all(files.map((f) => uploadFile(f)));
      onChange([...value, ...results]);
      toast.success(`${results.length} documento(s) anexado(s).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setLoading(false);
    }
  }

  function rename(i: number, nome: string) {
    onChange(value.map((d, idx) => (idx === i ? { ...d, nome } : d)));
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((doc, i) => (
            <li
              key={doc.url}
              className="flex items-center gap-2 rounded-lg border bg-white p-2"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-red-50 text-red-600">
                <FileText className="h-4 w-4" />
              </span>
              <Input
                value={doc.nome}
                onChange={(e) => rename(i, e.target.value)}
                className="h-9 flex-1"
              />
              <span className="hidden text-xs uppercase text-muted-foreground sm:inline">
                {doc.tipo}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => remove(i)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-slate-50 p-4 text-sm font-medium text-muted-foreground hover:bg-slate-100">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Paperclip className="h-5 w-5" />
        )}
        {loading ? "Anexando..." : "Anexar documentos (PDF, DOC, XLS...)"}
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.odt"
          multiple
          className="hidden"
          onChange={handle}
          disabled={loading}
        />
      </label>
    </div>
  );
}
