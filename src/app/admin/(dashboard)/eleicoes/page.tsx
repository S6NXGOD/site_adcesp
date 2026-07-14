import Link from "next/link";
import { Plus, Pencil, Users, FileText, Vote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import { DeleteButton } from "@/components/admin/delete-button";
import { excluirEleicao } from "@/app/actions/eleicoes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function getEleicoes() {
  try {
    return await prisma.eleicao.findMany({
      orderBy: { criadoEm: "desc" },
      include: {
        _count: {
          select: { chapas: true, documentos: true, comissao: true },
        },
      },
    });
  } catch {
    return [];
  }
}

const statusBadge = {
  AGUARDANDO: { label: "Aguardando", variant: "warning" as const },
  EM_ANDAMENTO: { label: "Em andamento", variant: "success" as const },
  CONCLUIDO: { label: "Concluído", variant: "secondary" as const },
};

export default async function AdminEleicoesPage() {
  const eleicoes = await getEleicoes();

  return (
    <div>
      <PageTitle
        title="Eleições"
        description="Gerencie os biênios, documentos, comissão, chapas e apuração."
      >
        <Button asChild>
          <Link href="/admin/eleicoes/nova">
            <Plus className="h-4 w-4" /> Nova eleição
          </Link>
        </Button>
      </PageTitle>

      {eleicoes.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-12 text-center">
          <p className="text-muted-foreground">Nenhuma eleição cadastrada.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/eleicoes/nova">
              <Plus className="h-4 w-4" /> Criar primeira eleição
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {eleicoes.map((e) => {
            const s = statusBadge[e.status];
            return (
              <div
                key={e.id}
                className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </div>
                  <h3 className="mt-1 font-semibold text-slate-900">
                    {e.titulo}
                  </h3>
                  <p className="text-xs text-muted-foreground">/{e.slug}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Vote className="h-3.5 w-3.5" />
                      {e._count.chapas} chapa(s)
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {e._count.documentos} doc(s)
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {e._count.comissao} na comissão
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 border-t pt-2 sm:border-0 sm:pt-0">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/eleicoes/${e.id}`}>
                      <Pencil className="h-4 w-4" /> Editar
                    </Link>
                  </Button>
                  <DeleteButton
                    id={e.id}
                    action={excluirEleicao}
                    label="Excluir eleição"
                    description="Isso remove documentos, comissão, chapas, candidatos e resultado."
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
