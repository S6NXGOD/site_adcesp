import { Clock, Link2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/page-title";
import { PopupFormDialog } from "@/components/admin/popup-form-dialog";
import { PopupToggle } from "@/components/admin/popup-toggle";
import { DeleteButton } from "@/components/admin/delete-button";
import { excluirPopup } from "@/app/actions/popups";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function getPopups() {
  try {
    return await prisma.popup.findMany({ orderBy: { criadoEm: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminPopupPage() {
  const popups = await getPopups();

  return (
    <div>
      <PageTitle
        title="Gerenciar Pop-ups"
        description="Crie e gerencie pop-ups de imagem exibidos na abertura do site."
      >
        <PopupFormDialog />
      </PageTitle>

      <p className="mb-5 text-sm text-muted-foreground">
        Apenas um pop-up pode estar ativo por vez. O pop-up aparece na primeira
        visita do usuário ao site.
      </p>

      {popups.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-white p-12 text-center text-muted-foreground">
          Nenhum pop-up cadastrado.
        </p>
      ) : (
        <div className="space-y-3">
          {popups.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-4 rounded-xl border bg-white p-3 shadow-sm ${
                p.ativo ? "ring-2 ring-emerald-400" : ""
              }`}
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imagem}
                  alt={p.titulo}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{p.titulo}</p>
                  <Badge variant={p.ativo ? "success" : "warning"}>
                    {p.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {p.tempoExibicao > 0
                      ? `Fecha em ${p.tempoExibicao}s`
                      : "Fechar manualmente"}
                  </span>
                  {p.linkUrl && (
                    <span className="flex items-center gap-1 truncate">
                      <Link2 className="h-3 w-3" />
                      <span className="max-w-[200px] truncate">{p.linkUrl}</span>
                    </span>
                  )}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <PopupToggle id={p.id} ativo={p.ativo} />
                <PopupFormDialog
                  popup={{
                    id: p.id,
                    titulo: p.titulo,
                    imagem: p.imagem,
                    linkUrl: p.linkUrl,
                    tempoExibicao: p.tempoExibicao,
                  }}
                />
                <DeleteButton
                  id={p.id}
                  action={excluirPopup}
                  label="Excluir pop-up"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
