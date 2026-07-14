"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NoticiasSearch() {
  const router = useRouter();
  const params = useSearchParams();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const q = String(form.get("q") ?? "").trim();
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    router.push(`/noticias${sp.toString() ? `?${sp}` : ""}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2">
      <Input
        name="q"
        placeholder="Buscar notícias..."
        defaultValue={params.get("q") ?? ""}
      />
      <Button type="submit" size="icon" aria-label="Buscar">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
