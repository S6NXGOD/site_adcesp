"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { ImageIcon, Loader2, X, Crop as CropIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getCroppedBlob, type Area } from "@/lib/crop-image";

/**
 * Upload de imagem com opção de CROP (react-easy-crop). O usuário seleciona o
 * arquivo, ajusta o enquadramento na proporção recomendada e a imagem recortada
 * é enviada para /api/upload. O caminho resultante é devolvido via onChange.
 */
export function ImageCropUpload({
  value,
  onChange,
  label,
  aspect = 16 / 9,
  recomendacao = "Recomendado: 1200 × 675 px (16:9).",
}: {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  aspect?: number;
  recomendacao?: string;
}) {
  const [open, setOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setAreaPixels(pixels);
  }, []);

  function selecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setOpen(true);
    };
    reader.readAsDataURL(file);
  }

  async function confirmar() {
    if (!imgSrc || !areaPixels) return;
    setEnviando(true);
    try {
      const blob = await getCroppedBlob(imgSrc, areaPixels);
      const file = new File([blob], `imagem-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha no upload.");
      onChange(data.url);
      setOpen(false);
      setImgSrc(null);
      toast.success("Imagem enviada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao processar imagem.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <p className="mb-2 text-xs text-muted-foreground">{recomendacao}</p>

      {value ? (
        <div className="relative w-full overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="w-full object-cover"
            style={{ aspectRatio: String(aspect) }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
            aria-label="Remover imagem"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-slate-50 p-6 text-muted-foreground hover:bg-slate-100">
          <ImageIcon className="h-7 w-7" />
          <span className="text-sm font-medium">Selecionar imagem</span>
          <span className="text-xs">Você poderá recortar antes de enviar.</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={selecionar}
          />
        </label>
      )}

      {/* Modal de crop */}
      <Dialog open={open} onOpenChange={(o) => !enviando && setOpen(o)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CropIcon className="h-5 w-5" /> Ajustar imagem
            </DialogTitle>
          </DialogHeader>

          <div className="relative h-72 w-full overflow-hidden rounded-lg bg-slate-900">
            {imgSrc && (
              <Cropper
                image={imgSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-[hsl(var(--primary))]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={confirmar} disabled={enviando}>
              {enviando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CropIcon className="h-4 w-4" />
              )}
              Recortar e enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
