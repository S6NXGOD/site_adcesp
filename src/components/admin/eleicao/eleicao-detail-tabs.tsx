"use client";

import { FileText, Gavel, Vote, Settings2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DadosGeraisForm,
  type EleicaoGeral,
} from "@/components/admin/eleicao/dados-gerais-form";
import { DocumentosTab } from "@/components/admin/eleicao/documentos-tab";
import { ComissaoTab } from "@/components/admin/eleicao/comissao-tab";
import { ChapasTab } from "@/components/admin/eleicao/chapas-tab";

type Documento = {
  id: string;
  titulo: string;
  caminhoArquivo: string;
  dataPublicacao: Date;
};
type Membro = { id: string; nome: string; cargo: string; ordem: number };
type Candidato = { id: string; nome: string; cargo: string };
type Chapa = {
  id: string;
  nome: string;
  numero: number;
  slogan: string | null;
  logoUrl: string | null;
  candidatos: Candidato[];
};
type Resultado = {
  votosBrancos: number;
  votosNulos: number;
  totalAptos: number;
  votosChapasJson: unknown;
} | null;

export type EleicaoCompleta = EleicaoGeral & {
  documentos: Documento[];
  comissao: Membro[];
  chapas: Chapa[];
  resultado: Resultado;
};

export function EleicaoDetailTabs({ eleicao }: { eleicao: EleicaoCompleta }) {
  return (
    <Tabs defaultValue="geral">
      <TabsList className="flex-wrap">
        <TabsTrigger value="geral">
          <Settings2 className="h-4 w-4" /> Dados Gerais
        </TabsTrigger>
        <TabsTrigger value="documentos">
          <FileText className="h-4 w-4" /> Documentos ({eleicao.documentos.length})
        </TabsTrigger>
        <TabsTrigger value="comissao">
          <Gavel className="h-4 w-4" /> Comissão ({eleicao.comissao.length})
        </TabsTrigger>
        <TabsTrigger value="chapas">
          <Vote className="h-4 w-4" /> Chapas ({eleicao.chapas.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="geral" className="mt-6">
        <DadosGeraisForm eleicao={eleicao} />
      </TabsContent>

      <TabsContent value="documentos" className="mt-6">
        <DocumentosTab
          eleicaoId={eleicao.id}
          documentos={eleicao.documentos}
        />
      </TabsContent>

      <TabsContent value="comissao" className="mt-6">
        <ComissaoTab eleicaoId={eleicao.id} comissao={eleicao.comissao} />
      </TabsContent>

      <TabsContent value="chapas" className="mt-6">
        <ChapasTab
          eleicaoId={eleicao.id}
          chapas={eleicao.chapas}
          resultado={eleicao.resultado}
        />
      </TabsContent>
    </Tabs>
  );
}
