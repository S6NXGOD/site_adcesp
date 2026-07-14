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
import { MembrosEditor, type Membro } from "@/components/admin/membros-editor";
import { salvarCoordenacao } from "@/app/actions/coordenacoes";

type Coordenacao = {
  id: string;
  tipo: "ESTADUAL" | "REGIONAL";
  nomeRegiao: string | null;
  descricao: string | null;
  membrosJson: unknown;
  ordem: number;
};

export function CoordenacaoFormDialog({ item }: { item?: Coordenacao }) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<"ESTADUAL" | "REGIONAL">(
    item?.tipo ?? "ESTADUAL"
  );
  const [pending, startTransition] = useTransition();
  const editing = !!item;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await salvarCoordenacao(formData, item?.id);
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
          <Plus className="h-4 w-4" /> Nova coordenação
        </Button>
      )}

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar coordenação" : "Nova coordenação"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <select
                id="tipo"
                name="tipo"
                value={tipo}
                onChange={(e) =>
                  setTipo(e.target.value as "ESTADUAL" | "REGIONAL")
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ESTADUAL">Coordenação Estadual</option>
                <option value="REGIONAL">Coordenação Regional</option>
              </select>
            </div>
            <div>
              <Label htmlFor="ordem">Ordem de exibição</Label>
              <Input
                id="ordem"
                name="ordem"
                type="number"
                defaultValue={item?.ordem ?? 0}
              />
            </div>
          </div>

          {tipo === "REGIONAL" && (
            <div>
              <Label htmlFor="nomeRegiao">Nome da região / campus</Label>
              <Input
                id="nomeRegiao"
                name="nomeRegiao"
                placeholder="Ex: Campus Parnaíba"
                defaultValue={item?.nomeRegiao ?? ""}
              />
            </div>
          )}

          <div>
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              name="descricao"
              rows={2}
              defaultValue={item?.descricao ?? ""}
            />
          </div>

          <div>
            <Label>Membros</Label>
            <MembrosEditor
              defaultValue={(item?.membrosJson as Membro[]) ?? []}
            />
          </div>

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
