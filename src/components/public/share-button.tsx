"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* usuário cancelou */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" /> Link copiado!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" /> Compartilhar
        </>
      )}
    </button>
  );
}
