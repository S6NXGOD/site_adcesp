"use client";

import { useEffect } from "react";

/**
 * Registra o service worker do PWA com escopo restrito a /admin — assim o
 * app instalável existe apenas para o painel administrativo, não para o site
 * público.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator))
      return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/admin/" })
      .catch(() => {
        /* ignora falhas de registro (ex.: navegador sem suporte) */
      });
  }, []);

  return null;
}
