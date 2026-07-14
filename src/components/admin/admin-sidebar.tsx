import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Barra lateral fixa do painel — visível apenas a partir de `md`. No mobile,
 * a navegação é oferecida pelo drawer (ver AdminMobileNav no cabeçalho).
 */
export function AdminSidebar({
  role,
  modulos,
}: {
  role: string;
  modulos: string[];
}) {
  return (
    <aside className="hidden w-64 shrink-0 border-r md:block">
      <AdminNav role={role} modulos={modulos} />
    </aside>
  );
}
