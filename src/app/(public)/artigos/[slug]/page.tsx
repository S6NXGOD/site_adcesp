import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArtigoBySlug } from "@/lib/queries";
import { formatDateLong } from "@/lib/utils";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artigo = await getArtigoBySlug(params.slug);
  if (!artigo) return { title: "Artigo não encontrado" };
  return {
    title: artigo.titulo,
    description: artigo.resumo,
    openGraph: {
      title: artigo.titulo,
      description: artigo.resumo,
      images: artigo.caminhoImagemCapa ? [artigo.caminhoImagemCapa] : [],
      type: "article",
    },
  };
}

export default async function ArtigoPage({ params }: Props) {
  const artigo = await getArtigoBySlug(params.slug);
  if (!artigo) notFound();

  return (
    <article>
      {/* Cabeçalho com título em destaque */}
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <Link
            href="/artigos"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Artigos
          </Link>
          <span className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            Artigo
          </span>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            {artigo.titulo}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        {/* Bloco de autor (foto + nome + data) */}
        <div className="mb-8 flex items-center gap-4 rounded-xl border bg-slate-50 p-4">
          <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-2 ring-primary/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                artigo.caminhoFotoAutor ??
                `https://placehold.co/120x120/0d3b66/ffffff?text=${encodeURIComponent(
                  artigo.autorNome.charAt(0)
                )}`
              }
              alt={artigo.autorNome}
              className="h-full w-full object-cover"
            />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Autoria
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {artigo.autorNome}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {formatDateLong(artigo.dataPublicacao)}
            </p>
          </div>
        </div>

        {/* Imagem de capa */}
        {artigo.caminhoImagemCapa && (
          <figure className="mb-8 overflow-hidden rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artigo.caminhoImagemCapa}
              alt={artigo.titulo}
              className="w-full object-cover"
            />
          </figure>
        )}

        {/* Resumo (lead) */}
        <p className="mb-6 border-l-4 border-primary pl-4 text-lg font-medium text-slate-700">
          {artigo.resumo}
        </p>

        {/* Conteúdo */}
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: artigo.conteudo }}
        />

        <div className="mt-10 border-t pt-6">
          <Button asChild variant="outline">
            <Link href="/artigos">
              <ArrowLeft className="h-4 w-4" /> Voltar para Artigos
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
