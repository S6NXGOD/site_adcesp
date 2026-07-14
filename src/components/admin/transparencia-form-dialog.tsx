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
import {
  criarDocumento,
  atualizarDocumento,
} from "@/app/actions/transparencia";

type Documento = {
  id: string;
  tipo: "PRESTACAO_CONTAS" | "ENCAMINHAMENTO_ASSEMBLEIA";
  titulo: string;
  descricao: string | null;
  arquivoUrl: string;
  dataDocumento: Date;
};

export function TransparenciaFormDialog({ doc }: { doc?: Documento }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const editing = !!doc;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = editing
        ? await atualizarDocumento(doc!.id, formData)
        : await criarDocumento(formData);
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
          <Plus className="h-4 w-4" /> Novo documento
        </Button>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar documento" : "Novo documento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tipo">Categoria</Label>
            <select
              id="tipo"
              name="tipo"
              defaultValue={doc?.tipo ?? "PRESTACAO_CONTAS"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="PRESTACAO_CONTAS">Prestação de Contas</option>
              <option value="ENCAMINHAMENTO_ASSEMBLEIA">
                Encaminhamento de Assembleia
              </option>
            </select>
          </div>
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              name="titulo"
              defaultValue={doc?.titulo}
              required
            />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              name="descricao"
              rows={2}
              defaultValue={doc?.descricao ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="dataDocumento">Data do documento</Label>
            <Input
              id="dataDocumento"
              name="dataDocumento"
              type="date"
              defaultValue={
                doc
                  ? new Date(doc.dataDocumento).toISOString().slice(0, 10)
                  : new Date().toISOString().slice(0, 10)
              }
              required
            />
          </div>
          <UploadField
            name="arquivoUrl"
            label="Arquivo PDF"
            accept="application/pdf"
            defaultValue={doc?.arquivoUrl ?? ""}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Salvar" : "Publicar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
