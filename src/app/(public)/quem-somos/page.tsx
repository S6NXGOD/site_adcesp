import type { Metadata } from "next";
import { PageHeader } from "@/components/public/page-header";
import { VideoEmbed } from "@/components/public/video-embed";
import { getPaginaInstitucional } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Quem Somos",
  description:
    "Conheça a história e a trajetória da ADCESP — Seção Sindical dos Docentes da UESPI.",
};

export const dynamic = "force-dynamic";

export default async function QuemSomosPage() {
  const pagina = await getPaginaInstitucional();

  return (
    <>
      <PageHeader
        title="Quem Somos"
        description="A história e a trajetória da ADCESP — Seção Sindical dos Docentes da UESPI."
      />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        {pagina?.quemSomosTexto ? (
          <div
            className="prose-content text-lg leading-8 text-slate-700 [&>h2]:mt-8 [&>h3]:mt-6 [&>p]:mb-6"
            dangerouslySetInnerHTML={{ __html: pagina.quemSomosTexto }}
          />
        ) : (
          <p className="text-lg leading-8 text-slate-700">
            A <strong>ADCESP</strong> é a entidade representativa dos docentes da
            Universidade Estadual do Piauí.
          </p>
        )}

        {pagina?.quemSomosVideoUrl && (
          <div className="mt-10">
            <VideoEmbed url={pagina.quemSomosVideoUrl} title="Vídeo — Quem Somos" />
          </div>
        )}
      </article>
    </>
  );
}
