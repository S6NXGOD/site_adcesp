"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Cat = { id: string; nome: string; slug: string; cor: string | null };

/**
 * Chips de filtro por categoria cadastrada para as listagens de notícias
 * (admin e público). Baseado em query params, preservando os demais (ex.: busca).
 */
export function NoticiaFiltros({ categorias }: { categorias: Cat[] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const catAtual = params.get("categoria") ?? "";

  function href(categoria: string | null) {
    const sp = new URLSearchParams(params.toString());
    sp.delete("page"); // reinicia a paginação ao trocar de filtro
    if (categoria) sp.set("categoria", categoria);
    else sp.delete("categoria");
    const qs = sp.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
    );

  if (categorias.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={href(null)} className={chip(catAtual === "")}>
        Todas as categorias
      </Link>
      {categorias.map((c) => (
        <Link
          key={c.id}
          href={href(c.slug)}
          className={chip(catAtual === c.slug)}
        >
          {c.nome}
        </Link>
      ))}
    </div>
  );
}
