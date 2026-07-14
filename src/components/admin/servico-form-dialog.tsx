"use client";

import { useState, useTransition } from "react";
import { Pencil, Loader2 } from "lucide-react";
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
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { UploadField } from "@/components/admin/upload-field";
import { salvarServico } from "@/app/actions/servicos";

export function ServicoFormDialog({
  tipo,
  titulo,
  servico,
}: {
  tipo: string;
  titulo: string;
  servico?: {
    titulo: string;
    resumo: string | null;
    conteudo: string;
    imagem: string | null;
    videoUrl: string | null;
    publicado: boolean;
  } | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [conteudo, setConteudo] = useState(servico?.conteudo ?? "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("tipo", tipo);
    formData.set("conteudo", conteudo);
    startTransition(async () => {
      const res = await salvarServico(formData);
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
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" /> Editar conteúdo
      </Button>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar: {titulo}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              name="titulo"
              defaultValue={servico?.titulo ?? titulo}
              required
            />
          </div>
          <div>
            <Label htmlFor="resumo">Resumo</Label>
            <Textarea
              id="resumo"
              name="resumo"
              rows={2}
              defaultValue={servico?.resumo ?? ""}
            />
          </div>
          <div>
            <Label>Conteúdo (com fotos, links e formatação)</Label>
            <div className="mt-1">
              <TiptapEditor value={conteudo} onChange={setConteudo} />
            </div>
          </div>
          <div>
            <Label htmlFor="videoUrl">Vídeo (URL do YouTube, opcional)</Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              defaultValue={servico?.videoUrl ?? ""}
            />
          </div>
          <UploadField
            name="imagem"
            label="Imagem de destaque (opcional)"
            defaultValue={servico?.imagem ?? ""}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="publicado"
              value="true"
              defaultChecked={servico?.publicado ?? true}
            />
            Publicado
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
