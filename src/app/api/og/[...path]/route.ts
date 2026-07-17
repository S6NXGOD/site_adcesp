import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { resolveInStorage, isProtegido } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * Gera a imagem de compartilhamento (Open Graph) a partir de um arquivo do
 * storage, em 1200×630 JPEG — o formato que o WhatsApp realmente renderiza.
 *
 * Por que existe: os uploads são convertidos para WebP (ótimo para o site),
 * mas o WhatsApp falha silenciosamente com WebP em previews de link,
 * principalmente no Android. Aqui devolvemos sempre JPEG, na proporção
 * 1.91:1 esperada, e abaixo do limite de ~600 KB do crawler.
 *
 * Uso: /api/og/uploads/<arquivo>  (espelha o caminho de /api/files)
 */
const LARGURA = 1200;
const ALTURA = 630;

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const segments = params.path ?? [];

  const invalido =
    segments.length === 0 ||
    segments.some(
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
  // Nunca expor documentos sensíveis (LGPD) como imagem de compartilhamento.
  if (isProtegido(relative)) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  }

  const filePath = resolveInStorage(relative);
  if (!filePath) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
  }

  try {
    const jpeg = await sharp(filePath, { failOn: "none" })
      .rotate()
      .resize(LARGURA, ALTURA, { fit: "cover", position: "attention" })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toBuffer();

    return new NextResponse(jpeg, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(jpeg.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Imagem não encontrada." },
      { status: 404 }
    );
  }
}
