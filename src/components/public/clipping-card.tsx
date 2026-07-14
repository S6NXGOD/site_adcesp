import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type Clipping = {
  id: string;
  titulo: string;
  urlExterna: string;
  nomeVeiculo: string;
  dataPublicacao: Date;
  caminhoImagemCapa: string | null;
};

export function ClippingCard({ clipping }: { clipping: Clipping }) {
  return (
    <a
      href={clipping.urlExterna}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${clipping.titulo} — abrir em ${clipping.nomeVeiculo} (novo site)`}
      className="group block h-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Card className="flex h-full flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
        {/* Imagem (ou fallback com o nome do veículo) */}
        {clipping.caminhoImagemCapa ? (
          <div className="relative aspect-video overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={clipping.caminhoImagemCapa}
              alt={clipping.titulo}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute right-2 top-2 inline-flex items-center rounded-full bg-white/90 p-1.5 text-slate-700 shadow-sm backdrop-blur">
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </div>
        ) : (
          <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-primary to-slate-800 p-4 text-center">
            <span className="text-lg font-bold text-white">
              {clipping.nomeVeiculo}
            </span>
            <span className="absolute right-2 top-2 inline-flex items-center rounded-full bg-white/20 p-1.5 text-white">
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </div>
        )}

        <CardContent className="flex flex-1 flex-col p-4">
          {/* Cabeçalho: veículo em destaque + data */}
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-bold text-primary">
              {clipping.nomeVeiculo}
            </span>
            <time className="shrink-0 text-xs text-muted-foreground">
              {formatDate(clipping.dataPublicacao)}
            </time>
          </div>

          {/* Título */}
          <h3 className="mt-2 line-clamp-3 flex-1 text-base font-semibold leading-snug text-slate-900 transition-colors group-hover:text-primary">
            {clipping.titulo}
          </h3>

          {/* Chamada para ação externa */}
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Ler no veículo
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </CardContent>
      </Card>
    </a>
  );
}
