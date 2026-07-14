"use client";

import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * Campo de upload reutilizável. Envia o arquivo para /api/upload e guarda a
 * URL resultante em um input hidden (name = `name`), que é submetido junto
 * ao FormData da Server Action. Também aceita colar uma URL externa.
 */
export function UploadField({
  name,
  label,
  accept = "image/*",
  defaultValue = "",
}: {
  name: string;
  label: string;
  accept?: string;
  defaultValue?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha no upload.");
      setUrl(data.url);
      toast.success("Arquivo enviado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setLoading(false);
    }
  }

  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={url} />
      <div className="mt-1 flex items-center gap-2">
        <Input
          placeholder="URL do arquivo ou faça upload →"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border bg-background px-3 text-sm hover:bg-accent">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Upload</span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFile}
            disabled={loading}
          />
        </label>
      </div>

      {url && (
        <div className="mt-2 flex items-center gap-2">
          {isPdf ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary underline"
            >
              {url}
            </a>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="Pré-visualização"
              className="h-16 w-16 rounded border object-cover"
            />
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setUrl("")}
          >
            <X className="h-4 w-4" /> Remover
          </Button>
        </div>
      )}
    </div>
  );
}
