"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type Membro = {
  cargo: string;
  nome: string;
  foto?: string;
  email?: string;
};

/**
 * Editor dinâmico de membros (cargo + nome + foto + email).
 * Serializa a lista em um input hidden (name) como JSON, consumido pela
 * Server Action.
 */
export function MembrosEditor({
  name = "membrosJson",
  defaultValue = [],
}: {
  name?: string;
  defaultValue?: Membro[];
}) {
  const [membros, setMembros] = useState<Membro[]>(
    defaultValue.length ? defaultValue : [{ cargo: "", nome: "" }]
  );

  function update(i: number, patch: Partial<Membro>) {
    setMembros((m) => m.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  }
  function add() {
    setMembros((m) => [...m, { cargo: "", nome: "" }]);
  }
  function remove(i: number) {
    setMembros((m) => m.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(membros)} />
      {membros.map((m, i) => (
        <div
          key={i}
          className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <Input
            placeholder="Cargo (ex: Coordenador Geral)"
            value={m.cargo}
            onChange={(e) => update(i, { cargo: e.target.value })}
          />
          <Input
            placeholder="Nome do(a) professor(a)"
            value={m.nome}
            onChange={(e) => update(i, { nome: e.target.value })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => remove(i)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Input
            placeholder="URL da foto (opcional)"
            value={m.foto ?? ""}
            onChange={(e) => update(i, { foto: e.target.value })}
            className="sm:col-span-1"
          />
          <Input
            placeholder="E-mail (opcional)"
            value={m.email ?? ""}
            onChange={(e) => update(i, { email: e.target.value })}
            className="sm:col-span-2"
          />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4" /> Adicionar membro
      </Button>
    </div>
  );
}
