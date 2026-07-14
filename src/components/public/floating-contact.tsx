"use client";

import { useState } from "react";
import { X, Phone } from "lucide-react";
import { cn, whatsappLink } from "@/lib/utils";

export type ContatoSetor = {
  id: string;
  setor: string;
  numero: string;
  mensagem: string | null;
};

/** Logo do WhatsApp (glifo oficial) para o botão flutuante. */
function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.788-.995zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export function FloatingContact({ setores }: { setores: ContatoSetor[] }) {
  const [open, setOpen] = useState(false);

  if (setores.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Card de setores */}
      {open && (
        <div className="w-[calc(100vw-2rem)] max-w-xs overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-emerald-600 px-5 py-4 text-white">
            <p className="text-base font-bold">Fale conosco!</p>
            <p className="text-sm text-white/85">Escolha o setor abaixo</p>
          </div>
          <div className="space-y-2 p-3">
            {setores.map((s) => (
              <a
                key={s.id}
                href={whatsappLink(s.numero, s.mensagem ?? undefined)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <WhatsappIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">
                    {s.setor}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" /> {s.numero}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Botão flutuante (logo do WhatsApp) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-105",
          open ? "bg-slate-700" : "bg-[#25D366]"
        )}
        aria-label={open ? "Fechar contato" : "Fale conosco pelo WhatsApp"}
      >
        {open ? <X className="h-6 w-6" /> : <WhatsappIcon className="h-8 w-8" />}
      </button>
    </div>
  );
}
