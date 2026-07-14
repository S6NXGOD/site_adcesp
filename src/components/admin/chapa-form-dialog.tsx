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
import { UploadField } from "@/components/admin/upload-field";
import { salvarChapa } from "@/app/actions/eleicoes";

type Chapa = {
  id: string;
  nome: string;
  numero: number;
  slogan: string | null;
  logoUrl: string | null;
};

export function ChapaFormDialog({
  eleicaoId,
  chapa,
}: {
  eleicaoId: string;
  chapa?: Chapa;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const editing = !!chapa;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("eleicaoId", eleicaoId);
    startTransition(async () => {
      const res = await salvarChapa(formData, chapa?.id);
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
          <Plus className="h-4 w-4" /> Nova chapa
        </Button>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar chapa" : "Nova chapa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <div>
              <Label htmlFor="nome">Nome da chapa</Label>
              <Input id="nome" name="nome" defaultValue={chapa?.nome} required />
            </div>
            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                name="numero"
                type="number"
                defaultValue={chapa?.numero}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="slogan">Slogan (opcional)</Label>
            <Input
              id="slogan"
              name="slogan"
              defaultValue={chapa?.slogan ?? ""}
            />
          </div>
          <UploadField
            name="logoUrl"
            label="Logo da chapa"
            defaultValue={chapa?.logoUrl ?? ""}
          />

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
