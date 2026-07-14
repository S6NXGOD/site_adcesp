import { getYoutubeId } from "@/lib/utils";

/** Renderiza um vídeo do YouTube (embed) a partir da URL. */
export function VideoEmbed({
  url,
  title = "Vídeo",
  className,
}: {
  url: string;
  title?: string;
  className?: string;
}) {
  const id = getYoutubeId(url);
  if (!id) {
    // Fallback: link externo caso não seja YouTube.
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex aspect-video w-full items-center justify-center rounded-lg border bg-slate-100 text-sm text-primary underline"
      >
        Assistir ao vídeo
      </a>
    );
  }
  return (
    <div className={`aspect-video w-full overflow-hidden rounded-xl ${className ?? ""}`}>
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
