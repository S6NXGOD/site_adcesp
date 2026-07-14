import Link from "next/link";

type Artigo = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  caminhoImagemCapa: string | null;
  autorNome: string;
  caminhoFotoAutor: string | null;
};

export function ArtigoCard({ artigo }: { artigo: Artigo }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/artigos/${artigo.slug}`}
        className="relative aspect-video overflow-hidden bg-slate-100"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            artigo.caminhoImagemCapa ??
            "https://placehold.co/600x340/0d3b66/ffffff?text=Artigo"
          }
          alt={artigo.titulo}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
          <Link
            href={`/artigos/${artigo.slug}`}
            className="hover:text-primary"
          >
            {artigo.titulo}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {artigo.resumo}
        </p>

        {/* Rodapé: avatar + nome do autor */}
        <div className="mt-4 flex items-center gap-3 border-t pt-4">
          <span className="h-10 w-10 overflow-hidden rounded-full bg-slate-100 ring-2 ring-primary/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                artigo.caminhoFotoAutor ??
                `https://placehold.co/80x80/0d3b66/ffffff?text=${encodeURIComponent(
                  artigo.autorNome.charAt(0)
                )}`
              }
              alt={artigo.autorNome}
              className="h-full w-full object-cover"
            />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Por</p>
            <p className="truncate text-sm font-medium text-slate-900">
              {artigo.autorNome}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
