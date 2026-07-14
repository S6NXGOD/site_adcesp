"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Loader2, ShieldCheck } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { MODULOS } from "@/lib/admin-modules";
import { salvarUsuario } from "@/app/actions/usuarios";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  ativo: boolean;
  modulos: string[];
};

export function UsuarioFormDialog({ usuario }: { usuario?: Usuario }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const editing = !!usuario;
  const [role, setRole] = useState<"ADMIN" | "EDITOR">(
    usuario?.role ?? "EDITOR"
  );
  const [modulos, setModulos] = useState<string[]>(usuario?.modulos ?? []);

  function toggleModulo(key: string) {
    setModulos((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("role", role);
    fd.set("modulos", JSON.stringify(modulos));
    startTransition(async () => {
      const res = await salvarUsuario(fd, usuario?.id);
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
          <Plus className="h-4 w-4" /> Novo usuário
        </Button>
      )}

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar usuário" : "Novo usuário"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" defaultValue={usuario?.nome} required />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={usuario?.email}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="senha">
              {editing ? "Nova senha (deixe em branco para manter)" : "Senha"}
            </Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              minLength={6}
              required={!editing}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="role">Papel (role)</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "EDITOR")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="ativo"
                value="true"
                defaultChecked={usuario?.ativo ?? true}
              />
              Ativo (pode acessar)
            </label>
          </div>

          {/* Permissões por módulo (apenas para EDITOR) */}
          {role === "ADMIN" ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              Administrador tem acesso a todos os módulos.
            </div>
          ) : (
            <div>
              <Label>Módulos que este usuário pode acessar</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border p-3">
                {MODULOS.map((m) => (
                  <label
                    key={m.key}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <Checkbox
                      checked={modulos.includes(m.key)}
                      onCheckedChange={() => toggleModulo(m.key)}
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
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
