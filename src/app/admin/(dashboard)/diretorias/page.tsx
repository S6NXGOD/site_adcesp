import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import { DiretoriaFormDialog } from "@/components/admin/diretoria-form-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { excluirDiretoria } from "@/app/actions/coordenacoes";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function getDiretorias() {
  try {
    return await prisma.diretoriaHistorico.findMany({
      orderBy: [{ status: "asc" }, { gestao: "desc" }],
    });
  } catch {
    return [];
  }
}

export default async function AdminDiretoriasPage() {
  const diretorias = await getDiretorias();

  return (
    <div>
      <PageTitle
        title="Histórico de Diretorias"
        description="Cadastre a gestão atual e as gestões anteriores da ADCESP."
      >
        <DiretoriaFormDialog />
      </PageTitle>

      {diretorias.length === 0 ? (
        <p className="rounded-xl border bg-white p-10 text-center text-muted-foreground">
          Nenhuma gestão cadastrada.
        </p>
      ) : (
        <div className="space-y-4">
          {diretorias.map((d) => {
            const cargos = (d.cargosJson as { nome: string; cargo: string }[]) ?? [];
            return (
              <div
                key={d.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        Gestão {d.gestao}
                      </h3>
                      <Badge
                        variant={d.status === "ATUAL" ? "success" : "secondary"}
                      >
                        {d.status === "ATUAL" ? "Atual" : "Passada"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cargos.length} cargo(s)
                    </p>
                  </div>
                  <div className="flex">
                    <DiretoriaFormDialog item={d} />
                    <DeleteButton
                      id={d.id}
                      action={excluirDiretoria}
                      label="Excluir gestão"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
