import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import { ContatosManager, type Contato } from "@/components/admin/contatos-manager";

export const dynamic = "force-dynamic";

async function getContatos(): Promise<Contato[]> {
  try {
    return await prisma.contatoWhatsapp.findMany({ orderBy: { ordem: "asc" } });
  } catch {
    return [];
  }
}

export default async function AdminContatoPage() {
  const contatos = await getContatos();
  return (
    <div>
      <PageTitle
        title="Contato (WhatsApp)"
        description="Setores do botão flutuante de contato exibido no site."
      />
      <div className="max-w-2xl">
        <ContatosManager contatos={contatos} />
      </div>
    </div>
  );
}
