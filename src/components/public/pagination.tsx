import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  baseUrl,
  extraParams = {},
}: {
  page: number;
  totalPages: number;
  baseUrl: string;
  extraParams?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const build = (p: number) => {
    const sp = new URLSearchParams({ ...extraParams, page: String(p) });
    return `${baseUrl}?${sp.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1">
      <Link
        href={build(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm",
          page === 1 && "pointer-events-none opacity-50"
        )}
      >
        <ChevronLeft className="h-4 w-4" /> Anterior
      </Link>

      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        const gap = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center">
            {gap && <span className="px-2 text-muted-foreground">…</span>}
            <Link
              href={build(p)}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm",
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              {p}
            </Link>
          </span>
        );
      })}

      <Link
        href={build(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm",
          page === totalPages && "pointer-events-none opacity-50"
        )}
      >
        Próxima <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
