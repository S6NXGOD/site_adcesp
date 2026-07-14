import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const rotas = [
    "",
    "/quem-somos",
    "/coordenacoes",
    "/noticias",
    "/artigos",
    "/videos",
    "/transparencia",
    "/eventos",
    "/eleicoes",
    "/filiacao",
    "/servicos/espaco-juridico",
    "/servicos/parceria-sesc",
    "/servicos/espaco-lazer",
    "/servicos/plano-saude",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let noticias: { slug: string; atualizadoEm: Date }[] = [];
  try {
    noticias = await prisma.noticia.findMany({
      where: { publicado: true },
      select: { slug: true, atualizadoEm: true },
    });
  } catch {
    noticias = [];
  }

  const noticiasUrls = noticias.map((n) => ({
    url: `${base}/noticias/${n.slug}`,
    lastModified: n.atualizadoEm,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  let artigos: { slug: string; atualizadoEm: Date }[] = [];
  try {
    artigos = await prisma.artigo.findMany({
      where: { status: "PUBLICADO" },
      select: { slug: true, atualizadoEm: true },
    });
  } catch {
    artigos = [];
  }

  const artigosUrls = artigos.map((a) => ({
    url: `${base}/artigos/${a.slug}`,
    lastModified: a.atualizadoEm,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...rotas, ...noticiasUrls, ...artigosUrls];
}
