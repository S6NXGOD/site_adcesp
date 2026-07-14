import { Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type Membro = {
  cargo: string;
  nome: string;
  foto?: string;
  email?: string;
};

export function MembroCard({
  m,
  regiao,
}: {
  m: Membro;
  regiao?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className="h-24 w-24 overflow-hidden rounded-full bg-slate-100 ring-2 ring-primary/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            m.foto ??
            `https://placehold.co/120x120/0d3b66/ffffff?text=${encodeURIComponent(
              m.nome?.charAt(0) ?? "?"
            )}`
          }
          alt={m.nome}
          className="h-full w-full object-cover"
        />
      </div>
      <Badge className="mt-3">{m.cargo}</Badge>
      <p className="mt-2 font-semibold text-slate-900">{m.nome}</p>
      {regiao && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {regiao}
        </p>
      )}
      {m.email && (
        <a
          href={`mailto:${m.email}`}
          className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <Mail className="h-3 w-3" /> {m.email}
        </a>
      )}
    </div>
  );
}
