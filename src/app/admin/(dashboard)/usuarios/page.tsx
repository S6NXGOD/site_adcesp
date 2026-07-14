import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Mail, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { PageTitle } from "@/components/admin/page-title";
import { UsuarioFormDialog } from "@/components/admin/usuario-form-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { excluirUsuario } from "@/app/actions/usuarios";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function getUsuarios() {
  try {
    return await prisma.usuario.findMany({ orderBy: { criadoEm: "asc" } });
  } catch {
    return [];
  }
}

export default async function AdminUsuariosPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/admin/dashboard");

  const usuarios = await getUsuarios();

  return (
    <div>
      <PageTitle
        title="Usuários"
        description="Gerencie os acessos ao painel e defina os módulos de cada usuário."
      >
        <UsuarioFormDialog />
      </PageTitle>

      {usuarios.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-white p-12 text-center text-muted-foreground">
          Nenhum usuário cadastrado.
        </p>
      ) : (
        <div className="space-y-3">
          {usuarios.map((u) => (
            <div
              key={u.id}
              className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                    {u.role === "ADMIN" ? "Administrador" : "Editor"}
                  </Badge>
                  <Badge variant={u.ativo ? "success" : "destructive"}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <h3 className="mt-1 font-semibold text-slate-900">{u.nome}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex min-w-0 items-center gap-1">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {u.role === "ADMIN"
                      ? "Todos os módulos"
                      : `${u.modulos.length} módulo(s)`}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 border-t pt-2 sm:border-0 sm:pt-0">
                <UsuarioFormDialog
                  usuario={{
                    id: u.id,
                    nome: u.nome,
                    email: u.email,
                    role: u.role,
                    ativo: u.ativo,
                    modulos: u.modulos,
                  }}
                />
                <DeleteButton
                  id={u.id}
                  action={excluirUsuario}
                  label="Excluir usuário"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
