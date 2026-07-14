import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Noticia = {
  id: string;
  titulo: string;
  resumo: string;
  slug: string;
  imagemCapa: string | null;
  dataPublicacao: Date;
  categorias?: { id: string; nome: string; cor: string | null }[];
};

export function NoticiaCard({ noticia }: { noticia: Noticia }) {
  const categoria = noticia.categorias?.[0];

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/noticias/${noticia.slug}`}
        className="relative aspect-video overflow-hidden bg-slate-100"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            noticia.imagemCapa ??
            `https://placehold.co/600x340/0d3b66/ffffff?text=ADCESP`
          }
          alt={noticia.titulo}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {categoria && (
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: categoria.cor ?? "#0d3b66" }}
          >
            {categoria.nome}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <time className="text-xs text-muted-foreground">
          {formatDate(noticia.dataPublicacao)}
        </time>
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-900">
          <Link href={`/noticias/${noticia.slug}`} className="hover:text-primary">
            {noticia.titulo}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {noticia.resumo}
        </p>
        <Link
          href={`/noticias/${noticia.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ler matéria <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
