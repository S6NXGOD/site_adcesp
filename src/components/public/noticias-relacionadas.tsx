import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { NoticiaCard } from "@/components/public/noticia-card";

type Noticia = React.ComponentProps<typeof NoticiaCard>["noticia"];

/**
 * "Confira também" no fim da matéria. Mostra outras notícias do mesmo
 * segmento; quando não há, cai para as mais recentes (o subtítulo muda para
 * não prometer o que não é).
 */
export function NoticiasRelacionadas({
  itens,
  mesmoSegmento,
  categoria,
}: {
  itens: Noticia[];
  mesmoSegmento: boolean;
  categoria?: string;
}) {
  if (itens.length === 0) return null;

  return (
    <section className="border-t bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <Newspaper className="h-5 w-5 shrink-0 text-primary" />
              Confira também
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mesmoSegmento && categoria
                ? `Outras notícias de ${categoria}.`
                : "Outras notícias da ADCESP."}
            </p>
          </div>
          <Link
            href="/noticias"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((n) => (
            <NoticiaCard key={n.id} noticia={n} />
          ))}
        </div>
      </div>
    </section>
  );
}
