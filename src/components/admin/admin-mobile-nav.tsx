"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Gatilho + drawer de navegação para telas pequenas. Reutiliza o mesmo
 * AdminNav da barra lateral e fecha automaticamente ao trocar de rota.
 */
export function AdminMobileNav({
  role,
  modulos,
}: {
  role: string;
  modulos: string[];
}) {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();

  // Fecha o drawer sempre que a rota muda (após clicar num link).
  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger
        className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 max-w-[85vw] p-0">
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <AdminNav
          role={role}
          modulos={modulos}
          onNavigate={() => setAberto(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
