import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  NoticiaForm,
  type NoticiaFormData,
} from "@/components/admin/noticia-form";
import type { DocumentoAnexo } from "@/components/admin/media-uploads";

export const dynamic = "force-dynamic";

async function getData(id: string) {
  const [noticia, categorias] = await Promise.all([
    prisma.noticia.findUnique({
      where: { id },
      include: { categorias: { select: { id: true } } },
    }),
    prisma.categoria.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, slug: true, cor: true },
    }),
  ]);
  return { noticia, categorias };
}

export default async function EditarNoticiaPage({
  params,
}: {
  params: { id: string };
}) {
  const { noticia, categorias } = await getData(params.id);
  if (!noticia) notFound();

  const dto: NoticiaFormData = {
    id: noticia.id,
    titulo: noticia.titulo,
    slug: noticia.slug,
    resumo: noticia.resumo,
    conteudo: noticia.conteudo,
    imagemCapa: noticia.imagemCapa,
    dataPublicacao: new Date(noticia.dataPublicacao).toISOString().slice(0, 10),
    publicado: noticia.publicado,
    destaque: noticia.destaque,
    galeria: (noticia.galeria as unknown as string[]) ?? [],
    documentos: (noticia.documentos as unknown as DocumentoAnexo[]) ?? [],
    categoriaIds: noticia.categorias.map((c) => c.id),
  };

  return <NoticiaForm noticia={dto} categorias={categorias} />;
}
