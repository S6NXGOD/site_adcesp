"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  FileText,
  Users,
  Network,
  History,
  Vote,
  Briefcase,
  BookOpen,
  PenLine,
  Video,
  MonitorSmartphone,
  MessageCircle,
  ShieldCheck,
  UserCog,
  Radio,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  adminDashboard,
  adminNavGroups,
  adminPerfil,
  type AdminItem,
} from "@/lib/site";
import { podeAcessarModulo } from "@/lib/admin-modules";
import { Logo } from "@/components/layout/logo";

const icons: Record<string, LucideIcon> = {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  FileText,
  Users,
  Network,
  History,
  Vote,
  Briefcase,
  BookOpen,
  PenLine,
  Video,
  MonitorSmartphone,
  MessageCircle,
  ShieldCheck,
  UserCog,
  Radio,
};

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: AdminItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = icons[item.icon] ?? LayoutDashboard;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-slate-300 hover:bg-slate-800"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.title}
    </Link>
  );
}

export function AdminNav({
  role,
  modulos,
  onNavigate,
}: {
  role: string;
  modulos: string[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  const grupos = adminNavGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) =>
        podeAcessarModulo(role, modulos, i.modulo, i.adminOnly)
      ),
    }))
    .filter((g) => g.items.length > 0);

  const [abertos, setAbertos] = useState<Set<string>>(
    () => new Set(grupos.map((g) => g.label))
  );

  function toggle(label: string) {
    setAbertos((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-200">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-4">
        <Logo variant="white" className="h-9 w-auto" />
        <p className="text-[10px] text-slate-400">Painel Administrativo</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <NavLink
          item={adminDashboard}
          active={isActive(adminDashboard.href)}
          onNavigate={onNavigate}
        />

        {grupos.map((g) => {
          const aberto = abertos.has(g.label);
          return (
            <div key={g.label} className="pt-2">
              <button
                type="button"
                onClick={() => toggle(g.label)}
                className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-300"
              >
                {g.label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    aberto ? "" : "-rotate-90"
                  )}
                />
              </button>
              {aberto && (
                <div className="mt-1 space-y-1">
                  {g.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      active={isActive(item.href)}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-800 p-3">
        <NavLink
          item={adminPerfil}
          active={isActive(adminPerfil.href)}
          onNavigate={onNavigate}
        />
        <Link
          href="/"
          onClick={onNavigate}
          className="block rounded-md px-3 py-2 text-xs text-slate-400 hover:bg-slate-800"
        >
          ← Voltar ao site público
        </Link>
      </div>
    </div>
  );
}
