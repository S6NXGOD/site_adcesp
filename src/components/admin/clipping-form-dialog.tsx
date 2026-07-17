"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Loader2, Upload, X, Link2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, paraInputDate, hojeLocal } from "@/lib/utils";
import { clippingSchema, type ClippingInput } from "@/lib/validations";
import { criarClipping, atualizarClipping } from "@/app/actions/imprensa";

type Clipping = {
  id: string;
  titulo: string;
  urlExterna: string;
  nomeVeiculo: string;
  dataPublicacao: Date;
  caminhoImagemCapa: string | null;
  status: "RASCUNHO" | "PUBLICADO";
};

function toDateInput(d?: Date) {
  return d ? paraInputDate(d) : hojeLocal();
}

export function ClippingFormDialog({ clipping }: { clipping?: Clipping }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const editing = !!clipping;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ClippingInput>({
    resolver: zodResolver(clippingSchema),
    defaultValues: {
      titulo: clipping?.titulo ?? "",
      urlExterna: clipping?.urlExterna ?? "",
      nomeVeiculo: clipping?.nomeVeiculo ?? "",
      dataPublicacao: toDateInput(clipping?.dataPublicacao),
      caminhoImagemCapa: clipping?.caminhoImagemCapa ?? "",
      status: clipping?.status ?? "RASCUNHO",
    },
  });

  const imagem = watch("caminhoImagemCapa");
  const status = watch("status");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha no upload.");
      setValue("caminhoImagemCapa", data.url, { shouldValidate: true });
      toast.success("Imagem enviada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  }

  function onValid(values: ClippingInput) {
    startTransition(async () => {
      const res = editing
        ? await atualizarClipping(clipping!.id, values)
        : await criarClipping(values);
      if (res.success) {
        toast.success(res.message ?? "Salvo.");
        setOpen(false);
        if (!editing) reset();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {editing ? (
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Novo recorte
        </Button>
      )}

      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar recorte" : "Novo recorte de imprensa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título da matéria *</Label>
            <Input
              id="titulo"
              {...register("titulo")}
              placeholder="Ex.: ADCESP cobra reajuste dos docentes da UESPI"
            />
            {errors.titulo && (
              <p className="mt-1 text-xs text-destructive">
                {errors.titulo.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="nomeVeiculo">Veículo de comunicação *</Label>
              <Input
                id="nomeVeiculo"
                {...register("nomeVeiculo")}
                placeholder="Ex.: G1 PI, Cidade Verde"
              />
              {errors.nomeVeiculo && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.nomeVeiculo.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="dataPublicacao">Data de publicação *</Label>
              <Input
                id="dataPublicacao"
                type="date"
                {...register("dataPublicacao")}
              />
              {errors.dataPublicacao && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.dataPublicacao.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="urlExterna">Link da matéria *</Label>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                id="urlExterna"
                {...register("urlExterna")}
                placeholder="https://g1.globo.com/pi/..."
              />
            </div>
            {errors.urlExterna && (
              <p className="mt-1 text-xs text-destructive">
                {errors.urlExterna.message}
              </p>
            )}
          </div>

          {/* Imagem de capa (opcional) */}
          <div>
            <Label>Imagem de capa (opcional)</Label>
            <p className="mb-1 text-xs text-muted-foreground">
              Thumbnail da matéria. Recomendado 1200×630 (16:9).
            </p>
            {imagem ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagem}
                  alt="Pré-visualização"
                  className="h-16 w-28 rounded border object-cover"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue("caminhoImagemCapa", "")}
                >
                  <X className="h-4 w-4" /> Remover
                </Button>
              </div>
            ) : (
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border bg-background px-3 text-sm hover:bg-accent">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Enviar imagem
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue("status", "RASCUNHO")}
                className={cn(
                  "rounded-lg border p-2.5 text-sm font-medium transition-colors",
                  status === "RASCUNHO"
                    ? "border-slate-400 bg-slate-100 text-slate-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                Rascunho
              </button>
              <button
                type="button"
                onClick={() => setValue("status", "PUBLICADO")}
                className={cn(
                  "rounded-lg border p-2.5 text-sm font-medium transition-colors",
                  status === "PUBLICADO"
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                Publicado
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || uploading}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
