"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { salvarEleicao } from "@/app/actions/eleicoes";

type CalItem = { data: string; evento: string };
export type EleicaoGeral = {
  id: string;
  titulo: string;
  slug: string;
  status: "AGUARDANDO" | "EM_ANDAMENTO" | "CONCLUIDO";
  descricao: string | null;
  calendarioJson: unknown;
};

export function DadosGeraisForm({ eleicao }: { eleicao?: EleicaoGeral }) {
  const router = useRouter();
  const editing = !!eleicao;
  const [pending, startTransition] = useTransition();
  const [cal, setCal] = useState<CalItem[]>(
    (eleicao?.calendarioJson as CalItem[]) ?? []
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("calendarioJson", JSON.stringify(cal));
    startTransition(async () => {
      const res = await salvarEleicao(formData, eleicao?.id);
      if (res.success) {
        toast.success(res.message ?? "Salvo.");
        if (!editing && res.data?.id) {
          router.push(`/admin/eleicoes/${res.data.id}`);
        } else {
          router.refresh();
        }
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            name="titulo"
            placeholder="Ex: Eleições Biênio 2024/2026"
            defaultValue={eleicao?.titulo}
            required
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug (biênio)</Label>
          <Input
            id="slug"
            name="slug"
            placeholder="2024/2026"
            defaultValue={eleicao?.slug}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={eleicao?.status ?? "AGUARDANDO"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="AGUARDANDO">Aguardando</option>
          <option value="EM_ANDAMENTO">Em andamento</option>
          <option value="CONCLUIDO">Concluído</option>
        </select>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          name="descricao"
          rows={3}
          placeholder="Texto introdutório exibido no topo da página pública."
          defaultValue={eleicao?.descricao ?? ""}
        />
      </div>

      {/* Cronograma (opcional) */}
      <div>
        <Label>Cronograma (opcional)</Label>
        <div className="space-y-2">
          {cal.map((c, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="Data (ex: 01/03/2026)"
                value={c.data}
                onChange={(e) =>
                  setCal((arr) =>
                    arr.map((x, idx) =>
                      idx === i ? { ...x, data: e.target.value } : x
                    )
                  )
                }
                className="w-40"
              />
              <Input
                placeholder="Evento"
                value={c.evento}
                onChange={(e) =>
                  setCal((arr) =>
                    arr.map((x, idx) =>
                      idx === i ? { ...x, evento: e.target.value } : x
                    )
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() =>
                  setCal((arr) => arr.filter((_, idx) => idx !== i))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCal((arr) => [...arr, { data: "", evento: "" }])}
          >
            <Plus className="h-4 w-4" /> Adicionar etapa
          </Button>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {editing ? "Salvar alterações" : "Criar eleição"}
      </Button>
    </form>
  );
}
