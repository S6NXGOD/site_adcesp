import { CalendarDays, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import { EventoFormDialog } from "@/components/admin/evento-form-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { excluirEvento } from "@/app/actions/eventos";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getEventos() {
  try {
    return await prisma.evento.findMany({ orderBy: { dataInicio: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminEventosPage() {
  const eventos = await getEventos();
  const agora = new Date();

  return (
    <div>
      <PageTitle
        title="Eventos"
        description="Cadastre e gerencie a agenda de eventos da ADCESP."
      >
        <EventoFormDialog />
      </PageTitle>

      {eventos.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-white p-12 text-center text-muted-foreground">
          Nenhum evento cadastrado.
        </p>
      ) : (
        <div className="space-y-3">
          {eventos.map((e) => {
            const futuro = new Date(e.dataInicio) >= agora;
            return (
              <div
                key={e.id}
                className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={futuro ? "default" : "secondary"}>
                      {futuro ? "Futuro" : "Realizado"}
                    </Badge>
                  </div>
                  <h3 className="mt-1 font-semibold text-slate-900">
                    {e.titulo}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(e.dataInicio)}
                    </span>
                    {e.local && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {e.local}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 border-t pt-2 sm:border-0 sm:pt-0">
                  <EventoFormDialog evento={e} />
                  <DeleteButton
                    id={e.id}
                    action={excluirEvento}
                    label="Excluir evento"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
