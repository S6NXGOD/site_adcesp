"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/media-uploads";
import { salvarPopup } from "@/app/actions/popups";

type Popup = {
  id: string;
  titulo: string;
  imagem: string;
  linkUrl: string | null;
  tempoExibicao: number;
};

export function PopupFormDialog({ popup }: { popup?: Popup }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [imagem, setImagem] = useState(popup?.imagem ?? "");
  const editing = !!popup;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("imagem", imagem);
    startTransition(async () => {
      const res = await salvarPopup(fd, popup?.id);
      if (res.success) {
        toast.success(res.message ?? "Salvo.");
        setOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {editing ? (
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Novo Pop-up
        </Button>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Pop-up" : "Novo Pop-up"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título (referência interna)</Label>
            <Input
              id="titulo"
              name="titulo"
              placeholder="Ex: Promoção Março 2026"
              defaultValue={popup?.titulo}
              required
            />
          </div>

          <div>
            <Label>Imagem do Pop-up</Label>
            <p className="mb-2 text-xs text-muted-foreground">
              A arte é exibida inteira, sem cortes. Recomendado:{" "}
              <strong>1080 × 1080</strong> ou <strong>1080 × 1350</strong> (PNG,
              JPG, WEBP).
            </p>
            <ImageUpload value={imagem} onChange={setImagem} />
          </div>

          <div>
            <Label htmlFor="linkUrl">Link ao clicar na imagem (opcional)</Label>
            <Input
              id="linkUrl"
              name="linkUrl"
              placeholder="https://exemplo.com"
              defaultValue={popup?.linkUrl ?? ""}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Se preenchido, ao clicar na imagem o usuário será redirecionado.
            </p>
          </div>

          <div>
            <Label htmlFor="tempoExibicao">Tempo de exibição (segundos)</Label>
            <Input
              id="tempoExibicao"
              name="tempoExibicao"
              type="number"
              min={0}
              max={120}
              defaultValue={popup?.tempoExibicao ?? 0}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Use <strong>0</strong> para o usuário fechar manualmente no “X”.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Salvar" : "Criar Pop-up"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
