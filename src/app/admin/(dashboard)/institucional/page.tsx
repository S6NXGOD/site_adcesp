import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import {
  InstitucionalForm,
  type InstitucionalData,
} from "@/components/admin/institucional-form";

export const dynamic = "force-dynamic";

async function getDados(): Promise<InstitucionalData> {
  const vazio: InstitucionalData = {
    quemSomosTexto: "",
    quemSomosVideoUrl: null,
    historiaTexto: null,
    historiaVideoUrl: null,
    historiaImagem: null,
  };
  try {
    const p = await prisma.paginaInstitucional.findUnique({
      where: { id: "singleton" },
    });
    if (!p) return vazio;
    return {
      quemSomosTexto: p.quemSomosTexto,
      quemSomosVideoUrl: p.quemSomosVideoUrl,
      historiaTexto: p.historiaTexto,
      historiaVideoUrl: p.historiaVideoUrl,
      historiaImagem: p.historiaImagem,
    };
  } catch {
    return vazio;
  }
}

export default async function AdminInstitucionalPage() {
  const dados = await getDados();

  return (
    <div>
      <PageTitle
        title="Conteúdo Institucional"
        description="Edite a seção “Nossa História” da home e o texto do “Quem Somos”."
      />
      <InstitucionalForm dados={dados} />
    </div>
  );
}
