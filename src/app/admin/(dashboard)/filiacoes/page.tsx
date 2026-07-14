import { Building2, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatusFiliado } from "@prisma/client";
import { PageTitle } from "@/components/admin/page-title";
import { FiliacaoSheet } from "@/components/admin/filiacao-sheet";
import { DeleteButton } from "@/components/admin/delete-button";
import { excluirFiliacao } from "@/app/actions/filiacao";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { campusLabel } from "@/lib/filiacao";

export const dynamic = "force-dynamic";

async function getFiliados() {
  try {
    return await prisma.filiado.findMany({ orderBy: { criadoEm: "desc" } });
  } catch {
    return [];
  }
}

const statusVariant: Record<
  StatusFiliado,
  "warning" | "success" | "destructive"
> = {
  PENDENTE: "warning",
  APROVADO: "success",
  REJEITADO: "destructive",
};

const statusLabel: Record<StatusFiliado, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
};

type Filiado = Awaited<ReturnType<typeof getFiliados>>[number];

function Tabela({ filiados }: { filiados: Filiado[] }) {
  if (filiados.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-white p-10 text-center text-muted-foreground">
        Nenhuma solicitação nesta categoria.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {filiados.map((f) => {
        const anexos = [
          f.caminhoArquivoFicha,
          f.caminhoArquivoIdentificacao,
          f.caminhoArquivoContracheque,
        ].filter(Boolean).length;
        return (
          <div
            key={f.id}
            className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant[f.status]}>
                  {statusLabel[f.status]}
                </Badge>
                {f.status === "PENDENTE" && anexos < 3 && (
                  <span className="text-xs font-medium text-amber-600">
                    {anexos}/3 docs
                  </span>
                )}
              </div>
              <h3 className="mt-1 font-semibold text-slate-900">{f.nome}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {campusLabel[f.campus] ?? f.campus}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(f.dataFiliacao)}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 border-t pt-2 sm:border-0 sm:pt-0">
              <FiliacaoSheet filiado={f} />
              <DeleteButton
                id={f.id}
                action={excluirFiliacao}
                label="Excluir solicitação"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function AdminFiliacoesPage() {
  const filiados = await getFiliados();
  const pendentes = filiados.filter((f) => f.status === "PENDENTE");
  const aprovados = filiados.filter((f) => f.status === "APROVADO");
  const rejeitados = filiados.filter((f) => f.status === "REJEITADO");

  return (
    <div>
      <PageTitle
        title="Moderação de Filiações"
        description="Analise, aprove ou rejeite as solicitações de filiação."
      />

      <Tabs defaultValue="pendentes">
        <TabsList>
          <TabsTrigger value="pendentes">
            Pendentes ({pendentes.length})
          </TabsTrigger>
          <TabsTrigger value="aprovados">
            Aprovados ({aprovados.length})
          </TabsTrigger>
          <TabsTrigger value="rejeitados">
            Rejeitados ({rejeitados.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pendentes" className="mt-6">
          <Tabela filiados={pendentes} />
        </TabsContent>
        <TabsContent value="aprovados" className="mt-6">
          <Tabela filiados={aprovados} />
        </TabsContent>
        <TabsContent value="rejeitados" className="mt-6">
          <Tabela filiados={rejeitados} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
