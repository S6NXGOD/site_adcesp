"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  FileDown,
  User,
  MapPin,
  Phone,
  GraduationCap,
  FileSignature,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiliacaoAnexos } from "@/components/public/filiacao-anexos";
import { filiacaoSchema, type FiliacaoInput } from "@/lib/validations";
import {
  CAMPUS_OPTIONS,
  CENTRO_OPTIONS,
  UF_BRASIL,
  TEXTO_CONTRIBUICAO,
  TEXTO_LGPD,
} from "@/lib/filiacao";
import { formatCpf, formatCep } from "@/lib/utils";
import { solicitarFiliacao } from "@/app/actions/filiacao";
import { baixarPropostaFiliacao } from "@/lib/pdf-filiacao";

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
      <Icon className="h-5 w-5 text-primary" /> {children}
    </h2>
  );
}

type Etapa = "form" | "anexos" | "concluido";

export function FiliacaoForm() {
  const [pending, startTransition] = useTransition();
  const [etapa, setEtapa] = useState<Etapa>("form");
  const [filiadoId, setFiliadoId] = useState<string | null>(null);
  const [dadosEnviados, setDadosEnviados] = useState<FiliacaoInput | null>(
    null
  );
  const [cepLoading, setCepLoading] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const form = useForm<FiliacaoInput>({
    resolver: zodResolver(filiacaoSchema),
    defaultValues: {
      nome: "",
      rg: "",
      cpf: "",
      dataNascimento: "",
      matricula: "",
      curso: "",
      endereco: "",
      numero: "",
      apto: "",
      cep: "",
      cidade: "Teresina",
      estado: "PI",
      telefone: "",
      celular: "",
      email: "",
      campus: "" as FiliacaoInput["campus"],
      centro: "" as FiliacaoInput["centro"],
      aceiteContribuicao: false,
      consentimentoLgpd: false,
    },
  });

  // ViaCEP: ao sair do campo CEP com 8 dígitos, preenche endereço/cidade/UF.
  async function buscarCep(cepRaw: string) {
    const cep = cepRaw.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error("CEP não encontrado.");
        return;
      }
      if (data.logradouro) form.setValue("endereco", data.logradouro);
      if (data.localidade)
        form.setValue("cidade", data.localidade, { shouldValidate: true });
      if (data.uf) form.setValue("estado", data.uf, { shouldValidate: true });
      form.setFocus("numero");
    } catch {
      toast.error("Não foi possível consultar o CEP.");
    } finally {
      setCepLoading(false);
    }
  }

  async function baixarPdf(dados: FiliacaoInput) {
    setGerandoPdf(true);
    try {
      await baixarPropostaFiliacao(dados);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Não foi possível gerar o PDF da proposta."
      );
    } finally {
      setGerandoPdf(false);
    }
  }

  function onSubmit(values: FiliacaoInput) {
    startTransition(async () => {
      const res = await solicitarFiliacao(values);
      if (res.success) {
        setFiliadoId(res.data?.id ?? null);
        setDadosEnviados(values);
        // Gera e baixa a ficha e então avança para o envio dos anexos.
        await baixarPdf(values);
        setEtapa("anexos");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(res.error);
      }
    });
  }

  // ------------------------------------------------------------------
  // ETAPA 3 — Conclusão
  // ------------------------------------------------------------------
  if (etapa === "concluido") {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900">
          Filiação enviada com sucesso!
        </h2>
        <p className="mt-2 text-muted-foreground">
          Recebemos sua ficha e os documentos anexados. A diretoria da ADCESP
          analisará o pedido e entrará em contato pelo e-mail informado.
        </p>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // ETAPA 2 — Anexos (aparece só após a geração/download do PDF)
  // ------------------------------------------------------------------
  if (etapa === "anexos" && filiadoId) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-900">
                Ficha gerada com sucesso! Assine o documento e anexe-o abaixo
                junto com as cópias exigidas.
              </p>
              {dadosEnviados && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 bg-white"
                  onClick={() => baixarPdf(dadosEnviados)}
                  disabled={gerandoPdf}
                >
                  {gerandoPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  Baixar a ficha novamente
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm sm:p-8">
          <SectionTitle icon={FileSignature}>
            Envio dos documentos
          </SectionTitle>
          <FiliacaoAnexos
            filiadoId={filiadoId}
            onConcluido={() => {
              setEtapa("concluido");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // ETAPA 1 — Formulário
  // ------------------------------------------------------------------
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 rounded-xl border bg-white p-5 shadow-sm sm:p-8"
      >
        {/* DADOS PESSOAIS */}
        <section>
          <SectionTitle icon={User}>Dados pessoais</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nome completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RG *</FormLabel>
                  <FormControl>
                    <Input placeholder="Documento de identidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                      value={field.value}
                      onChange={(e) => field.onChange(formatCpf(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dataNascimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de nascimento *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="matricula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl>
                    <Input placeholder="SIAPE / funcional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="curso"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Curso / Área de atuação</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Enfermagem, Direito..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* VÍNCULO UESPI */}
        <section>
          <SectionTitle icon={GraduationCap}>Vínculo com a UESPI</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="campus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campus *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o campus" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CAMPUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="centro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centro *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o centro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CENTRO_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* ENDEREÇO */}
        <section>
          <SectionTitle icon={MapPin}>Endereço</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-6">
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>CEP *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="00000-000"
                        inputMode="numeric"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(formatCep(e.target.value))
                        }
                        onBlur={() => buscarCep(field.value)}
                      />
                      {cepLoading && (
                        <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Preenche o endereço automaticamente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem className="sm:col-span-4">
                  <FormLabel>Endereço (logradouro) *</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, avenida..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input placeholder="Nº" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apto"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Complemento / Apto</FormLabel>
                  <FormControl>
                    <Input placeholder="Apto, bloco..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Cidade *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Estado (UF) *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UF_BRASIL.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* CONTATO */}
        <section>
          <SectionTitle icon={Phone}>Contato</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="celular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular / WhatsApp *</FormLabel>
                  <FormControl>
                    <Input placeholder="(86) 90000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone fixo</FormLabel>
                  <FormControl>
                    <Input placeholder="(86) 3000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="voce@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* CONSENTIMENTOS */}
        <section className="space-y-3 rounded-lg bg-slate-50 p-4">
          <FormField
            control={form.control}
            name="aceiteContribuicao"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v === true)}
                  />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel className="text-sm font-normal leading-snug text-slate-700">
                    {TEXTO_CONTRIBUICAO}
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="consentimentoLgpd"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v === true)}
                  />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel className="text-sm font-normal leading-snug text-slate-700">
                    {TEXTO_LGPD}
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </section>

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Gerar ficha de filiação
        </Button>
        <p className="-mt-4 text-center text-xs text-muted-foreground">
          Ao continuar, a ficha em PDF será gerada para você assinar e, em
          seguida, anexar os documentos.
        </p>
      </form>
    </Form>
  );
}
