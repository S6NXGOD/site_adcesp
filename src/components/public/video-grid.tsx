"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { getYoutubeId } from "@/lib/utils";

type Video = {
  id: string;
  titulo: string;
  descricao: string | null;
  url: string;
};

export function VideoGrid({ videos }: { videos: Video[] }) {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((v) => {
        const id = getYoutubeId(v.url);
        const isPlaying = playing === v.id;
        return (
          <div
            key={v.id}
            className="overflow-hidden rounded-xl border bg-white shadow-sm"
          >
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
              <h3 className="font-semibold text-slate-900">{v.titulo}</h3>
              {v.descricao && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {v.descricao}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
