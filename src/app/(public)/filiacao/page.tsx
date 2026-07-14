import type { Metadata } from "next";
import { PageHeader } from "@/components/public/page-header";
import { FiliacaoForm } from "@/components/public/filiacao-form";

export const metadata: Metadata = {
  title: "Filiação",
  description:
    "Filie-se à ADCESP. Preencha o formulário de solicitação de filiação online com segurança e em conformidade com a LGPD.",
};

export default function FiliacaoPage() {
  return (
    <>
      <PageHeader
        title="Filiação"
        description="Junte-se à ADCESP e fortaleça a luta coletiva pela valorização dos docentes da UESPI."
      />

      <section className="container max-w-3xl py-12">
        <FiliacaoForm />
      </section>
    </>
  );
}
