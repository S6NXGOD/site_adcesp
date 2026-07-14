"use client";

import { useRef } from "react";
import { Bold, Italic, Heading, List, Link2, Quote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

/**
 * "Editor de texto rico" simplificado: um textarea com barra de ferramentas
 * que insere tags HTML básicas. O conteúdo é salvo como HTML e renderizado
 * no portal com a classe .prose-content. (Pode ser trocado por TipTap/Lexical.)
 */
export function RichTextEditor({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after = before) {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const selected = value.slice(s, e) || "texto";
    const next =
      value.slice(0, s) + before + selected + after + value.slice(e);
    ta.value = next;
    ta.focus();
    ta.setSelectionRange(s + before.length, s + before.length + selected.length);
  }

  const tools = [
    { icon: Bold, title: "Negrito", fn: () => wrap("<strong>", "</strong>") },
    { icon: Italic, title: "Itálico", fn: () => wrap("<em>", "</em>") },
    { icon: Heading, title: "Subtítulo", fn: () => wrap("<h3>", "</h3>") },
    { icon: List, title: "Lista", fn: () => wrap("<ul>\n<li>", "</li>\n</ul>") },
    { icon: Quote, title: "Citação", fn: () => wrap("<blockquote>", "</blockquote>") },
    {
      icon: Link2,
      title: "Link",
      fn: () => wrap('<a href="https://">', "</a>"),
    },
  ];

  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap gap-1 border-b bg-slate-50 p-1.5">
        {tools.map((t) => (
          <button
            key={t.title}
            type="button"
            title={t.title}
            onClick={t.fn}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-200"
          >
            <t.icon className="h-4 w-4" />
          </button>
        ))}
        <span className="ml-auto self-center pr-2 text-xs text-muted-foreground">
          HTML
        </span>
      </div>
      <Textarea
        ref={ref}
        name={name}
        defaultValue={defaultValue}
        rows={10}
        className="rounded-none border-0 focus-visible:ring-0"
        placeholder="Escreva o conteúdo... Use a barra de ferramentas para formatar."
      />
    </div>
  );
}
