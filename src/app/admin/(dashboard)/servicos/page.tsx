import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import { ServicoFormDialog } from "@/components/admin/servico-form-dialog";
import { Badge } from "@/components/ui/badge";
import { servicoLabels } from "@/lib/site";
import { TipoServico } from "@prisma/client";

export const dynamic = "force-dynamic";

async function getServicos() {
  try {
    return await prisma.servico.findMany();
  } catch {
    return [];
  }
}

export default async function AdminServicosPage() {
  const servicos = await getServicos();
  const tipos = Object.keys(servicoLabels) as TipoServico[];

  return (
    <div>
      <PageTitle
        title="Serviços"
        description="Edite o conteúdo das páginas de serviços (submenus)."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {tipos.map((tipo) => {
          const servico = servicos.find((s) => s.tipo === tipo);
          return (
            <div
              key={tipo}
              className="flex items-center justify-between rounded-xl border bg-white p-5 shadow-sm"
            >
              <div>
                <h3 className="font-semibold text-slate-900">
                  {servicoLabels[tipo]}
                </h3>
                <Badge
                  variant={servico?.publicado ? "success" : "secondary"}
                  className="mt-1"
                >
                  {servico
                    ? servico.publicado
                      ? "Publicado"
                      : "Rascunho"
                    : "Usando conteúdo padrão"}
                </Badge>
              </div>
              <ServicoFormDialog
                tipo={tipo}
                titulo={servicoLabels[tipo]}
                servico={servico}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
