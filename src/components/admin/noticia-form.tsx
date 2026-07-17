"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Save,
  ArrowLeft,
  Star,
  Eye,
  EyeOff,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import {
  GaleriaUpload,
  DocumentosUpload,
  type DocumentoAnexo,
} from "@/components/admin/media-uploads";
import { ImageCropUpload } from "@/components/admin/image-crop-upload";
import { CategoriasField } from "@/components/admin/categorias-field";
import { cn, slugifyUrl, SLUG_MAX } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import type { CategoriaDTO } from "@/app/actions/categorias";
import { criarNoticia, atualizarNoticia } from "@/app/actions/noticias";

export type NoticiaFormData = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  imagemCapa: string | null;
  dataPublicacao: string; // yyyy-mm-dd
  publicado: boolean;
  destaque: boolean;
  galeria: string[];
  documentos: DocumentoAnexo[];
  categoriaIds: string[];
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm sm:p-5">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {description && (
        <p className="mb-3 text-xs text-muted-foreground">{description}</p>
      )}
      <div className={description ? "" : "mt-3"}>{children}</div>
    </section>
  );
}

export function NoticiaForm({
  noticia,
  categorias,
}: {
  noticia?: NoticiaFormData;
  categorias: CategoriaDTO[];
}) {
  const router = useRouter();
  const editing = !!noticia;
  const [pending, startTransition] = useTransition();

  const [titulo, setTitulo] = useState(noticia?.titulo ?? "");
  const [slug, setSlug] = useState(noticia?.slug ?? "");
  const [slugEditado, setSlugEditado] = useState(editing);
  const [resumo, setResumo] = useState(noticia?.resumo ?? "");
  const [conteudo, setConteudo] = useState(noticia?.conteudo ?? "");
  const [imagemCapa, setImagemCapa] = useState(noticia?.imagemCapa ?? "");
  const [galeria, setGaleria] = useState<string[]>(noticia?.galeria ?? []);
  const [documentos, setDocumentos] = useState<DocumentoAnexo[]>(
    noticia?.documentos ?? []
  );
  const [categoriaIds, setCategoriaIds] = useState<string[]>(
    noticia?.categoriaIds ?? []
  );
  const [dataPublicacao, setDataPublicacao] = useState(
    noticia?.dataPublicacao ?? new Date().toISOString().slice(0, 10)
  );
  const [publicado, setPublicado] = useState(noticia?.publicado ?? false);
  const [destaque, setDestaque] = useState(noticia?.destaque ?? false);

  function onTituloChange(v: string) {
    setTitulo(v);
    if (!slugEditado) setSlug(slugifyUrl(v));
  }

  // Slug efetivo: é ele que o servidor vai gravar (mesma normalização).
  const slugFinal = slugifyUrl(slug || titulo);
  const slugLongo = slugFinal.length > SLUG_MAX;
  // Sem o protocolo, para o preview ficar curto e legível.
  const siteUrl = siteConfig.url.replace(/^https?:\/\//, "");

  function submit() {
    const fd = new FormData();
    fd.set("titulo", titulo);
    fd.set("slug", slug);
    fd.set("resumo", resumo);
    fd.set("conteudo", conteudo);
    fd.set("imagemCapa", imagemCapa);
    fd.set("galeria", JSON.stringify(galeria));
    fd.set("documentos", JSON.stringify(documentos));
    fd.set("categoriaIds", JSON.stringify(categoriaIds));
    fd.set("dataPublicacao", dataPublicacao);
    fd.set("publicado", publicado ? "true" : "false");
    fd.set("destaque", destaque ? "true" : "false");

    startTransition(async () => {
      const res = editing
        ? await atualizarNoticia(noticia!.id, fd)
        : await criarNoticia(fd);
      if (res.success) {
        toast.success(res.message ?? "Salvo.");
        router.push("/admin/noticias");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="pb-24"
    >
      {/* Cabeçalho */}
      <div className="mb-5 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin/noticias">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </Button>
        <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
          {editing ? "Editar notícia" : "Nova notícia"}
        </h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Coluna principal */}
        <div className="space-y-5">
          <Section title="Informações principais">
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => onTituloChange(e.target.value)}
                  placeholder="Título da notícia"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Endereço da notícia (URL)</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEditado(true);
                  }}
                  placeholder="gerado-a-partir-do-titulo"
                />

                {/* Preview do link final, já normalizado pelo servidor */}
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1 rounded-md bg-slate-50 px-2.5 py-1.5">
                  <span className="text-xs text-muted-foreground">
                    {siteUrl}/noticias/
                  </span>
                  <span className="break-all text-xs font-medium text-primary">
                    {slugFinal || "..."}
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {slugLongo ? (
                    <span className="text-amber-600">
                      {slugFinal.length} caracteres — links longos são cortados
                      no Google. Encurte para até {SLUG_MAX}.
                    </span>
                  ) : (
                    <>
                      {slugFinal.length}/{SLUG_MAX} caracteres. Gerado do título
                      (sem palavras como “de”, “para”, “dos”). Edite se quiser.
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <UserRound className="h-4 w-4" />
                Autoria: <strong>ASCOM ADCESP</strong>
              </div>
            </div>
          </Section>

          <Section
            title="Resumo"
            description="Texto exibido abaixo da imagem de destaque, na listagem e no topo da matéria."
          >
            <Textarea
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              rows={3}
              placeholder="Um resumo curto e atrativo da notícia..."
              required
            />
          </Section>

          <Section
            title="Conteúdo *"
            description="Corpo principal. Parágrafos, espaçamento, imagens no meio do texto e links são preservados."
          >
            <TiptapEditor value={conteudo} onChange={setConteudo} />
          </Section>

          <Section
            title="Galeria de fotos"
            description="Envie várias fotos de uma vez e reordene com as setas. Recomendado: 1600 × 1200 px (4:3) ou maior — as fotos são exibidas em quadrado na matéria. Imagens acima de 1920 px são reduzidas automaticamente."
          >
            <GaleriaUpload value={galeria} onChange={setGaleria} />
          </Section>

          <Section
            title="Documentos anexos"
            description="Anexe PDF, DOC, planilhas, etc. Ficam disponíveis para download na matéria."
          >
            <DocumentosUpload value={documentos} onChange={setDocumentos} />
          </Section>
        </div>

        {/* Coluna lateral (configurações) */}
        <div className="space-y-5">
          <Section title="Publicação">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPublicado((v) => !v)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                  publicado
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  {publicado ? (
                    <Eye className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  )}
                  {publicado ? "Publicar" : "Rascunho"}
                </span>
                <span
                  className={cn(
                    "relative h-5 w-9 rounded-full transition-colors",
                    publicado ? "bg-emerald-500" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all",
                      publicado ? "left-4" : "left-0.5"
                    )}
                  />
                </span>
              </button>
              <p className="text-xs text-muted-foreground">
                {publicado
                  ? "A notícia ficará visível no site."
                  : "Salva como rascunho — não aparece no site."}
              </p>

              <button
                type="button"
                onClick={() => setDestaque((v) => !v)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                  destaque
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-200 bg-white"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Star
                    className={cn(
                      "h-4 w-4",
                      destaque ? "fill-amber-400 text-amber-500" : "text-slate-400"
                    )}
                  />
                  Destaque no carrossel
                </span>
                <span
                  className={cn(
                    "relative h-5 w-9 rounded-full transition-colors",
                    destaque ? "bg-amber-500" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all",
                      destaque ? "left-4" : "left-0.5"
                    )}
                  />
                </span>
              </button>
              <p className="text-xs text-muted-foreground">
                Máx. 5 no carrossel da home. Ao ativar a 6ª, a mais antiga sai
                automaticamente. Requer imagem de destaque.
              </p>

              <div>
                <Label htmlFor="data">Data de publicação</Label>
                <Input
                  id="data"
                  type="date"
                  value={dataPublicacao}
                  onChange={(e) => setDataPublicacao(e.target.value)}
                />
              </div>
            </div>
          </Section>

          <Section title="Imagem de destaque">
            <ImageCropUpload
              label="Imagem de destaque"
              value={imagemCapa}
              onChange={setImagemCapa}
              aspect={1200 / 630}
              recomendacao="Recomendado: 1200 × 630 px (1.91:1) — mesmo formato usado no compartilhamento do WhatsApp."
            />
          </Section>

          <Section title="Categorias">
            <CategoriasField
              initial={categorias}
              selectedIds={categoriaIds}
              onChange={setCategoriaIds}
            />
          </Section>
        </div>
      </div>

      {/* Barra de ação fixa (mobile-first) */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 p-3 backdrop-blur md:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3">
          <Button asChild variant="outline" type="button">
            <Link href="/admin/noticias">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {editing ? "Salvar alterações" : publicado ? "Publicar" : "Salvar rascunho"}
          </Button>
        </div>
      </div>
    </form>
  );
}
