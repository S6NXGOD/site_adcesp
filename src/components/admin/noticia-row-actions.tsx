"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  ExternalLink,
  Pencil,
  Eye,
  EyeOff,
  Star,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  alternarPublicacao,
  alternarDestaque,
  excluirNoticia,
} from "@/app/actions/noticias";

export function NoticiaRowActions({
  id,
  slug,
  publicado,
  destaque,
}: {
  id: string;
  slug: string;
  publicado: boolean;
  destaque: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const publicLink = `/noticias/${slug}`;

  function run(fn: () => Promise<{ success: boolean; message?: string; error?: string }>) {
    startTransition(async () => {
      const res = await fn();
      if (res.success) toast.success(res.message ?? "Feito.");
      else toast.error(res.error ?? "Erro.");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button
        asChild
        variant="ghost"
        size="sm"
        title="Ver no site"
        disabled={!publicado}
      >
        <a href={publicLink} target="_blank" rel="noreferrer">
          <ExternalLink className="h-4 w-4" /> Ver
        </a>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => run(() => alternarPublicacao(id))}
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

      <Button
        variant="ghost"
        size="icon"
        onClick={() => run(() => alternarDestaque(id))}
        disabled={pending}
        title={destaque ? "Remover do carrossel" : "Adicionar ao carrossel"}
      >
        <Star
          className={
            destaque ? "h-4 w-4 fill-amber-400 text-amber-500" : "h-4 w-4"
          }
        />
      </Button>

      <Button asChild variant="ghost" size="icon" title="Editar">
        <Link href={`/admin/noticias/${id}/editar`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>

      <DeleteButton id={id} action={excluirNoticia} label="Excluir notícia" />
    </div>
  );
}
