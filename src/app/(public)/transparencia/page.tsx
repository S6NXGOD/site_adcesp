import type { Metadata } from "next";
import { PageHeader } from "@/components/public/page-header";
import { TransparenciaTabs } from "@/components/public/transparencia-tabs";
import { getDocumentosTransparencia } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Transparência",
  description:
    "Prestações de contas e encaminhamentos de assembleias da ADCESP. Acesso público aos documentos da entidade.",
};

export const revalidate = 300;

export default async function TransparenciaPage() {
  const docs = await getDocumentosTransparencia();

  return (
    <>
      <PageHeader
        title="Transparência"
        description="Acesso público às prestações de contas e aos encaminhamentos das assembleias da ADCESP."
      />
      <section className="container py-12">
        <TransparenciaTabs docs={docs} />
      </section>
    </>
  );
}
