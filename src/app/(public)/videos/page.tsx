import type { Metadata } from "next";
import { PageHeader } from "@/components/public/page-header";
import { VideoGrid } from "@/components/public/video-grid";
import { getVideos } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Vídeos",
  description:
    "Vídeos da ADCESP — Seção Sindical dos Docentes da UESPI: eventos, atos e materiais informativos.",
};

export const revalidate = 120;

export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <>
      <PageHeader
        title="Vídeos"
        description="Acompanhe os vídeos da ADCESP: eventos, mobilizações e materiais informativos."
      />
      <section className="container py-12">
        {videos.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-white p-16 text-center text-muted-foreground">
            Nenhum vídeo disponível no momento.
          </p>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </section>
    </>
  );
}
