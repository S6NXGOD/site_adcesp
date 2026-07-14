"use client";

import { useState, useTransition } from "react";
import { UserPlus, Loader2 } from "lucide-react";
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
import { salvarCandidato } from "@/app/actions/eleicoes";

const CARGOS_SUGERIDOS = [
  "Coordenador Estadual",
  "Vice-Coordenador Estadual",
  "Secretário-Geral",
  "Tesoureiro",
  "Coordenador Regional - Teresina",
  "Coordenador Regional - Parnaíba",
  "Coordenador Regional - Picos",
  "Coordenador Regional - Floriano",
];

export function CandidatoFormDialog({ chapaId }: { chapaId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("chapaId", chapaId);
    startTransition(async () => {
      const res = await salvarCandidato(formData);
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
        <UserPlus className="h-4 w-4" /> Candidato
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular candidato à chapa</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do candidato</Label>
            <Input id="nome" name="nome" required />
          </div>
          <div>
            <Label htmlFor="cargo">Cargo</Label>
            <Input
              id="cargo"
              name="cargo"
              list="cargos-sugeridos"
              placeholder="Ex: Coordenador Estadual"
              required
            />
            <datalist id="cargos-sugeridos">
              {CARGOS_SUGERIDOS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <p className="mt-1 text-xs text-muted-foreground">
              Cargos com “Estadual” aparecem agrupados como Coordenação
              Estadual; os demais como Regionais no portal.
            </p>
          </div>
          <UploadField name="fotoUrl" label="Foto do candidato" />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
