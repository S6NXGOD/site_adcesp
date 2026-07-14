"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, KeyRound, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { atualizarPerfil, alterarSenha } from "@/app/actions/perfil";

export function PerfilForm({
  perfil,
}: {
  perfil: { nome: string; email: string };
}) {
  const router = useRouter();
  const [savingPerfil, startPerfil] = useTransition();
  const [savingSenha, startSenha] = useTransition();
  const [nome, setNome] = useState(perfil.nome);
  const [email, setEmail] = useState(perfil.email);

  function salvarPerfil(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startPerfil(async () => {
      const res = await atualizarPerfil({ nome, email });
      if (res.success) {
        toast.success(res.message ?? "Perfil atualizado.");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function salvarSenha(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const senhaAtual = String(fd.get("senhaAtual") ?? "");
    const novaSenha = String(fd.get("novaSenha") ?? "");
    const confirmar = String(fd.get("confirmar") ?? "");
    if (novaSenha !== confirmar) {
      toast.error("A confirmação não corresponde à nova senha.");
      return;
    }
    startSenha(async () => {
      const res = await alterarSenha({ senhaAtual, novaSenha });
      if (res.success) {
        toast.success(res.message ?? "Senha alterada.");
        form.reset();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
      {/* Dados do perfil */}
      <form
        onSubmit={salvarPerfil}
        className="space-y-4 rounded-xl border bg-white p-5 shadow-sm"
      >
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <UserRound className="h-5 w-5 text-primary" /> Dados do perfil
        </h2>

        <div>
          <Label htmlFor="nome">Nome de exibição</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={savingPerfil}>
          {savingPerfil ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar perfil
        </Button>
      </form>

      {/* Trocar senha */}
      <form
        onSubmit={salvarSenha}
        className="h-fit space-y-4 rounded-xl border bg-white p-5 shadow-sm"
      >
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <KeyRound className="h-5 w-5 text-primary" /> Alterar senha
        </h2>
        <div>
          <Label htmlFor="senhaAtual">Senha atual</Label>
          <Input id="senhaAtual" name="senhaAtual" type="password" required />
        </div>
        <div>
          <Label htmlFor="novaSenha">Nova senha</Label>
          <Input
            id="novaSenha"
            name="novaSenha"
            type="password"
            minLength={6}
            required
          />
        </div>
        <div>
          <Label htmlFor="confirmar">Confirmar nova senha</Label>
          <Input
            id="confirmar"
            name="confirmar"
            type="password"
            minLength={6}
            required
          />
        </div>
        <Button type="submit" variant="outline" disabled={savingSenha}>
          {savingSenha ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="h-4 w-4" />
          )}
          Alterar senha
        </Button>
      </form>
    </div>
  );
}
