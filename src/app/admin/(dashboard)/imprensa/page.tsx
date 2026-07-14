import { CalendarDays, ExternalLink, Newspaper } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import { ClippingFormDialog } from "@/components/admin/clipping-form-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { excluirClipping } from "@/app/actions/imprensa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getClippings() {
  try {
    return await prisma.clippingImprensa.findMany({
      orderBy: { dataPublicacao: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function AdminImprensaPage() {
  const clippings = await getClippings();

  return (
    <div>
      <PageTitle
        title="Saiu na Imprensa"
        description="Recortes de matérias sobre a ADCESP publicadas em veículos externos."
      >
        <ClippingFormDialog />
      </PageTitle>

      {clippings.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-12 text-center">
          <Newspaper className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-muted-foreground">
            Nenhum recorte cadastrado ainda.
          </p>
          <div className="mt-4 flex justify-center">
            <ClippingFormDialog />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {clippings.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-3 rounded-xl border bg-white p-3 shadow-sm sm:flex-row sm:items-center"
            >
              {/* Miniatura */}
              <div className="h-20 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-16 sm:w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    c.caminhoImagemCapa ??
                    "https://placehold.co/200x120/e2e8f0/64748b?text=Imprensa"
                  }
                  alt={c.titulo}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant={c.status === "PUBLICADO" ? "success" : "secondary"}
                  >
                    {c.status === "PUBLICADO" ? "Publicado" : "Rascunho"}
                  </Badge>
                  <Badge className="border-transparent bg-purple-100 text-purple-700">
                    {c.nomeVeiculo}
                  </Badge>
                </div>
                <h3 className="mt-1 truncate font-semibold text-slate-900">
                  {c.titulo}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(c.dataPublicacao)}
                  </span>
                  <a
                    href={c.urlExterna}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center gap-1 text-primary underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Abrir matéria</span>
                  </a>
                </div>
              </div>

              {/* Ações */}
              <div className="flex shrink-0 items-center gap-1 border-t pt-2 sm:border-0 sm:pt-0">
                <Button asChild variant="ghost" size="icon" title="Abrir matéria">
                  <a
                    href={c.urlExterna}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <ClippingFormDialog
                  clipping={{
                    id: c.id,
                    titulo: c.titulo,
                    urlExterna: c.urlExterna,
                    nomeVeiculo: c.nomeVeiculo,
                    dataPublicacao: c.dataPublicacao,
                    caminhoImagemCapa: c.caminhoImagemCapa,
                    status: c.status,
                  }}
                />
                <DeleteButton
                  id={c.id}
                  action={excluirClipping}
                  label="Excluir recorte"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
