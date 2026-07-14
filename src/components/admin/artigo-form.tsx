"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Save, ArrowLeft, ImageIcon, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { slugify } from "@/lib/utils";
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

/** Input de imagem (arquivo físico) com pré-visualização. */
function ImageFileInput({
  name,
  label,
  currentUrl,
  circular,
}: {
  name: string;
  label: string;
  currentUrl?: string | null;
  circular?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const shown = preview ?? currentUrl ?? null;
  const Icon = circular ? UserRound : ImageIcon;

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex items-center gap-3">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden border bg-slate-100 text-slate-400 ${
            circular ? "h-16 w-16 rounded-full" : "h-16 w-24 rounded-lg"
          }`}
        >
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon className="h-6 w-6" />
          )}
        </div>
        <input
          type="file"
          name={name}
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
        />
      </div>
    </div>
  );
}

export function ArtigoForm({ artigo }: { artigo?: ArtigoFormData }) {
  const router = useRouter();
  const editing = !!artigo;
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [titulo, setTitulo] = useState(artigo?.titulo ?? "");
  const [slug, setSlug] = useState(artigo?.slug ?? "");
  const [slugEditado, setSlugEditado] = useState(editing);
  const [conteudo, setConteudo] = useState(artigo?.conteudo ?? "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("conteudo", conteudo);
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

      {/* Campos ocultos com os caminhos atuais (preservados se não trocar) */}
      <input
        type="hidden"
        name="caminhoImagemCapaAtual"
        defaultValue={artigo?.caminhoImagemCapa ?? ""}
      />
      <input
        type="hidden"
        name="caminhoFotoAutorAtual"
        defaultValue={artigo?.caminhoFotoAutor ?? ""}
      />

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
                    if (!slugEditado) setSlug(slugify(e.target.value));
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    /artigos/
                  </span>
                  <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugEditado(true);
                    }}
                  />
                </div>
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
                  defaultValue={
                    artigo?.dataPublicacao ??
                    new Date().toISOString().slice(0, 10)
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-slate-900">
              Imagem de capa
            </h2>
            <ImageFileInput
              name="capaFile"
              label="Capa do artigo"
              currentUrl={artigo?.caminhoImagemCapa}
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
              <ImageFileInput
                name="fotoAutorFile"
                label="Foto do autor"
                currentUrl={artigo?.caminhoFotoAutor}
                circular
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
