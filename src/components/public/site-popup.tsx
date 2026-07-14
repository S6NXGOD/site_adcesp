"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type PopupConfig = {
  id: string;
  imagem: string;
  linkUrl: string | null;
  tempoExibicao: number; // segundos; 0 = fechar manualmente
  version: number;
};

export function SitePopup({ config }: { config: PopupConfig | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!config) return;
    const key = `adcesp_popup_${config.id}_${config.version}`;
    if (window.localStorage.getItem(key)) return; // já visto (1ª visita)

    // Aparece logo após o carregamento.
    const abrir = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(abrir);
  }, [config]);

  // Fecha automaticamente após o tempo de exibição (se configurado).
  useEffect(() => {
    if (!open || !config || config.tempoExibicao <= 0) return;
    const t = setTimeout(() => fechar(), config.tempoExibicao * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, config]);

  if (!config) return null;

  function fechar() {
    setOpen(false);
    window.localStorage.setItem(
      `adcesp_popup_${config!.id}_${config!.version}`,
      "1"
    );
  }

  if (!open) return null;

  const Arte = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={config.imagem}
      alt="Comunicado ADCESP"
      className="block max-h-[86vh] w-auto max-w-[92vw] rounded-xl object-contain shadow-2xl"
    />
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70" onClick={fechar} />

      <div className="relative">
        <button
          type="button"
          onClick={fechar}
          className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg ring-1 ring-black/10 transition-colors hover:bg-slate-100"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {config.linkUrl ? (
          <a
            href={config.linkUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              window.localStorage.setItem(
                `adcesp_popup_${config.id}_${config.version}`,
                "1"
              );
            }}
          >
            {Arte}
          </a>
        ) : (
          Arte
        )}
      </div>
    </div>
  );
}
