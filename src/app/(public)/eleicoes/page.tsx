import type { Metadata } from "next";
import {
  Vote,
  FileText,
  Download,
  Gavel,
  Users,
  Trophy,
  CalendarClock,
} from "lucide-react";
import { PageHeader } from "@/components/public/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ResultadoChart } from "@/components/public/resultado-chart";
import { getEleicoes } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Eleições",
  description:
    "Histórico das eleições da ADCESP por biênio: editais, regulamentos, comissão eleitoral, chapas e resultados.",
};

export const revalidate = 60;

type Calendario = { data: string; evento: string }[];
type VotoChapa = {
  chapaId: string;
  nome: string;
  numero: number;
  votos: number;
};

const statusBadge = {
  AGUARDANDO: { label: "Aguardando", variant: "warning" as const },
  EM_ANDAMENTO: { label: "Em andamento", variant: "success" as const },
  CONCLUIDO: { label: "Concluído", variant: "secondary" as const },
};

function SecaoTitulo({
  icon: Icon,
  children,
}: {
  icon: typeof FileText;
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
      <Icon className="h-4 w-4" /> {children}
    </h3>
  );
}

export default async function EleicoesPage() {
  const eleicoes = await getEleicoes();

  // EM_ANDAMENTO primeiro; depois o restante (já vem por data desc).
  const ordenadas = [
    ...eleicoes.filter((e) => e.status === "EM_ANDAMENTO"),
    ...eleicoes.filter((e) => e.status !== "EM_ANDAMENTO"),
  ];
  const abertoPorPadrao =
    ordenadas.find((e) => e.status === "EM_ANDAMENTO")?.id ??
    ordenadas[0]?.id;

  return (
    <>
      <PageHeader
        title="Eleições"
        description="Transparência no processo democrático da ADCESP. Consulte cada biênio: documentos oficiais, comissão eleitoral, chapas e resultados."
      />

      <section className="container py-12">
        {ordenadas.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-white p-16 text-center text-muted-foreground">
            Nenhuma eleição cadastrada até o momento.
          </p>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={abertoPorPadrao ? [abertoPorPadrao] : []}
            className="space-y-4"
          >
            {ordenadas.map((e) => {
              const s = statusBadge[e.status];
              const documentos = e.documentos;
              const comissao = e.comissao;
              const calendario = (e.calendarioJson as Calendario) ?? [];
              const resultado = e.resultado;
              const votos = (resultado?.votosChapasJson ??
                []) as unknown as VotoChapa[];
              const vencedora = e.chapas.find(
                (c) => c.id === resultado?.chapaVencedoraId
              );

              return (
                <AccordionItem
                  key={e.id}
                  value={e.id}
                  className={
                    e.status === "EM_ANDAMENTO"
                      ? "border-2 border-emerald-500"
                      : ""
                  }
                >
                  <AccordionTrigger>
                    <span className="flex flex-wrap items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Vote className="h-5 w-5" />
                      </span>
                      <span className="text-base font-semibold text-slate-900 sm:text-lg">
                        {e.titulo}
                      </span>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </span>
                  </AccordionTrigger>

                  <AccordionContent>
                    {/* CABEÇALHO */}
                    {e.descricao && (
                      <p className="mb-6 max-w-3xl text-base leading-relaxed text-slate-600">
                        {e.descricao}
                      </p>
                    )}

                    {/* CRONOGRAMA (se houver) */}
                    {calendario.length > 0 && (
                      <div className="mb-6">
                        <SecaoTitulo icon={CalendarClock}>
                          Cronograma
                        </SecaoTitulo>
                        <ol className="space-y-2 border-l-2 border-slate-200 pl-4">
                          {calendario.map((item, i) => (
                            <li key={i} className="relative">
                              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-white" />
                              <span className="text-xs font-semibold text-primary">
                                {item.data}
                              </span>
                              <span className="ml-2 text-sm text-slate-700">
                                {item.evento}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* DOCUMENTOS OFICIAIS */}
                    <div>
                      <SecaoTitulo icon={FileText}>
                        Documentos oficiais
                      </SecaoTitulo>
                      {documentos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum documento publicado.
                        </p>
                      ) : (
                        <ul className="overflow-hidden rounded-lg border">
                          {documentos.map((doc, i) => (
                            <li key={doc.id}>
                              <a
                                href={doc.caminhoArquivo}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary/5 ${
                                  i % 2 === 1 ? "bg-slate-50" : "bg-white"
                                }`}
                              >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                  <FileText className="h-5 w-5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-medium text-slate-900">
                                    {doc.titulo}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    PDF
                                  </span>
                                </span>
                                <span className="flex shrink-0 items-center gap-1.5 rounded-md border border-primary/30 px-3 py-1.5 text-sm font-medium text-primary">
                                  <Download className="h-4 w-4" /> Baixar
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* COMISSÃO ELEITORAL */}
                    <hr className="my-6 border-slate-200" />
                    <div>
                      <SecaoTitulo icon={Gavel}>Comissão eleitoral</SecaoTitulo>
                      {comissao.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Comissão a ser divulgada.
                        </p>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {comissao.map((m) => (
                            <div
                              key={m.id}
                              className="rounded-lg border bg-white p-3"
                            >
                              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                {m.cargo}
                              </p>
                              <p className="font-medium text-slate-900">
                                {m.nome}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CHAPAS CONCORRENTES */}
                    {e.chapas.length > 0 && (
                      <>
                        <hr className="my-6 border-slate-200" />
                        <div>
                          <SecaoTitulo icon={Users}>
                            Chapas concorrentes
                          </SecaoTitulo>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {e.chapas.map((chapa) => (
                              <div
                                key={chapa.id}
                                className="overflow-hidden rounded-xl border bg-white"
                              >
                                <div className="flex items-center gap-3 border-b bg-slate-50 p-3">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
                                    {chapa.numero}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-slate-900">
                                      {chapa.nome}
                                    </p>
                                    {chapa.slogan && (
                                      <p className="truncate text-xs text-muted-foreground">
                                        “{chapa.slogan}”
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {chapa.candidatos.length > 0 ? (
                                  <ul className="divide-y p-2">
                                    {chapa.candidatos.map((c) => (
                                      <li
                                        key={c.id}
                                        className="px-2 py-1.5 text-sm"
                                      >
                                        <span className="font-medium text-slate-900">
                                          {c.nome}
                                        </span>{" "}
                                        <span className="text-muted-foreground">
                                          — {c.cargo}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="p-3 text-sm text-muted-foreground">
                                    Candidatos a serem divulgados.
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* RESULTADO (concluída) */}
                    {e.status === "CONCLUIDO" && resultado && (
                      <>
                        <hr className="my-6 border-slate-200" />
                        <div>
                          <SecaoTitulo icon={Trophy}>Resultado</SecaoTitulo>
                          {vencedora && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-800">
                              <Trophy className="h-5 w-5" />
                              <span className="text-sm">
                                Chapa vencedora:{" "}
                                <strong>
                                  {vencedora.numero} - {vencedora.nome}
                                </strong>
                              </span>
                            </div>
                          )}
                          <div className="grid gap-6 lg:grid-cols-2">
                            <dl className="grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-lg border p-3">
                                <dt className="text-muted-foreground">
                                  Aptos a votar
                                </dt>
                                <dd className="text-lg font-bold text-slate-900">
                                  {resultado.totalAptos}
                                </dd>
                              </div>
                              <div className="rounded-lg border p-3">
                                <dt className="text-muted-foreground">
                                  Votantes
                                </dt>
                                <dd className="text-lg font-bold text-slate-900">
                                  {resultado.totalVotantes}
                                </dd>
                              </div>
                              <div className="rounded-lg border p-3">
                                <dt className="text-muted-foreground">
                                  Brancos
                                </dt>
                                <dd className="text-lg font-bold text-slate-900">
                                  {resultado.votosBrancos}
                                </dd>
                              </div>
                              <div className="rounded-lg border p-3">
                                <dt className="text-muted-foreground">Nulos</dt>
                                <dd className="text-lg font-bold text-slate-900">
                                  {resultado.votosNulos}
                                </dd>
                              </div>
                            </dl>
                            <ResultadoChart
                              votos={votos}
                              brancos={resultado.votosBrancos}
                              nulos={resultado.votosNulos}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </section>
    </>
  );
}
