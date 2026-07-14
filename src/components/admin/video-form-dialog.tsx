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
import { Textarea } from "@/components/ui/textarea";
import { salvarVideo } from "@/app/actions/videos";

type Video = {
  id: string;
  titulo: string;
  descricao: string | null;
  url: string;
  ordem: number;
  ativo: boolean;
};

export function VideoFormDialog({ video }: { video?: Video }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const editing = !!video;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await salvarVideo(formData, video?.id);
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
          <Plus className="h-4 w-4" /> Novo vídeo
        </Button>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar vídeo" : "Novo vídeo"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              name="titulo"
              defaultValue={video?.titulo}
              required
            />
          </div>
          <div>
            <Label htmlFor="url">URL do YouTube</Label>
            <Input
              id="url"
              name="url"
              placeholder="https://www.youtube.com/watch?v=..."
              defaultValue={video?.url}
              required
            />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              name="descricao"
              rows={2}
              defaultValue={video?.descricao ?? ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ordem">Ordem</Label>
              <Input
                id="ordem"
                name="ordem"
                type="number"
                defaultValue={video?.ordem ?? 0}
              />
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="ativo"
                value="true"
                defaultChecked={video?.ativo ?? true}
              />
              Ativo (exibir no site)
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
