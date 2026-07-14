"use client";

import { Download, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

type Documento = {
  id: string;
  tipo: "PRESTACAO_CONTAS" | "ENCAMINHAMENTO_ASSEMBLEIA";
  titulo: string;
  descricao: string | null;
  arquivoUrl: string;
  dataDocumento: Date;
};

function Lista({ docs }: { docs: Documento[] }) {
  if (docs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed bg-white p-12 text-center text-muted-foreground">
        Nenhum documento disponível nesta categoria.
      </p>
    );
  }
  return (
    <ul className="divide-y rounded-lg border bg-white">
      {docs.map((doc) => (
        <li
          key={doc.id}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-medium text-slate-900">{doc.titulo}</h3>
              {doc.descricao && (
                <p className="text-sm text-muted-foreground">{doc.descricao}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Documento de {formatDate(doc.dataDocumento)}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a href={doc.arquivoUrl} target="_blank" rel="noreferrer" download>
              <Download className="h-4 w-4" /> Baixar PDF
            </a>
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function TransparenciaTabs({ docs }: { docs: Documento[] }) {
  const contas = docs.filter((d) => d.tipo === "PRESTACAO_CONTAS");
  const assembleias = docs.filter(
    (d) => d.tipo === "ENCAMINHAMENTO_ASSEMBLEIA"
  );

  return (
    <Tabs defaultValue="contas">
      <TabsList>
        <TabsTrigger value="contas">
          Prestação de Contas ({contas.length})
        </TabsTrigger>
        <TabsTrigger value="assembleias">
          Encaminhamentos de Assembleia ({assembleias.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="contas" className="mt-6">
        <Lista docs={contas} />
      </TabsContent>
      <TabsContent value="assembleias" className="mt-6">
        <Lista docs={assembleias} />
      </TabsContent>
    </Tabs>
  );
}
