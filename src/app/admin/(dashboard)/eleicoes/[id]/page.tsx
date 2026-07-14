import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import {
  EleicaoDetailTabs,
  type EleicaoCompleta,
} from "@/components/admin/eleicao/eleicao-detail-tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const statusBadge = {
  AGUARDANDO: { label: "Aguardando", variant: "warning" as const },
  EM_ANDAMENTO: { label: "Em andamento", variant: "success" as const },
  CONCLUIDO: { label: "Concluído", variant: "secondary" as const },
};

async function getEleicao(id: string) {
  try {
    return await prisma.eleicao.findUnique({
      where: { id },
      include: {
        documentos: { orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }] },
        comissao: { orderBy: { ordem: "asc" } },
        chapas: {
          orderBy: { numero: "asc" },
          include: { candidatos: { orderBy: { ordem: "asc" } } },
        },
        resultado: true,
      },
    });
  } catch {
    return null;
  }
}

export default async function GerenciarEleicaoPage({
  params,
}: {
  params: { id: string };
}) {
  const eleicao = await getEleicao(params.id);
  if (!eleicao) notFound();

  const s = statusBadge[eleicao.status];

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/admin/eleicoes">
          <ArrowLeft className="h-4 w-4" /> Voltar para eleições
        </Link>
      </Button>

      <PageTitle title={eleicao.titulo} description={`Biênio /${eleicao.slug}`}>
        <Badge variant={s.variant}>{s.label}</Badge>
      </PageTitle>

      <EleicaoDetailTabs eleicao={eleicao as unknown as EleicaoCompleta} />
    </div>
  );
}
