import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/public/page-header";
import { VideoEmbed } from "@/components/public/video-embed";
import { getServicoByTipo } from "@/lib/queries";
import { servicoSlugToTipo, servicoLabels } from "@/lib/site";

type Props = { params: { submenu: string } };

// Conteúdo padrão (placeholder) caso ainda não exista cadastro no CMS
const defaults: Record<string, { resumo: string; conteudo: string }> = {
  ESPACO_JURIDICO: {
    resumo:
      "Assessoria e orientação jurídica especializada para os docentes filiados.",
    conteudo: `<p>O <strong>Espaço Jurídico</strong> da ADCESP oferece assessoria jurídica aos docentes filiados em questões relacionadas à carreira, direitos funcionais, ações coletivas e individuais.</p>
<h3>Como funciona</h3>
<ul><li>Atendimento mediante agendamento;</li><li>Acompanhamento de processos de interesse da categoria;</li><li>Orientação sobre direitos e deveres do docente.</li></ul>`,
  },
  PARCERIA_SESC: {
    resumo:
      "Convênio com o SESC que garante benefícios e descontos aos filiados.",
    conteudo: `<p>A <strong>parceria com o SESC</strong> proporciona aos docentes filiados e seus dependentes acesso facilitado a atividades de lazer, cultura, esporte e saúde.</p>
<h3>Benefícios</h3><ul><li>Descontos em atividades e eventos;</li><li>Acesso às unidades do SESC;</li><li>Programação cultural e esportiva.</li></ul>`,
  },
  ESPACO_LAZER: {
    resumo: "Estrutura de lazer e convivência para os filiados e familiares.",
    conteudo: `<p>O <strong>Espaço de Lazer</strong> da ADCESP é destinado à confraternização e ao bem-estar dos docentes e suas famílias, com áreas de convivência e atividades recreativas.</p>`,
  },
  PLANO_SAUDE: {
    resumo: "Condições especiais em planos de saúde para a categoria.",
    conteudo: `<p>A ADCESP disponibiliza, por meio de convênios, condições diferenciadas em <strong>planos de saúde</strong> para os docentes filiados e dependentes.</p><h3>Informações</h3><p>Entre em contato com a secretaria da ADCESP para conhecer as operadoras conveniadas e as condições vigentes.</p>`,
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tipo = servicoSlugToTipo[params.submenu];
  if (!tipo) return { title: "Serviço não encontrado" };
  return {
    title: servicoLabels[tipo],
    description: defaults[tipo]?.resumo,
  };
}

export function generateStaticParams() {
  return Object.keys(servicoSlugToTipo).map((submenu) => ({ submenu }));
}

export default async function ServicoPage({ params }: Props) {
  const tipo = servicoSlugToTipo[params.submenu];
  if (!tipo) notFound();

  const servico = await getServicoByTipo(tipo);
  const fallback = defaults[tipo];

  const titulo = servico?.titulo ?? servicoLabels[tipo];
  const resumo = servico?.resumo ?? fallback?.resumo ?? "";
  const conteudo = servico?.conteudo ?? fallback?.conteudo ?? "";

  return (
    <>
      <PageHeader title={titulo} description={resumo} />
      <section className="container max-w-3xl py-12">
        {servico?.imagem && (
          <div className="mb-8 overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={servico.imagem} alt={titulo} className="w-full" />
          </div>
        )}
        {servico?.videoUrl && (
          <div className="mb-8">
            <VideoEmbed url={servico.videoUrl} title={titulo} />
          </div>
        )}
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: conteudo }}
        />
      </section>
    </>
  );
}
