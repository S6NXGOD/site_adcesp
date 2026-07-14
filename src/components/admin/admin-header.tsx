"use client";

import { signOut } from "next-auth/react";
import { LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export function AdminHeader({
  nome,
  email,
  role,
  modulos,
}: {
  nome?: string | null;
  email?: string | null;
  role: string;
  modulos: string[];
}) {
  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <AdminMobileNav role={role} modulos={modulos} />
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-900">
            Bem-vindo(a), {nome ?? "Administrador"}
          </h2>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden items-center gap-2 text-sm text-slate-600 sm:flex">
          <UserCircle className="h-5 w-5" />
          <span className="hidden md:inline">{nome}</span>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
