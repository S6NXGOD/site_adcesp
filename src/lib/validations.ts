import { z } from "zod";
import { isValidCpf } from "@/lib/utils";
import { CAMPUS_VALUES, CENTRO_VALUES } from "@/lib/filiacao";

// ---------------------------------------------------------------------
// Filiação (formulário público) — conformidade LGPD
// ---------------------------------------------------------------------
const opcional = z.string().trim().max(150).optional();

export const filiacaoSchema = z.object({
  // Dados pessoais
  nome: z.string().trim().min(5, "Informe o nome completo.").max(150),
  rg: z.string().trim().min(4, "Informe um RG válido.").max(20),
  cpf: z.string().refine((v) => isValidCpf(v), { message: "CPF inválido." }),
  dataNascimento: z
    .string()
    .min(1, "Informe a data de nascimento.")
    .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Data inválida." })
    .refine(
      (v) => {
        const d = new Date(v);
        const hoje = new Date();
        const min = new Date();
        min.setFullYear(hoje.getFullYear() - 100);
        const max = new Date();
        max.setFullYear(hoje.getFullYear() - 16);
        return d >= min && d <= max;
      },
      { message: "Data de nascimento fora do intervalo permitido." }
    ),
  matricula: opcional,
  curso: opcional,

  // Endereço
  endereco: z.string().trim().min(3, "Informe o endereço."),
  numero: opcional,
  apto: opcional,
  cep: z
    .string()
    .refine((v) => /^\d{5}-?\d{3}$/.test(v), { message: "CEP inválido." }),
  cidade: z.string().trim().min(2, "Informe a cidade."),
  estado: z.string().trim().length(2, "UF inválida."),

  // Contato
  telefone: opcional,
  celular: z.string().trim().min(10, "Informe um celular válido."),
  email: z.string().trim().email("E-mail inválido."),

  // Vínculo UESPI
  campus: z.enum(CAMPUS_VALUES, {
    errorMap: () => ({ message: "Selecione o campus." }),
  }),
  centro: z.enum(CENTRO_VALUES, {
    errorMap: () => ({ message: "Selecione o centro." }),
  }),

  // Consentimentos obrigatórios
  aceiteContribuicao: z.boolean().refine((v) => v === true, {
    message: "É necessário aceitar o desconto da contribuição confederativa.",
  }),
  consentimentoLgpd: z.boolean().refine((v) => v === true, {
    message: "É necessário consentir com o tratamento de dados (LGPD).",
  }),
});
export type FiliacaoInput = z.infer<typeof filiacaoSchema>;

// ---------------------------------------------------------------------
// Notícia / Imprensa
// ---------------------------------------------------------------------
export const noticiaSchema = z.object({
  titulo: z.string().min(3, "Título muito curto."),
  slug: z.string().optional(),
  resumo: z.string().min(10, "Resumo muito curto."),
  conteudo: z.string().min(10, "Conteúdo muito curto."),
  imagemCapa: z.string().optional(),
  dataPublicacao: z.string().optional(),
  publicado: z.boolean().default(true),
  destaque: z.boolean().default(false),
});
export type NoticiaInput = z.infer<typeof noticiaSchema>;

// ---------------------------------------------------------------------
// Saiu na Imprensa (clipping de matérias externas)
// ---------------------------------------------------------------------
export const clippingSchema = z.object({
  titulo: z.string().trim().min(3, "Título muito curto."),
  urlExterna: z
    .string()
    .trim()
    .url("Informe um link válido (https://...)."),
  nomeVeiculo: z.string().trim().min(2, "Informe o veículo de comunicação."),
  dataPublicacao: z.string().min(1, "Informe a data de publicação."),
  caminhoImagemCapa: z.string().optional().or(z.literal("")),
  status: z.enum(["RASCUNHO", "PUBLICADO"]),
});
export type ClippingInput = z.infer<typeof clippingSchema>;

// ---------------------------------------------------------------------
// Evento
// ---------------------------------------------------------------------
export const eventoSchema = z.object({
  titulo: z.string().min(3, "Título muito curto."),
  descricao: z.string().min(10, "Descrição muito curta."),
  dataInicio: z.string().min(1, "Informe a data de início."),
  dataFim: z.string().optional(),
  local: z.string().optional(),
  imagem: z.string().optional(),
  linkInscricao: z.string().url("URL inválida.").optional().or(z.literal("")),
  publicado: z.boolean().default(true),
});
export type EventoInput = z.infer<typeof eventoSchema>;

// ---------------------------------------------------------------------
// Transparência
// ---------------------------------------------------------------------
export const transparenciaSchema = z.object({
  tipo: z.enum(["PRESTACAO_CONTAS", "ENCAMINHAMENTO_ASSEMBLEIA"]),
  titulo: z.string().min(3, "Título muito curto."),
  descricao: z.string().optional(),
  arquivoUrl: z.string().min(1, "Informe o arquivo (PDF)."),
  dataDocumento: z.string().min(1, "Informe a data do documento."),
});
export type TransparenciaInput = z.infer<typeof transparenciaSchema>;

// ---------------------------------------------------------------------
// Eleição
// ---------------------------------------------------------------------
export const eleicaoSchema = z.object({
  titulo: z.string().min(3, "Título muito curto."),
  slug: z.string().optional(), // biênio, ex: "2024-2026"
  status: z.enum(["AGUARDANDO", "EM_ANDAMENTO", "CONCLUIDO"]),
  descricao: z.string().optional(),
});
export type EleicaoInput = z.infer<typeof eleicaoSchema>;

export const chapaSchema = z.object({
  eleicaoId: z.string().min(1),
  nome: z.string().min(2, "Nome da chapa muito curto."),
  numero: z.coerce.number().int().min(1),
  slogan: z.string().optional(),
  logoUrl: z.string().optional(),
});
export type ChapaInput = z.infer<typeof chapaSchema>;

export const candidatoSchema = z.object({
  chapaId: z.string().min(1),
  nome: z.string().min(2, "Nome muito curto."),
  cargo: z.string().min(2, "Informe o cargo."),
  fotoUrl: z.string().optional(),
});
export type CandidatoInput = z.infer<typeof candidatoSchema>;

// ---------------------------------------------------------------------
// Coordenação / Diretoria
// ---------------------------------------------------------------------
export const coordenacaoSchema = z.object({
  tipo: z.enum(["ESTADUAL", "REGIONAL"]),
  nomeRegiao: z.string().optional(),
  descricao: z.string().optional(),
  membrosJson: z.array(
    z.object({
      cargo: z.string(),
      nome: z.string(),
      foto: z.string().optional(),
      email: z.string().optional(),
    })
  ),
});
export type CoordenacaoInput = z.infer<typeof coordenacaoSchema>;
