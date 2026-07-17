import type { Metadata } from "next";
import { PageHeader } from "@/components/public/page-header";
import { ArtigoCard } from "@/components/public/artigo-card";
import { getArtigos } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Artigos",
  description:
    "Produção autoral dos docentes da UESPI: artigos, análises e textos de opinião publicados pela ADCESP.",
};

export const dynamic = "force-dynamic";

export default async function ArtigosPage() {
  const artigos = await getArtigos();

  return (
    <>
      <PageHeader
        title="Artigos"
        description="Produção autoral dos docentes da UESPI — análises, opinião e reflexões sobre educação, ciência e o movimento sindical."
      />

      <section className="container py-12">
        {artigos.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-white p-16 text-center text-muted-foreground">
            Nenhum artigo publicado ainda.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {artigos.map((a) => (
              <ArtigoCard key={a.id} artigo={a} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
