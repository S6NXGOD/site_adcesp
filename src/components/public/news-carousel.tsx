"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

type Slide = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  imagemCapa: string | null;
  dataPublicacao: Date;
  categorias: { id: string; nome: string; cor: string | null }[];
};

export function NewsCarousel({ slides }: { slides: Slide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);
  const [selected, setSelected] = useState(0);

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

  if (slides.length === 0) return null;

  return (
    <section className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((s) => {
            const href = `/noticias/${s.slug}`;
            return (
              <div key={s.id} className="relative min-w-0 flex-[0_0_100%]">
                <div className="relative h-[62vh] min-h-[400px] w-full sm:h-[68vh] sm:max-h-[640px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      s.imagemCapa ??
                      "https://placehold.co/1600x900/0d3b66/ffffff?text=ADCESP"
                    }
                    alt={s.titulo}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-10">
                    <div className="container">
                      <div className="max-w-2xl">
                        <div className="mb-3 flex flex-wrap gap-2">
                          {s.categorias.map((c) => (
                            <span
                              key={c.id}
                              className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                              style={{ backgroundColor: c.cor ?? "#0d3b66" }}
                            >
                              {c.nome}
                            </span>
                          ))}
                        </div>
                        <h2 className="text-2xl font-bold leading-tight text-white drop-shadow sm:text-4xl">
                          {s.titulo}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-sm text-white/85 sm:text-base">
                          {s.resumo}
                        </p>
                        <div className="mt-4 flex items-center gap-4">
                          <Link
                            href={href}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-transform hover:scale-105"
                          >
                            Ler notícia <ArrowRight className="h-4 w-4" />
                          </Link>
                          <span className="text-xs text-white/70">
                            {formatDate(s.dataPublicacao)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Setas (escondidas no mobile, swipe é o padrão) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition-colors hover:bg-white/40 sm:block"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition-colors hover:bg-white/40 sm:block"
            aria-label="Próxima"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots */}
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === selected ? "w-6 bg-white" : "w-2 bg-white/50"
                )}
                aria-label={`Ir para o slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
