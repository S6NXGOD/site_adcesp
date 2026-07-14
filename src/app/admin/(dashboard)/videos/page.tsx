import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import { VideoFormDialog } from "@/components/admin/video-form-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { excluirVideo } from "@/app/actions/videos";
import { Badge } from "@/components/ui/badge";
import { getYoutubeId } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getVideos() {
  try {
    return await prisma.video.findMany({
      orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
    });
  } catch {
    return [];
  }
}

export default async function AdminVideosPage() {
  const videos = await getVideos();

  return (
    <div>
      <PageTitle
        title="Vídeos"
        description="Vídeos do carrossel da página inicial e da página /videos."
      >
        <VideoFormDialog />
      </PageTitle>

      {videos.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-white p-12 text-center text-muted-foreground">
          Nenhum vídeo cadastrado.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => {
            const id = getYoutubeId(v.url);
            return (
              <div
                key={v.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="aspect-video bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      id
                        ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
                        : "https://placehold.co/480x270/e2e8f0/64748b?text=Video"
                    }
                    alt={v.titulo}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-slate-900">
                      {v.titulo}
                    </p>
                    <div className="flex shrink-0">
                      <VideoFormDialog video={v} />
                      <DeleteButton
                        id={v.id}
                        action={excluirVideo}
                        label="Excluir vídeo"
                      />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Ordem {v.ordem}</span>
                    <Badge variant={v.ativo ? "success" : "secondary"}>
                      {v.ativo ? "Ativo" : "Inativo"}
                    </Badge>
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
