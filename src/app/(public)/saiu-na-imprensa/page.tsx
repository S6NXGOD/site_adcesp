import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { PageHeader } from "@/components/public/page-header";
import { ClippingCard } from "@/components/public/clipping-card";
import { getClippingsPublicados } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Saiu na Imprensa",
  description:
    "Matérias sobre a ADCESP e os docentes da UESPI publicadas em veículos de comunicação.",
};

export const dynamic = "force-dynamic";

export default async function SaiuNaImprensaPage() {
  const clippings = await getClippingsPublicados();

  return (
    <>
      <PageHeader
        title="Saiu na Imprensa"
        description="A ADCESP na mídia: matérias sobre o sindicato e os docentes da UESPI publicadas em veículos de comunicação."
      />

      <section className="container py-12">
        {clippings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clippings.map((c) => (
              <ClippingCard key={c.id} clipping={c} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-white p-16 text-center">
            <Newspaper className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-muted-foreground">
              Ainda não há matérias cadastradas.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
