"use client";

import { useState, useTransition } from "react";
import { Plus, Check, Loader2, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  criarCategoria,
  excluirCategoria,
  type CategoriaDTO,
} from "@/app/actions/categorias";

export function CategoriasField({
  initial,
  selectedIds,
  onChange,
}: {
  initial: CategoriaDTO[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [all, setAll] = useState<CategoriaDTO[]>(initial);
  const [novo, setNovo] = useState("");
  const [manage, setManage] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  }

  function adicionar() {
    const nome = novo.trim();
    if (!nome) return;
    startTransition(async () => {
      const res = await criarCategoria(nome);
      if (res.success && res.data) {
        setAll((prev) =>
          prev.some((c) => c.id === res.data!.id) ? prev : [...prev, res.data!]
        );
        if (!selectedIds.includes(res.data.id)) {
          onChange([...selectedIds, res.data.id]);
        }
        setNovo("");
        toast.success(res.message ?? "Categoria adicionada.");
      } else if (!res.success) {
        toast.error(res.error);
      }
    });
  }

  function remover(id: string) {
    if (!window.confirm("Remover esta categoria do sistema?")) return;
    startTransition(async () => {
      const res = await excluirCategoria(id);
      if (res.success) {
        setAll((prev) => prev.filter((c) => c.id !== id));
        onChange(selectedIds.filter((x) => x !== id));
        toast.success(res.message ?? "Removida.");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {all.map((cat) => {
          const active = selectedIds.includes(cat.id);
          return (
            <span key={cat.id} className="inline-flex items-center">
              <button
                type="button"
                onClick={() => toggle(cat.id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors",
                  active
                    ? "border-transparent text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                )}
                style={active && cat.cor ? { backgroundColor: cat.cor } : undefined}
              >
                {active && <Check className="h-3.5 w-3.5" />}
                {cat.nome}
              </button>
              {manage && (
                <button
                  type="button"
                  onClick={() => remover(cat.id)}
                  disabled={pending}
                  className="ml-0.5 rounded-full p-1 text-destructive hover:bg-destructive/10"
                  aria-label={`Excluir categoria ${cat.nome}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          );
        })}
        {all.length === 0 && (
          <span className="text-sm text-muted-foreground">
            Nenhuma categoria. Crie a primeira abaixo.
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Nova categoria (cadastro rápido)"
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
          className="h-9"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={adicionar}
          disabled={pending || !novo.trim()}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add
        </Button>
        <Button
          type="button"
          size="sm"
          variant={manage ? "secondary" : "ghost"}
          onClick={() => setManage((v) => !v)}
          title="Gerenciar categorias"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
      {manage && (
        <p className="text-xs text-muted-foreground">
          Modo gerenciar ativo: clique na lixeira ao lado da categoria para
          removê-la do sistema.
        </p>
      )}
    </div>
  );
}
