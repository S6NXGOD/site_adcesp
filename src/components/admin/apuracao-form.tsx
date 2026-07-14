"use client";

import { useTransition } from "react";
import { Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apurarEleicao } from "@/app/actions/eleicoes";

type Chapa = { id: string; nome: string; numero: number };
type Resultado = {
  votosBrancos: number;
  votosNulos: number;
  totalAptos: number;
  votosChapasJson: unknown;
};

export function ApuracaoForm({
  eleicaoId,
  chapas,
  resultado,
}: {
  eleicaoId: string;
  chapas: Chapa[];
  resultado?: Resultado | null;
}) {
  const [pending, startTransition] = useTransition();
  const votosAnteriores =
    (resultado?.votosChapasJson as { chapaId: string; votos: number }[]) ?? [];

  function votoDe(chapaId: string) {
    return votosAnteriores.find((v) => v.chapaId === chapaId)?.votos ?? "";
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await apurarEleicao(eleicaoId, formData);
      if (res.success) {
        toast.success(res.message ?? "Apuração concluída.");
      } else {
        toast.error(res.error);
      }
    });
  }

  if (chapas.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Cadastre as chapas antes de realizar a apuração.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-3">
        {chapas.map((c) => (
          <div key={c.id} className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-sm font-bold text-primary-foreground">
              {c.numero}
            </span>
            <Label className="flex-1">{c.nome}</Label>
            <Input
              name={`votos_${c.id}`}
              type="number"
              min={0}
              defaultValue={votoDe(c.id)}
              placeholder="0"
              className="w-32"
            />
          </div>
        ))}
      </div>

      <div className="grid gap-4 border-t pt-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="votosBrancos">Votos em branco</Label>
          <Input
            id="votosBrancos"
            name="votosBrancos"
            type="number"
            min={0}
            defaultValue={resultado?.votosBrancos ?? 0}
          />
        </div>
        <div>
          <Label htmlFor="votosNulos">Votos nulos</Label>
          <Input
            id="votosNulos"
            name="votosNulos"
            type="number"
            min={0}
            defaultValue={resultado?.votosNulos ?? 0}
          />
        </div>
        <div>
          <Label htmlFor="totalAptos">Total de aptos</Label>
          <Input
            id="totalAptos"
            name="totalAptos"
            type="number"
            min={0}
            defaultValue={resultado?.totalAptos ?? 0}
          />
        </div>
      </div>

      <Button type="submit" disabled={pending} variant="success">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trophy className="h-4 w-4" />
        )}
        Apurar e encerrar pleito
      </Button>
      <p className="text-xs text-muted-foreground">
        Ao apurar, a chapa com mais votos é definida como vencedora e o status
        da eleição passa para <strong>Concluído</strong>.
      </p>
    </form>
  );
}
