"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ExternalLink, Pencil, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { alternarStatusArtigo, excluirArtigo } from "@/app/actions/artigos";

export function ArtigoRowActions({
  id,
  slug,
  publicado,
}: {
  id: string;
  slug: string;
  publicado: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const res = await alternarStatusArtigo(id);
      if (res.success) toast.success(res.message ?? "Feito.");
      else toast.error(res.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <Button asChild variant="ghost" size="sm" title="Ver no site">
        <a href={`/artigos/${slug}`} target="_blank" rel="noreferrer">
          <ExternalLink className="h-4 w-4" /> Ver
        </a>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        disabled={pending}
        title={publicado ? "Mover para rascunho" : "Publicar"}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : publicado ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        {publicado ? "Rascunho" : "Publicar"}
      </Button>
      <Button asChild variant="ghost" size="icon" title="Editar">
        <Link href={`/admin/artigos/${id}/editar`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <DeleteButton id={id} action={excluirArtigo} label="Excluir artigo" />
    </div>
  );
}
