"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { alternarAtivoPopup } from "@/app/actions/popups";

export function PopupToggle({ id, ativo }: { id: string; ativo: boolean }) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const res = await alternarAtivoPopup(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.error);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {ativo ? (
        <Eye className="h-4 w-4 text-emerald-600" />
      ) : (
        <EyeOff className="h-4 w-4 text-slate-400" />
      )}
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        role="switch"
        aria-checked={ativo}
        aria-label={ativo ? "Desativar pop-up" : "Ativar pop-up"}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60",
          ativo ? "bg-red-600" : "bg-slate-300"
        )}
      >
        {pending ? (
          <Loader2 className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
        ) : (
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
              ativo ? "left-[22px]" : "left-0.5"
            )}
          />
        )}
      </button>
    </div>
  );
}
