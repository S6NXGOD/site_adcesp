import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Users,
  ShieldCheck,
  Scale,
  HeartHandshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoticiaCard } from "@/components/public/noticia-card";
import { NewsCarousel } from "@/components/public/news-carousel";
import { VideoCarousel } from "@/components/public/video-carousel";
import { VideoEmbed } from "@/components/public/video-embed";
import {
  getCarrossel,
  getUltimasNoticias,
  getProximosEventos,
  getPaginaInstitucional,
  getVideos,
} from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 300; // ISR a cada 5 min

const galeria = [
  "https://placehold.co/400x300/0d3b66/ffffff?text=Assembleia",
  "https://placehold.co/400x300/1b998b/ffffff?text=Congresso",
  "https://placehold.co/400x300/f4a261/ffffff?text=Posse",
  "https://placehold.co/400x300/0d3b66/ffffff?text=Mobilizacao",
];

export default async function HomePage() {
  const [carrossel, noticias, eventos, pagina, videos] = await Promise.all([
    getCarrossel(5),
    getUltimasNoticias(6),
    getProximosEventos(3),
    getPaginaInstitucional(),
    getVideos(),
  ]);

  return (
    <>
      {/* CARROSSEL DE NOTÍCIAS (últimas em destaque) */}
      {carrossel.length > 0 ? (
        <NewsCarousel slides={carrossel} />
      ) : (
        /* Fallback: hero institucional quando não há destaques */
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-slate-900 text-white">
          <div className="container grid gap-8 py-20 md:grid-cols-2 md:py-28">
            <div className="flex flex-col justify-center">
              <span className="mb-4 inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                Secção Sindical dos Docentes da UESPI
              </span>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                Defendendo os direitos dos docentes da UESPI
              </h1>
              <p className="mt-4 max-w-lg text-lg text-white/80">
                A ADCESP representa, organiza e luta pela valorização da
                carreira docente, por melhores condições de trabalho e por uma
                universidade pública de qualidade.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/filiacao">Filie-se à ADCESP</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10"
                >
                  <Link href="/quem-somos">Conheça nossa história</Link>
                </Button>
              </div>
            </div>
            <div className="hidden items-center justify-center md:flex">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Scale, label: "Defesa Jurídica" },
                  { icon: Users, label: "Representação" },
                  { icon: ShieldCheck, label: "Transparência" },
                  { icon: HeartHandshake, label: "Benefícios" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-2 rounded-xl bg-white/10 p-6 backdrop-blur"
                  >
                    <Icon className="h-8 w-8" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* HISTÓRICO */}
      <section className="container py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Nossa História
            </h2>
            {pagina?.historiaTexto ? (
              <div
                className="prose-content mt-4"
                dangerouslySetInnerHTML={{ __html: pagina.historiaTexto }}
              />
            ) : (
              <div className="mt-4 space-y-4 text-slate-600">
                <p>
                  A{" "}
                  <strong>
                    ADCESP — Secção Sindical dos Docentes da UESPI
                  </strong>{" "}
                  representa, organiza e luta pela valorização da carreira
                  docente e por uma universidade pública de qualidade.
                </p>
              </div>
            )}
            <Button asChild className="mt-6" variant="outline">
              <Link href="/quem-somos">
                Saiba mais sobre nós <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* MÍDIA: vídeo (prioridade) ou imagem */}
          <div className="overflow-hidden rounded-xl border shadow-sm">
            {pagina?.historiaVideoUrl ? (
              <VideoEmbed
                url={pagina.historiaVideoUrl}
                title="Vídeo institucional ADCESP"
              />
            ) : pagina?.historiaImagem ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pagina.historiaImagem}
                alt="ADCESP"
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-slate-100 text-sm text-muted-foreground">
                Conteúdo em breve
              </div>
            )}
          </div>
        </div>
      </section>

      {/* VÍDEOS */}
      {videos.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="container">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Vídeos</h2>
                <p className="mt-1 text-muted-foreground">
                  Acompanhe os vídeos da ADCESP.
                </p>
              </div>
              <Button asChild variant="ghost" className="hidden sm:flex">
                <Link href="/videos">
                  Ver todos <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <VideoCarousel videos={videos} />
          </div>
        </section>
      )}

      {/* DESTAQUES DE NOTÍCIAS */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Últimas Notícias
              </h2>
              <p className="mt-1 text-muted-foreground">
                Fique por dentro das ações e mobilizações da categoria.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/noticias">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {noticias.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {noticias.map((n) => (
                <NoticiaCard key={n.id} noticia={n} />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed bg-white p-10 text-center text-muted-foreground">
              Nenhuma notícia publicada ainda.
            </p>
          )}
        </div>
      </section>

      {/* PRÓXIMOS EVENTOS */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Próximos Eventos
            </h2>
            <p className="mt-1 text-muted-foreground">
              Assembleias, congressos e atividades sindicais.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:flex">
            <Link href="/eventos">
              Agenda completa <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {eventos.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {eventos.map((e) => (
              <div
                key={e.id}
                className="flex gap-4 rounded-lg border bg-white p-5 shadow-sm"
              >
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-xl font-bold">
                    {new Date(e.dataInicio).getDate()}
                  </span>
                  <span className="text-xs uppercase">
                    {new Date(e.dataInicio).toLocaleDateString("pt-BR", {
                      month: "short",
                    })}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{e.titulo}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(e.dataInicio)}
                  </p>
                  {e.local && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {e.local}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed bg-white p-10 text-center text-muted-foreground">
            Nenhum evento agendado no momento.
          </p>
        )}
      </section>

      {/* GALERIA DE FOTOS */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="mb-8 text-3xl font-bold text-slate-900">
            Galeria de Fotos
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {galeria.map((src, i) => (
              <div
                key={i}
                className="aspect-[4/3] overflow-hidden rounded-lg border bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Foto da galeria ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FILIAÇÃO */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold">Juntos somos mais fortes</h2>
          <p className="mt-3 max-w-xl text-primary-foreground/80">
            Filie-se à ADCESP e fortaleça a luta coletiva pela valorização dos
            docentes da UESPI.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link href="/filiacao">Quero me filiar</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
