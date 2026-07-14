import type { Metadata } from "next";
import { Users, MapPin, Building2 } from "lucide-react";
import { PageHeader } from "@/components/public/page-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MembroCard, type Membro } from "@/components/public/membro-card";
import { getCoordenacoes } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Coordenações",
  description:
    "Estrutura de Coordenação Estadual e Coordenações Regionais da ADCESP nos campi da UESPI.",
};

export const revalidate = 600;

export default async function CoordenacoesPage() {
  const coordenacoes = await getCoordenacoes();
  const estaduais = coordenacoes.filter((c) => c.tipo === "ESTADUAL");
  const regionais = coordenacoes.filter((c) => c.tipo === "REGIONAL");

  return (
    <>
      <PageHeader
        title="Coordenações"
        description="A estrutura de Coordenação Estadual e as Coordenações Regionais da ADCESP nos campi da UESPI."
      />

      <section className="container py-12">
        <div className="mb-8 flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-slate-900">
            Estrutura de Coordenações
          </h2>
        </div>

        <Tabs defaultValue="estadual">
          <TabsList>
            <TabsTrigger value="estadual">
              <Building2 className="h-4 w-4" /> Coordenação Estadual
            </TabsTrigger>
            <TabsTrigger value="regional">
              <MapPin className="h-4 w-4" /> Coordenações Regionais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estadual" className="mt-6">
            {estaduais.length === 0 ? (
              <p className="rounded-lg border border-dashed bg-white p-10 text-center text-muted-foreground">
                Coordenação estadual não cadastrada.
              </p>
            ) : (
              estaduais.map((c) => (
                <div key={c.id} className="mb-8">
                  {c.descricao && (
                    <p className="mb-4 text-slate-600">{c.descricao}</p>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {(c.membrosJson as unknown as Membro[]).map((m, i) => (
                      <MembroCard key={i} m={m} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="regional" className="mt-6">
            {regionais.length === 0 ? (
              <p className="rounded-lg border border-dashed bg-white p-10 text-center text-muted-foreground">
                Nenhuma coordenação regional cadastrada.
              </p>
            ) : (
              <div className="space-y-8">
                {regionais.map((c) => (
                  <div key={c.id}>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <MapPin className="h-5 w-5 text-primary" />
                      {c.nomeRegiao}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {(c.membrosJson as unknown as Membro[]).map((m, i) => (
                        <MembroCard
                          key={i}
                          m={m}
                          regiao={c.nomeRegiao ?? undefined}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}
