"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { ImageCropUpload } from "@/components/admin/image-crop-upload";
import { slugifyUrl, SLUG_MAX, hojeLocal } from "@/lib/utils";
import { salvarArtigo } from "@/app/actions/artigos";

export type ArtigoFormData = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  status: "RASCUNHO" | "PUBLICADO";
  autorNome: string;
  caminhoImagemCapa: string | null;
  caminhoFotoAutor: string | null;
  dataPublicacao: string; // yyyy-mm-dd
};

export function ArtigoForm({ artigo }: { artigo?: ArtigoFormData }) {
  const router = useRouter();
  const editing = !!artigo;
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [titulo, setTitulo] = useState(artigo?.titulo ?? "");
  const [slug, setSlug] = useState(artigo?.slug ?? "");
  const [slugEditado, setSlugEditado] = useState(editing);
  const [conteudo, setConteudo] = useState(artigo?.conteudo ?? "");
  // As imagens são recortadas e enviadas pelo ImageCropUpload, que devolve a
  // URL final — o formulário só carrega esse caminho.
  const [capa, setCapa] = useState(artigo?.caminhoImagemCapa ?? "");
  const [fotoAutor, setFotoAutor] = useState(artigo?.caminhoFotoAutor ?? "");

  const slugFinal = slugifyUrl(slug || titulo);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("conteudo", conteudo);
    fd.set("caminhoImagemCapa", capa);
    fd.set("caminhoFotoAutor", fotoAutor);
    startTransition(async () => {
      const res = await salvarArtigo(fd, artigo?.id);
      if (res.success) {
        toast.success(res.message ?? "Salvo.");
        router.push("/admin/artigos");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="pb-24">
      <div className="mb-5 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin/artigos">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </Button>
        <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
          {editing ? "Editar artigo" : "Novo artigo"}
        </h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Coluna principal */}
        <div className="space-y-5">
          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    if (!slugEditado) setSlug(slugifyUrl(e.target.value));
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Endereço do artigo (URL)</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEditado(true);
                  }}
                  placeholder="gerado-a-partir-do-titulo"
                />
                <div className="mt-1.5 rounded-md bg-slate-50 px-2.5 py-1.5">
                  <span className="text-xs text-muted-foreground">
                    /artigos/
                  </span>
                  <span className="break-all text-xs font-medium text-primary">
                    {slugFinal || "..."}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {slugFinal.length}/{SLUG_MAX} caracteres.
                </p>
              </div>
              <div>
                <Label htmlFor="resumo">Resumo *</Label>
                <Textarea
                  id="resumo"
                  name="resumo"
                  rows={2}
                  defaultValue={artigo?.resumo}
                  required
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <Label>Conteúdo *</Label>
            <div className="mt-2">
              <TiptapEditor value={conteudo} onChange={setConteudo} />
            </div>
          </section>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-5">
          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-slate-900">Publicação</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={artigo?.status ?? "RASCUNHO"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="PUBLICADO">Publicado</option>
                </select>
              </div>
              <div>
                <Label htmlFor="dataPublicacao">Data de publicação</Label>
                <Input
                  id="dataPublicacao"
                  name="dataPublicacao"
                  type="date"
                  defaultValue={artigo?.dataPublicacao ?? hojeLocal()}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-slate-900">
              Imagem de capa
            </h2>
            <ImageCropUpload
              label="Capa do artigo"
              value={capa}
              onChange={setCapa}
              aspect={1200 / 630}
              recomendacao="Recomendado: 1200 × 630 px (1.91:1) — mesmo formato usado no compartilhamento."
            />
          </section>

          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-slate-900">Autor</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="autorNome">Nome do autor *</Label>
                <Input
                  id="autorNome"
                  name="autorNome"
                  placeholder="Ex: Prof. Dr. Fulano de Tal"
                  defaultValue={artigo?.autorNome}
                  required
                />
              </div>
              <ImageCropUpload
                label="Foto do autor"
                value={fotoAutor}
                onChange={setFotoAutor}
                aspect={1}
                recomendacao="Recomendado: 400 × 400 px (quadrada) — exibida em círculo."
              />
            </div>
          </section>
        </div>
      </div>

      {/* Barra de ação fixa */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 p-3 backdrop-blur md:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3">
          <Button asChild variant="outline" type="button">
            <Link href="/admin/artigos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {editing ? "Salvar alterações" : "Criar artigo"}
          </Button>
        </div>
      </div>
    </form>
  );
}
