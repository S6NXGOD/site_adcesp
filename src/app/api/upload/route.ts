import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import path from "path";
import { authOptions } from "@/lib/auth";
import { savePublicFile } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Upload de arquivos do painel. Grava em <STORAGE_PATH>/uploads (Volume do
 * Railway em produção) e devolve o caminho da API que serve o arquivo.
 * Protegido: apenas usuários autenticados.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Nenhum arquivo enviado." },
      { status: 400 }
    );
  }

  try {
    const url = await savePublicFile(file);
    return NextResponse.json({
      url,
      nome: file.name,
      tipo: path.extname(file.name).toLowerCase().replace(".", ""),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha no upload." },
      { status: 400 }
    );
  }
}
