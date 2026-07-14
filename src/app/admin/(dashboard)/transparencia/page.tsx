import { CalendarDays, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import { TransparenciaFormDialog } from "@/components/admin/transparencia-form-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { excluirDocumento } from "@/app/actions/transparencia";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getDocs() {
  try {
    return await prisma.transparencia.findMany({
      orderBy: { dataDocumento: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function AdminTransparenciaPage() {
  const docs = await getDocs();

  return (
    <div>
      <PageTitle
        title="Transparência"
        description="Publique prestações de contas e encaminhamentos de assembleia (PDF)."
      >
        <TransparenciaFormDialog />
      </PageTitle>

      {docs.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-white p-12 text-center text-muted-foreground">
          Nenhum documento publicado.
        </p>
      ) : (
        <div className="space-y-3">
          {docs.map((d) => (
            <div
              key={d.id}
              className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {d.tipo === "PRESTACAO_CONTAS"
                      ? "Prestação de Contas"
                      : "Assembleia"}
                  </Badge>
                </div>
                <h3 className="mt-1 font-semibold text-slate-900">
                  {d.titulo}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(d.dataDocumento)}
                  </span>
                  <a
                    href={d.arquivoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-primary underline"
                  >
                    <FileText className="h-3.5 w-3.5" /> Ver PDF
                  </a>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 border-t pt-2 sm:border-0 sm:pt-0">
                <TransparenciaFormDialog doc={d} />
                <DeleteButton
                  id={d.id}
                  action={excluirDocumento}
                  label="Excluir documento"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
