"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  salvarMembroComissao,
  excluirMembroComissao,
} from "@/app/actions/eleicoes";

type Membro = { id: string; nome: string; cargo: string; ordem: number };

const CARGOS = [
  "Presidente",
  "Vice-Presidente",
  "Secretário(a)",
  "Mesário(a)",
  "Suplente",
];

export function ComissaoTab({
  eleicaoId,
  comissao,
}: {
  eleicaoId: string;
  comissao: Membro[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("eleicaoId", eleicaoId);
    formData.set("ordem", String(comissao.length));
    startTransition(async () => {
      const res = await salvarMembroComissao(formData);
      if (res.success) {
        toast.success(res.message ?? "Salvo.");
        formRef.current?.reset();
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Formulário de adição */}
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" name="nome" placeholder="Ex: Marcelo Regis" required />
        </div>
        <div className="flex-1">
          <Label htmlFor="cargo">Cargo</Label>
          <Input
            id="cargo"
            name="cargo"
            list="cargos-comissao"
            placeholder="Ex: Presidente"
            required
          />
          <datalist id="cargos-comissao">
            {CARGOS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Adicionar
        </Button>
      </form>

      {/* Lista */}
      {comissao.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nenhum membro cadastrado.
        </p>
      ) : (
        <ul className="divide-y rounded-xl border bg-white">
          {comissao.map((m) => (
            <li key={m.id} className="flex items-center gap-3 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{m.nome}</p>
                <p className="text-sm text-muted-foreground">{m.cargo}</p>
              </div>
              <DeleteButton
                id={m.id}
                action={excluirMembroComissao}
                label="Remover membro"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
