import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { PageTitle } from "@/components/admin/page-title";
import { PerfilForm } from "@/components/admin/perfil-form";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  const usuario = session?.user
    ? await prisma.usuario.findUnique({
        where: { id: session.user.id },
        select: { nome: true, email: true },
      })
    : null;

  const perfil = {
    nome: usuario?.nome ?? "",
    email: usuario?.email ?? "",
  };

  return (
    <div>
      <PageTitle
        title="Meu Perfil"
        description="Gerencie seus dados de acesso: nome de exibição, e-mail e senha."
      />
      <PerfilForm perfil={perfil} />
    </div>
  );
}
