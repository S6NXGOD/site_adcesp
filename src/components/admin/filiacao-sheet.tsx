"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  ExternalLink,
  Check,
  X,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  FileSearch,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatCpf, formatCep, formatDate } from "@/lib/utils";
import { campusLabel, centroLabel } from "@/lib/filiacao";
import { moderarFiliacao } from "@/app/actions/filiacao";

export type FiliadoDetalhe = {
  id: string;
  nome: string;
  rg: string;
  cpf: string;
  dataNascimento: Date;
  matricula: string | null;
  curso: string | null;
  endereco: string;
  numero: string | null;
  apto: string | null;
  cep: string;
  cidade: string;
  estado: string;
  telefone: string | null;
  celular: string;
  email: string;
  campus: string;
  centro: string;
  caminhoArquivoFicha: string | null;
  caminhoArquivoIdentificacao: string | null;
  caminhoArquivoContracheque: string | null;
  aceiteContribuicao: boolean;
  consentimentoLgpd: boolean;
  status: "PENDENTE" | "APROVADO" | "REJEITADO";
  observacoes: string | null;
  dataFiliacao: Date;
};

const statusBadge = {
  PENDENTE: { label: "Pendente", variant: "warning" as const },
  APROVADO: { label: "Aprovado", variant: "success" as const },
  REJEITADO: { label: "Rejeitado", variant: "destructive" as const },
};

// O banco já guarda o caminho da API (/api/files/filiacao/...), que exige
// sessão do painel para ser servido.
function arquivoUrl(caminho: string) {
  return caminho;
}

function Dado({ label, valor }: { label: string; valor?: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium text-slate-900">
        {valor || "—"}
      </dd>
    </div>
  );
}

/** Visualizador embutido de um documento (iframe + abrir/baixar). */
function Visualizador({ path, label }: { path: string | null; label: string }) {
  if (!path) {
    return (
      <div className="flex h-[380px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-slate-50 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p className="text-sm">Documento não anexado.</p>
      </div>
    );
  }
  const url = arquivoUrl(path);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <FileText className="h-4 w-4 text-primary" /> {label}
        </span>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" /> Abrir
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={url} download>
              <Download className="h-4 w-4" /> Baixar
            </a>
          </Button>
        </div>
      </div>
      <iframe
        src={url}
        title={label}
        className="h-[380px] w-full rounded-lg border bg-white"
      />
    </div>
  );
}

export function FiliacaoSheet({ filiado }: { filiado: FiliadoDetalhe }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [rejeitando, setRejeitando] = useState(false);
  const [motivo, setMotivo] = useState(filiado.observacoes ?? "");

  const s = statusBadge[filiado.status];
  const pendente = filiado.status === "PENDENTE";

  const docs = [
    { key: "ficha", label: "Ficha assinada", path: filiado.caminhoArquivoFicha },
    {
      key: "identificacao",
      label: "Identificação",
      path: filiado.caminhoArquivoIdentificacao,
    },
    {
      key: "contracheque",
      label: "Contracheque",
      path: filiado.caminhoArquivoContracheque,
    },
  ];
  const anexados = docs.filter((d) => d.path).length;
  const totalDocs = docs.length;

  function decidir(status: "APROVADO" | "REJEITADO") {
    if (status === "REJEITADO" && !motivo.trim()) {
      toast.error("Informe o motivo da rejeição.");
      return;
    }
    startTransition(async () => {
      const res = await moderarFiliacao(filiado.id, status, motivo.trim());
      if (res.success) {
        toast.success(res.message ?? "Atualizado.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={pendente ? "default" : "outline"} size="sm">
          <FileSearch className="h-4 w-4" />
          {pendente ? "Auditar" : "Visualizar"}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl"
      >
        <SheetHeader className="pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <SheetTitle>{filiado.nome}</SheetTitle>
            <Badge variant={s.variant}>{s.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Solicitado em {formatDate(filiado.dataFiliacao)} • Auditoria
            documental
          </p>
        </SheetHeader>

        {/* Dados do professor — duas colunas */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Dados do professor
          </h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Dado label="RG" valor={filiado.rg} />
            <Dado label="CPF" valor={formatCpf(filiado.cpf)} />
            <Dado
              label="Data de nascimento"
              valor={formatDate(filiado.dataNascimento)}
            />
            <Dado label="Matrícula" valor={filiado.matricula} />
            <Dado label="Curso" valor={filiado.curso} />
            <Dado label="Campus" valor={campusLabel[filiado.campus]} />
            <Dado label="Centro" valor={centroLabel[filiado.centro]} />
            <Dado label="E-mail" valor={filiado.email} />
            <Dado label="Celular" valor={filiado.celular} />
            <Dado label="Telefone" valor={filiado.telefone} />
            <Dado
              label="Endereço"
              valor={`${filiado.endereco}${
                filiado.numero ? `, ${filiado.numero}` : ""
              }${filiado.apto ? ` - ${filiado.apto}` : ""}`}
            />
            <Dado label="CEP" valor={formatCep(filiado.cep)} />
            <Dado label="Cidade / UF" valor={`${filiado.cidade} / ${filiado.estado}`} />
          </dl>

          {/* Consentimentos */}
          <div className="mt-4 flex flex-wrap gap-4 rounded-lg bg-slate-50 p-3 text-xs">
            <span className="flex items-center gap-1">
              {filiado.aceiteContribuicao ? (
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-destructive" />
              )}
              Contribuição confederativa
            </span>
            <span className="flex items-center gap-1">
              {filiado.consentimentoLgpd ? (
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-destructive" />
              )}
              Consentimento LGPD
            </span>
          </div>
        </div>

        {/* Auditoria documental */}
        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Documentos anexados
            <Badge variant={anexados === totalDocs ? "success" : "warning"}>
              {anexados}/{totalDocs}
            </Badge>
          </h3>

          <Tabs defaultValue="ficha">
            <TabsList className="grid w-full grid-cols-3">
              {docs.map((d) => (
                <TabsTrigger key={d.key} value={d.key} className="text-xs">
                  {d.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {docs.map((d) => (
              <TabsContent key={d.key} value={d.key} className="mt-3">
                <Visualizador path={d.path} label={d.label} />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Decisão */}
        <div className="mt-8 border-t pt-5">
          {pendente ? (
            <>
              {rejeitando && (
                <div className="mb-4">
                  <Label htmlFor="motivo">Motivo da rejeição *</Label>
                  <Textarea
                    id="motivo"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={3}
                    placeholder="Ex: documentação ilegível, dados divergentes, contracheque desatualizado..."
                    autoFocus
                  />
                </div>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                {!rejeitando ? (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => setRejeitando(true)}
                      disabled={pending}
                    >
                      <X className="h-4 w-4" /> Rejeitar Filiação
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => decidir("APROVADO")}
                      disabled={pending}
                    >
                      {pending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Aprovar Filiação
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setRejeitando(false)}
                      disabled={pending}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => decidir("REJEITADO")}
                      disabled={pending}
                    >
                      {pending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      Confirmar rejeição
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <p className="font-medium text-slate-900">
                Filiação {s.label.toLowerCase()}.
              </p>
              {filiado.observacoes && (
                <p className="mt-1 text-muted-foreground">
                  <span className="font-medium">Observações:</span>{" "}
                  {filiado.observacoes}
                </p>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
