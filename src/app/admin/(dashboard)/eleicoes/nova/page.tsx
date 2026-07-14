import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/admin/page-title";
import { DadosGeraisForm } from "@/components/admin/eleicao/dados-gerais-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function NovaEleicaoPage() {
  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/admin/eleicoes">
          <ArrowLeft className="h-4 w-4" /> Voltar para eleições
        </Link>
      </Button>

      <PageTitle
        title="Nova eleição"
        description="Cadastre o biênio. Depois de salvar, você poderá adicionar documentos, comissão e chapas."
      />

      <div className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
        <DadosGeraisForm />
      </div>
    </div>
  );
}
