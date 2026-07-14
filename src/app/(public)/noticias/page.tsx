import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/public/page-header";
import { NoticiaCard } from "@/components/public/noticia-card";
import { NoticiasSearch } from "@/components/public/noticias-search";
import { NoticiaFiltros } from "@/components/noticia-filtros";
import { Pagination } from "@/components/public/pagination";
import { getNoticias, getCategorias } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Notícias",
  description:
    "Acompanhe as notícias, ações e mobilizações da ADCESP e dos docentes da UESPI.",
};

export const revalidate = 120;

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; categoria?: string };
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const q = searchParams.q?.trim() || undefined;
  const categoria = searchParams.categoria?.trim() || undefined;

  const [{ items, totalPages, total }, categorias] = await Promise.all([
    getNoticias({ page, q, categoria }),
    getCategorias(),
  ]);

  const extraParams = {
    ...(q ? { q } : {}),
    ...(categoria ? { categoria } : {}),
  };

  return (
    <>
      <PageHeader
        title="Notícias"
        description="Fique por dentro das ações, conquistas e mobilizações da categoria."
      />

      <section className="container py-12">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "resultado" : "resultados"}
            {q ? ` para “${q}”` : ""}
          </p>
          <Suspense>
            <NoticiasSearch />
          </Suspense>
        </div>

        <div className="mb-8">
          <Suspense>
            <NoticiaFiltros categorias={categorias} />
          </Suspense>
        </div>

        {items.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((n) => (
                <NoticiaCard key={n.id} noticia={n} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              baseUrl="/noticias"
              extraParams={extraParams}
            />
          </>
        ) : (
          <p className="rounded-lg border border-dashed bg-white p-16 text-center text-muted-foreground">
            Nenhuma notícia encontrada.
          </p>
        )}
      </section>
    </>
  );
}
