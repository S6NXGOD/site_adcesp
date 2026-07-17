import type { Metadata } from "next";
import { CalendarDays, MapPin, ExternalLink, Clock } from "lucide-react";
import { PageHeader } from "@/components/public/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEventos } from "@/lib/queries";
import { formatDateLong } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Agenda de assembleias, congressos e atividades sindicais da ADCESP.",
};

export const dynamic = "force-dynamic";

export default async function EventosPage() {
  const eventos = await getEventos();
  const agora = new Date();

  return (
    <>
      <PageHeader
        title="Eventos"
        description="Acompanhe a agenda de assembleias, congressos e mobilizações da categoria."
      />

      <section className="container py-12">
        {eventos.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-white p-16 text-center text-muted-foreground">
            Nenhum evento cadastrado no momento.
          </p>
        ) : (
          <ol className="relative space-y-6 border-l-2 border-slate-200 pl-6">
            {eventos.map((e) => {
              const futuro = new Date(e.dataInicio) >= agora;
              return (
                <li key={e.id} className="relative">
                  <span
                    className={`absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white ${
                      futuro ? "bg-primary" : "bg-slate-300"
                    }`}
                  />
                  <div className="overflow-hidden rounded-lg border bg-white shadow-sm md:flex">
                    {e.imagem && (
                      <div className="md:w-56 md:shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={e.imagem}
                          alt={e.titulo}
                          className="h-40 w-full object-cover md:h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-5">
                      <div className="flex items-center gap-2">
                        <Badge variant={futuro ? "default" : "secondary"}>
                          {futuro ? "Em breve" : "Realizado"}
                        </Badge>
                      </div>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">
                        {e.titulo}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {formatDateLong(e.dataInicio)}
                        </span>
                        {e.dataFim && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            até {formatDateLong(e.dataFim)}
                          </span>
                        )}
                        {e.local && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" /> {e.local}
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        {e.descricao}
                      </p>
                      {e.linkInscricao && (
                        <Button asChild size="sm" className="mt-4">
                          <a
                            href={e.linkInscricao}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Inscreva-se <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </>
  );
}
