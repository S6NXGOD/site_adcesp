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
import { UploadField } from "@/components/admin/upload-field";
import { criarEvento, atualizarEvento } from "@/app/actions/eventos";

type Evento = {
  id: string;
  titulo: string;
  descricao: string;
  dataInicio: Date;
  dataFim: Date | null;
  local: string | null;
  imagem: string | null;
  linkInscricao: string | null;
  publicado: boolean;
};

function toLocal(d?: Date | null) {
  if (!d) return "";
  const dt = new Date(d);
  const off = dt.getTimezoneOffset();
  return new Date(dt.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function EventoFormDialog({ evento }: { evento?: Evento }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const editing = !!evento;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = editing
        ? await atualizarEvento(evento!.id, formData)
        : await criarEvento(formData);
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
          <Plus className="h-4 w-4" /> Novo evento
        </Button>
      )}

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar evento" : "Novo evento"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              name="titulo"
              defaultValue={evento?.titulo}
              required
            />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              rows={3}
              defaultValue={evento?.descricao}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="dataInicio">Início</Label>
              <Input
                id="dataInicio"
                name="dataInicio"
                type="datetime-local"
                defaultValue={toLocal(evento?.dataInicio)}
                required
              />
            </div>
            <div>
              <Label htmlFor="dataFim">Fim (opcional)</Label>
              <Input
                id="dataFim"
                name="dataFim"
                type="datetime-local"
                defaultValue={toLocal(evento?.dataFim)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="local">Local</Label>
            <Input id="local" name="local" defaultValue={evento?.local ?? ""} />
          </div>
          <div>
            <Label htmlFor="linkInscricao">Link de inscrição (opcional)</Label>
            <Input
              id="linkInscricao"
              name="linkInscricao"
              type="url"
              placeholder="https://..."
              defaultValue={evento?.linkInscricao ?? ""}
            />
          </div>
          <UploadField
            name="imagem"
            label="Imagem do evento"
            defaultValue={evento?.imagem ?? ""}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="publicado"
              defaultChecked={evento?.publicado ?? true}
            />
            Publicado
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
