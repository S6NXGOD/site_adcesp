import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import { CoordenacaoFormDialog } from "@/components/admin/coordenacao-form-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { excluirCoordenacao } from "@/app/actions/coordenacoes";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function getCoordenacoes() {
  try {
    return await prisma.coordenacao.findMany({
      orderBy: [{ tipo: "asc" }, { ordem: "asc" }],
    });
  } catch {
    return [];
  }
}

export default async function AdminCoordenacoesPage() {
  const coords = await getCoordenacoes();

  return (
    <div>
      <PageTitle
        title="Coordenações"
        description="Gerencie a Coordenação Estadual e as Coordenações Regionais."
      >
        <CoordenacaoFormDialog />
      </PageTitle>

      {coords.length === 0 ? (
        <p className="rounded-xl border bg-white p-10 text-center text-muted-foreground">
          Nenhuma coordenação cadastrada.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {coords.map((c) => {
            const membros = (c.membrosJson as { nome: string; cargo: string }[]) ?? [];
            return (
              <div
                key={c.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant={c.tipo === "ESTADUAL" ? "default" : "info"}>
                      {c.tipo === "ESTADUAL" ? "Estadual" : "Regional"}
                    </Badge>
                    <h3 className="mt-2 font-semibold text-slate-900">
                      {c.tipo === "REGIONAL"
                        ? c.nomeRegiao
                        : "Coordenação Estadual"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {membros.length} membro(s)
                    </p>
                  </div>
                  <div className="flex">
                    <CoordenacaoFormDialog item={c} />
                    <DeleteButton
                      id={c.id}
                      action={excluirCoordenacao}
                      label="Excluir coordenação"
                    />
                  </div>
                </div>
                <ul className="mt-3 space-y-1 text-sm">
                  {membros.slice(0, 5).map((m, i) => (
                    <li key={i} className="text-slate-600">
                      <span className="font-medium text-slate-900">
                        {m.nome}
                      </span>{" "}
                      — {m.cargo}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
