"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn, getYoutubeId } from "@/lib/utils";

type Video = {
  id: string;
  titulo: string;
  descricao: string | null;
  url: string;
};

export function VideoCarousel({ videos }: { videos: Video[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (videos.length === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {videos.map((v) => {
            const id = getYoutubeId(v.url);
            const isPlaying = playing === v.id;
            return (
              <div
                key={v.id}
                className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc(50%-10px)] lg:flex-[0_0_calc(33.333%-14px)]"
              >
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                  <div className="relative aspect-video bg-slate-900">
                    {isPlaying && id ? (
                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube.com/embed/${id}?autoplay=1`}
                        title={v.titulo}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPlaying(v.id)}
                        className="group relative h-full w-full"
                        aria-label={`Assistir: ${v.titulo}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            id
                              ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
                              : "https://placehold.co/480x270/0d3b66/ffffff?text=Video"
                          }
                          alt={v.titulo}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
                          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform group-hover:scale-110">
                            <Play className="ml-1 h-7 w-7 fill-current" />
                          </span>
                        </span>
                      </button>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-semibold text-slate-900">
                      {v.titulo}
                    </h3>
                    {v.descricao && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {v.descricao}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {videos.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className="rounded-full border bg-white p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className="rounded-full border bg-white p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
