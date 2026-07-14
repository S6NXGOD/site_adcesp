import Link from "next/link";
import {
  Users,
  Newspaper,
  CalendarDays,
  Vote,
  ArrowRight,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { campusLabel } from "@/lib/filiacao";

export const dynamic = "force-dynamic";

async function getMetrics() {
  try {
    const [
      filiadosPendentes,
      totalFiliados,
      totalNoticias,
      proximosEventos,
      eleicoesAtivas,
      ultimasNoticias,
      filiacoesRecentes,
    ] = await Promise.all([
      prisma.filiado.count({ where: { status: "PENDENTE" } }),
      prisma.filiado.count({ where: { status: "APROVADO" } }),
      prisma.noticia.count(),
      prisma.evento.count({ where: { dataInicio: { gte: new Date() } } }),
      prisma.eleicao.count({ where: { status: "EM_ANDAMENTO" } }),
      prisma.noticia.findMany({
        orderBy: { criadoEm: "desc" },
        take: 5,
      }),
      prisma.filiado.findMany({
        where: { status: "PENDENTE" },
        orderBy: { criadoEm: "desc" },
        take: 5,
      }),
    ]);
    return {
      filiadosPendentes,
      totalFiliados,
      totalNoticias,
      proximosEventos,
      eleicoesAtivas,
      ultimasNoticias,
      filiacoesRecentes,
      dbOk: true,
    };
  } catch {
    return {
      filiadosPendentes: 0,
      totalFiliados: 0,
      totalNoticias: 0,
      proximosEventos: 0,
      eleicoesAtivas: 0,
      ultimasNoticias: [],
      filiacoesRecentes: [],
      dbOk: false,
    };
  }
}

export default async function DashboardPage() {
  const m = await getMetrics();

  const cards = [
    {
      label: "Filiações pendentes",
      value: m.filiadosPendentes,
      icon: Users,
      href: "/admin/filiacoes",
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Filiados ativos",
      value: m.totalFiliados,
      icon: Users,
      href: "/admin/filiacoes",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Notícias publicadas",
      value: m.totalNoticias,
      icon: Newspaper,
      href: "/admin/noticias",
      color: "text-sky-600 bg-sky-50",
    },
    {
      label: "Próximos eventos",
      value: m.proximosEventos,
      icon: CalendarDays,
      href: "/admin/eventos",
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Eleições em andamento",
      value: m.eleicoesAtivas,
      icon: Vote,
      href: "/admin/eleicoes",
      color: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div>
      <PageTitle
        title="Dashboard"
        description="Visão geral da ADCESP"
      />

      {!m.dbOk && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Não foi possível conectar ao banco de dados. Verifique se o
          PostgreSQL está em execução e se a variável <code>DATABASE_URL</code>{" "}
          está correta no arquivo <code>.env</code>.
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
          >
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}
            >
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {c.value}
            </p>
            <p className="text-xs text-muted-foreground sm:text-sm">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Últimas notícias */}
        <section className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold text-slate-900">Últimas notícias</h2>
            <Link
              href="/admin/noticias"
              className="flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
            >
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {m.ultimasNoticias.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma notícia cadastrada.
            </p>
          ) : (
            <ul className="divide-y">
              {m.ultimasNoticias.map((n) => (
                <li key={n.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {n.titulo}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDate(n.dataPublicacao)}
                    </p>
                  </div>
                  <Badge
                    variant={n.publicado ? "success" : "secondary"}
                    className="shrink-0"
                  >
                    {n.publicado ? "Publicada" : "Rascunho"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Filiações pendentes */}
        <section className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="min-w-0 truncate font-semibold text-slate-900">
              Filiações aguardando moderação
            </h2>
            <Link
              href="/admin/filiacoes"
              className="flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
            >
              Moderar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {m.filiacoesRecentes.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma filiação pendente.
            </p>
          ) : (
            <ul className="divide-y">
              {m.filiacoesRecentes.map((f) => (
                <li key={f.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {f.nome}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {campusLabel[f.campus] ?? f.campus}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-amber-600">
                    <Clock className="h-3 w-3" /> Pendente
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
