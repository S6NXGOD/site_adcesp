"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, Building2, Home } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { ImageCropUpload } from "@/components/admin/image-crop-upload";
import { salvarPaginaInstitucional } from "@/app/actions/institucional";

export type InstitucionalData = {
  quemSomosTexto: string;
  quemSomosVideoUrl: string | null;
  historiaTexto: string | null;
  historiaVideoUrl: string | null;
  historiaImagem: string | null;
};

function Secao({
  icon: Icon,
  titulo,
  children,
}: {
  icon: typeof Home;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
        <Icon className="h-5 w-5 text-primary" /> {titulo}
      </h2>
      {children}
    </section>
  );
}

export function InstitucionalForm({ dados }: { dados: InstitucionalData }) {
  const [pending, startTransition] = useTransition();
  const [quemSomosTexto, setQuemSomosTexto] = useState(dados.quemSomosTexto);
  const [quemSomosVideoUrl, setQuemSomosVideoUrl] = useState(
    dados.quemSomosVideoUrl ?? ""
  );
  const [historiaTexto, setHistoriaTexto] = useState(dados.historiaTexto ?? "");
  const [historiaVideoUrl, setHistoriaVideoUrl] = useState(
    dados.historiaVideoUrl ?? ""
  );
  const [historiaImagem, setHistoriaImagem] = useState(
    dados.historiaImagem ?? ""
  );

  function salvar() {
    startTransition(async () => {
      const res = await salvarPaginaInstitucional({
        quemSomosTexto,
        quemSomosVideoUrl,
        historiaTexto,
        historiaVideoUrl,
        historiaImagem,
      });
      if (res.success) toast.success(res.message ?? "Salvo com sucesso!");
      else toast.error(res.error);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
      className="space-y-6 pb-24"
    >
      {/* NOSSA HISTÓRIA (HOME) */}
      <Secao icon={Home} titulo="Nossa História (página inicial)">
        <div className="space-y-4">
          <div>
            <Label>Texto</Label>
            <div className="mt-1">
              <TiptapEditor
                value={historiaTexto}
                onChange={setHistoriaTexto}
                placeholder="Conte a história da ADCESP exibida na página inicial..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="historiaVideoUrl">Vídeo (URL do YouTube)</Label>
            <Input
              id="historiaVideoUrl"
              value={historiaVideoUrl}
              onChange={(e) => setHistoriaVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Se preenchido, o vídeo é exibido ao lado do texto. Caso contrário,
              a imagem abaixo será usada.
            </p>
          </div>

          <ImageCropUpload
            label="Imagem (alternativa ao vídeo)"
            value={historiaImagem}
            onChange={setHistoriaImagem}
            aspect={16 / 9}
            recomendacao="Recomendado: 1200 × 675 px (16:9). Você poderá recortar."
          />
        </div>
      </Secao>

      {/* QUEM SOMOS */}
      <Secao icon={Building2} titulo="Página Quem Somos">
        <div className="space-y-4">
          <div>
            <Label>Texto institucional</Label>
            <p className="mb-1 text-xs text-muted-foreground">
              Exibido em <strong>/quem-somos</strong>.
            </p>
            <TiptapEditor
              value={quemSomosTexto}
              onChange={setQuemSomosTexto}
              placeholder="Apresentação institucional da ADCESP..."
            />
          </div>
          <div>
            <Label htmlFor="quemSomosVideoUrl">Vídeo (URL, opcional)</Label>
            <Input
              id="quemSomosVideoUrl"
              value={quemSomosVideoUrl}
              onChange={(e) => setQuemSomosVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>
      </Secao>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 p-3 backdrop-blur md:left-64">
        <div className="mx-auto flex max-w-5xl justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar conteúdo
          </Button>
        </div>
      </div>
    </form>
  );
}
