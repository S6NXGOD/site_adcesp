import { prisma } from "@/lib/prisma";
import { NoticiaForm } from "@/components/admin/noticia-form";

export const dynamic = "force-dynamic";

async function getCategorias() {
  try {
    return await prisma.categoria.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, slug: true, cor: true },
    });
  } catch {
    return [];
  }
}

export default async function NovaNoticiaPage() {
  const categorias = await getCategorias();
  return <NoticiaForm categorias={categorias} />;
}
