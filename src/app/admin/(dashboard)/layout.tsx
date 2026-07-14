import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-slate-50">
      <AdminSidebar
        role={session.user.role}
        modulos={session.user.modulos ?? []}
      />
      {/* min-w-0 é essencial: sem ele este flex item não encolhe abaixo do
          conteúdo e estoura a largura no mobile (overflow horizontal). */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          nome={session.user.name}
          email={session.user.email}
          role={session.user.role}
          modulos={session.user.modulos ?? []}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
