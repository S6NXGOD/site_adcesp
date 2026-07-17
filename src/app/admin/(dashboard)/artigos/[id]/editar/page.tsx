import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArtigoForm, type ArtigoFormData } from "@/components/admin/artigo-form";
import { paraInputDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getArtigo(id: string) {
  try {
    return await prisma.artigo.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export default async function EditarArtigoPage({
  params,
}: {
  params: { id: string };
}) {
  const artigo = await getArtigo(params.id);
  if (!artigo) notFound();

  const dto: ArtigoFormData = {
    id: artigo.id,
    titulo: artigo.titulo,
    slug: artigo.slug,
    resumo: artigo.resumo,
    conteudo: artigo.conteudo,
    status: artigo.status,
    autorNome: artigo.autorNome,
    caminhoImagemCapa: artigo.caminhoImagemCapa,
    caminhoFotoAutor: artigo.caminhoFotoAutor,
    dataPublicacao: paraInputDate(artigo.dataPublicacao),
  };

  return <ArtigoForm artigo={dto} />;
}
