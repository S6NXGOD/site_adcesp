import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { readFile, stat } from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";
import { resolveInStorage, contentTypeFor, isProtegido } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serve os arquivos gravados no STORAGE_PATH (fora de `public/`, no Volume do
 * Railway em produção).
 *
 * Segurança:
 * - Bloqueia path traversal ("..", separadores, NUL) e confere que o caminho
 *   resolvido continua dentro da raiz do storage.
 * - Pastas sensíveis (LGPD — ex.: `filiacao/`) exigem sessão do painel.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const segments = params.path ?? [];
  if (segments.length === 0) {
    return NextResponse.json(
      { error: "Arquivo não informado." },
      { status: 400 }
    );
  }

  // Nenhum segmento pode ser vazio, "." , ".." ou conter separadores/NUL.
  const invalido = segments.some(
    (s) =>
      !s ||
      s === "." ||
      s === ".." ||
      s.includes("/") ||
      s.includes("\\") ||
      s.includes("\0")
  );
  if (invalido) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
  }

  const relative = segments.join("/");
  const privado = isProtegido(relative);

  // Documentos sensíveis só para usuários autenticados do painel.
  if (privado) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
  }

  const filePath = resolveInStorage(relative);
  if (!filePath) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      return NextResponse.json(
        { error: "Arquivo não encontrado." },
        { status: 404 }
      );
    }

    const data = await readFile(filePath);
    const nome = path.basename(filePath);

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentTypeFor(nome),
        "Content-Length": String(info.size),
        "Content-Disposition": `inline; filename="${encodeURIComponent(nome)}"`,
        "Cache-Control": privado
          ? "private, no-store"
          : "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Arquivo não encontrado." },
      { status: 404 }
    );
  }
}
