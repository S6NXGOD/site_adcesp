import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import { ArtigoRowActions } from "@/components/admin/artigo-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getArtigos() {
  try {
    return await prisma.artigo.findMany({
      orderBy: { dataPublicacao: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function AdminArtigosPage() {
  const artigos = await getArtigos();

  return (
    <div>
      <PageTitle
        title="Artigos"
        description="Produção autoral dos professores da UESPI."
      >
        <Button asChild>
          <Link href="/admin/artigos/novo">
            <Plus className="h-4 w-4" /> Novo artigo
          </Link>
        </Button>
      </PageTitle>

      {artigos.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-12 text-center">
          <p className="text-muted-foreground">Nenhum artigo cadastrado.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/artigos/novo">
              <Plus className="h-4 w-4" /> Criar primeiro artigo
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {artigos.map((a) => (
            <div
              key={a.id}
              className="flex flex-col gap-3 rounded-xl border bg-white p-3 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="h-20 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-16 sm:w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    a.caminhoImagemCapa ??
                    "https://placehold.co/200x120/e2e8f0/64748b?text=Sem+capa"
                  }
                  alt={a.titulo}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant={a.status === "PUBLICADO" ? "success" : "secondary"}
                  >
                    {a.status === "PUBLICADO" ? "Publicado" : "Rascunho"}
                  </Badge>
                </div>
                <h3 className="mt-1 truncate font-semibold text-slate-900">
                  {a.titulo}
                </h3>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Por {a.autorNome}</span>
                  <span>•</span>
                  <span>{formatDate(a.dataPublicacao)}</span>
                </p>
              </div>
              <div className="shrink-0 border-t pt-2 sm:border-0 sm:pt-0">
                <ArtigoRowActions
                  id={a.id}
                  slug={a.slug}
                  publicado={a.status === "PUBLICADO"}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
