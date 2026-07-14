import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import { NoticiaRowActions } from "@/components/admin/noticia-row-actions";
import { NoticiaFiltros } from "@/components/noticia-filtros";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [noticias, categorias] = await Promise.all([
      prisma.noticia.findMany({
        orderBy: [{ dataPublicacao: "desc" }],
        include: {
          categorias: {
            select: { id: true, nome: true, slug: true, cor: true },
          },
        },
      }),
      prisma.categoria.findMany({
        orderBy: { nome: "asc" },
        select: { id: true, nome: true, slug: true, cor: true },
      }),
    ]);
    return { noticias, categorias };
  } catch {
    return { noticias: [], categorias: [] };
  }
}

export default async function AdminNoticiasPage({
  searchParams,
}: {
  searchParams: { categoria?: string };
}) {
  const { noticias, categorias } = await getData();

  // Totais (sempre sobre todas as notícias)
  const publicadas = noticias.filter((n) => n.publicado).length;
  const rascunhos = noticias.length - publicadas;
  const destaques = noticias.filter((n) => n.destaque).length;

  // Filtro por categoria (query param)
  const categoria = searchParams.categoria?.trim();
  const lista = categoria
    ? noticias.filter((n) => n.categorias.some((c) => c.slug === categoria))
    : noticias;

  return (
    <div>
      <PageTitle
        title="Notícias & Imprensa"
        description="Gerencie as notícias do site, o carrossel da home e os rascunhos."
      >
        <Button asChild>
          <Link href="/admin/noticias/nova">
            <Plus className="h-4 w-4" /> Nova notícia
          </Link>
        </Button>
      </PageTitle>

      {/* Resumo */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-slate-900">{publicadas}</p>
          <p className="text-xs text-muted-foreground">Publicadas</p>
        </div>
        <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-slate-900">{rascunhos}</p>
          <p className="text-xs text-muted-foreground">Rascunhos</p>
        </div>
        <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-500">{destaques}/5</p>
          <p className="text-xs text-muted-foreground">No carrossel</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-5">
        <NoticiaFiltros categorias={categorias} />
      </div>

      {noticias.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-12 text-center">
          <p className="text-muted-foreground">Nenhuma notícia cadastrada.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/noticias/nova">
              <Plus className="h-4 w-4" /> Criar primeira notícia
            </Link>
          </Button>
        </div>
      ) : lista.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-white p-10 text-center text-muted-foreground">
          Nenhuma notícia para este filtro.
        </p>
      ) : (
        <div className="space-y-3">
          {lista.map((n) => (
            <div
              key={n.id}
              className="flex flex-col gap-3 rounded-xl border bg-white p-3 shadow-sm sm:flex-row sm:items-center"
            >
              {/* Miniatura */}
              <div className="h-20 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-16 sm:w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    n.imagemCapa ??
                    "https://placehold.co/200x120/e2e8f0/64748b?text=Sem+capa"
                  }
                  alt={n.titulo}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={n.publicado ? "success" : "secondary"}>
                    {n.publicado ? "Publicada" : "Rascunho"}
                  </Badge>
                  {n.destaque && (
                    <Badge variant="warning">
                      <Star className="mr-1 h-3 w-3 fill-current" /> Carrossel
                    </Badge>
                  )}
                </div>
                <h3 className="mt-1 truncate font-semibold text-slate-900">
                  {n.titulo}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{formatDate(n.dataPublicacao)}</span>
                  {n.categorias.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-full px-2 py-0.5 text-white"
                      style={{ backgroundColor: c.cor ?? "#64748b" }}
                    >
                      {c.nome}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="shrink-0 border-t pt-2 sm:border-0 sm:pt-0">
                <NoticiaRowActions
                  id={n.id}
                  slug={n.slug}
                  publicado={n.publicado}
                  destaque={n.destaque}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
