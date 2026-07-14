"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Loader2, MessageCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { salvarContato, excluirContato } from "@/app/actions/site-config";

export type Contato = {
  id: string;
  setor: string;
  numero: string;
  mensagem: string | null;
  ordem: number;
  ativo: boolean;
};

function ContatoDialog({ contato }: { contato?: Contato }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const editing = !!contato;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await salvarContato(fd, contato?.id);
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
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Novo setor
        </Button>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar setor de contato" : "Novo setor de contato"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="setor">Setor</Label>
              <Input
                id="setor"
                name="setor"
                placeholder="Ex: Jurídico"
                defaultValue={contato?.setor}
                required
              />
            </div>
            <div>
              <Label htmlFor="numero">Número (WhatsApp)</Label>
              <Input
                id="numero"
                name="numero"
                placeholder="(86) 99999-9999"
                defaultValue={contato?.numero}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="mensagem">Mensagem pré-preenchida (opcional)</Label>
            <Input
              id="mensagem"
              name="mensagem"
              placeholder="Olá! Preciso de atendimento..."
              defaultValue={contato?.mensagem ?? ""}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ordem">Ordem</Label>
              <Input
                id="ordem"
                name="ordem"
                type="number"
                defaultValue={contato?.ordem ?? 0}
              />
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="ativo"
                value="true"
                defaultChecked={contato?.ativo ?? true}
              />
              Ativo (exibir no site)
            </label>
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

export function ContatosManager({ contatos }: { contatos: Contato[] }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ContatoDialog />
      </div>

      {contatos.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhum setor de contato cadastrado.
        </p>
      ) : (
        <ul className="space-y-2">
          {contatos.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-lg border bg-white p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium text-slate-900">
                  {c.setor}
                  {!c.ativo && <Badge variant="secondary">Inativo</Badge>}
                </p>
                <p className="text-sm text-muted-foreground">{c.numero}</p>
              </div>
              <ContatoDialog contato={c} />
              <DeleteButton
                id={c.id}
                action={excluirContato}
                label="Excluir setor"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
