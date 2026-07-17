import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  UserRound,
  FileText,
  Download,
  Images,
} from "lucide-react";
import { ShareButton } from "@/components/public/share-button";
import { NoticiasRelacionadas } from "@/components/public/noticias-relacionadas";
import { Button } from "@/components/ui/button";
import { getNoticiaBySlug, getNoticiasRelacionadas } from "@/lib/queries";
import { siteConfig } from "@/lib/site";
import { formatDateLong } from "@/lib/utils";

type Props = { params: { slug: string } };

type DocumentoAnexo = { url: string; nome: string; tipo?: string };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const noticia = await getNoticiaBySlug(params.slug);
  if (!noticia) return { title: "Notícia não encontrada" };

  // A capa é servida em WebP (/api/files/...), mas o WhatsApp falha
  // silenciosamente com WebP em previews. A rota /api/og devolve a mesma
  // imagem em JPEG 1200×630, que é o que os crawlers renderizam.
  const ogPath = noticia.imagemCapa?.replace("/api/files/", "/api/og/");
  const imagens = ogPath
    ? [{ url: ogPath, width: 1200, height: 630, alt: noticia.titulo }]
    : [];

  return {
    title: noticia.titulo,
    description: noticia.resumo,
    openGraph: {
      title: noticia.titulo,
      description: noticia.resumo,
      images: imagens,
      type: "article",
      publishedTime: new Date(noticia.dataPublicacao).toISOString(),
      url: `/noticias/${noticia.slug}`,
      siteName: siteConfig.name,
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: noticia.titulo,
      description: noticia.resumo,
      images: imagens.map((i) => i.url),
    },
    alternates: { canonical: `/noticias/${noticia.slug}` },
  };
}

export default async function NoticiaPage({ params }: Props) {
  const noticia = await getNoticiaBySlug(params.slug);
  if (!noticia) notFound();

  const galeria = (noticia.galeria as unknown as string[]) ?? [];
  const documentos = (noticia.documentos as unknown as DocumentoAnexo[]) ?? [];

  const relacionadas = await getNoticiasRelacionadas(
    noticia.slug,
    noticia.categorias.map((c) => c.id)
  );

  return (
    <article>
      {/* Cabeçalho colorido */}
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/noticias"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar para Notícias
            </Link>
            <ShareButton title={noticia.titulo} resumo={noticia.resumo} />
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-2">
            {noticia.categorias.map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white"
                style={c.cor ? { backgroundColor: c.cor } : undefined}
              >
                {c.nome}
              </span>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            {noticia.titulo}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDateLong(noticia.dataPublicacao)}
            </span>
            <span className="flex items-center gap-1.5">
              <UserRound className="h-4 w-4" /> {noticia.autoria}
            </span>
          </div>
        </div>
      </header>

      {/* Corpo */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        {/* Imagem de destaque (contida) + legenda (resumo) */}
        {noticia.imagemCapa && (
          <figure className="mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={noticia.imagemCapa}
              alt={noticia.titulo}
              className="w-full rounded-xl border object-cover"
            />
            {noticia.resumo && (
              <figcaption className="mt-3 text-sm italic text-slate-500">
                {noticia.resumo}
              </figcaption>
            )}
          </figure>
        )}

        {/* Se não houver imagem, mostra o resumo como lead */}
        {!noticia.imagemCapa && noticia.resumo && (
          <p className="mb-6 border-l-4 border-primary pl-4 text-lg font-medium text-slate-700">
            {noticia.resumo}
          </p>
        )}

        {/* Conteúdo (HTML do editor) */}
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
        />

        {/* Galeria de fotos */}
        {galeria.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
              <Images className="h-5 w-5 text-primary" /> Galeria de fotos
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {galeria.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-lg border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Foto ${i + 1} da notícia`}
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Documentos anexos */}
        {documentos.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
              <FileText className="h-5 w-5 text-primary" /> Documentos
            </h2>
            <ul className="divide-y rounded-lg border bg-white">
              {documentos.map((doc, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-red-600" />
                    <span className="truncate text-sm text-slate-700">
                      {doc.nome}
                    </span>
                  </span>
                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <a href={doc.url} target="_blank" rel="noreferrer" download>
                      <Download className="h-4 w-4" /> Baixar
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Voltar (rodapé) */}
        <div className="mt-10 border-t pt-6">
          <Button asChild variant="outline">
            <Link href="/noticias">
              <ArrowLeft className="h-4 w-4" /> Voltar para Notícias
            </Link>
          </Button>
        </div>
      </div>

      <NoticiasRelacionadas
        itens={relacionadas.itens}
        mesmoSegmento={relacionadas.mesmoSegmento}
        categoria={noticia.categorias[0]?.nome}
      />
    </article>
  );
}
