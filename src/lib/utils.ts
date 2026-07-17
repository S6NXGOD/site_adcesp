import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Gera um slug amigável (URL) a partir de um texto. */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove marcas de acentuacao (diacriticos)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Palavras sem valor semântico para SEO — descartadas ao encurtar o slug.
 * Não removemos se isso esvaziar o slug (ver `slugifyUrl`).
 */
const STOPWORDS = new Set([
  "a", "ao", "aos", "as", "à", "às", "com", "como", "da", "das", "de", "do",
  "dos", "e", "em", "na", "nas", "no", "nos", "o", "os", "ou", "para", "pela",
  "pelas", "pelo", "pelos", "por", "que", "se", "sem", "sob", "sobre", "um",
  "uma", "uns", "umas", "num", "numa", "the", "of",
]);

/** Tamanho alvo de um slug de URL. Acima disso o Google trunca na SERP. */
export const SLUG_MAX = 60;

/**
 * Slug para URLs públicas: como o `slugify`, mas remove stopwords e corta em
 * até `max` caracteres **sem partir palavras** — evita URLs quilométricas.
 *
 * Usado só na geração de novos slugs; os já existentes ficam intactos.
 */
export function slugifyUrl(text: string, max = SLUG_MAX): string {
  const base = slugify(text);
  if (!base) return "";

  const palavras = base.split("-").filter(Boolean);
  const uteis = palavras.filter((p) => !STOPWORDS.has(p));
  // Se só sobraram stopwords (ex.: "A Casa"), mantém as originais.
  const fonte = uteis.length > 0 ? uteis : palavras;

  const out: string[] = [];
  for (const p of fonte) {
    if (out.length > 0 && [...out, p].join("-").length > max) break;
    out.push(p);
  }

  // Uma única palavra maior que o limite: corta no limite.
  const slug = out.join("-") || fonte[0].slice(0, max);
  return slug.replace(/^-+|-+$/g, "");
}

/** Formata data para pt-BR (dd/mm/aaaa). */
// ---------------------------------------------------------------------
// Datas "só dia" (sem hora) — ex.: data de publicação.
//
// Cuidado com fuso: `new Date().toISOString()` converte para UTC, então às
// 22h no Brasil (UTC-3) ele já devolve o dia SEGUINTE. E `new Date("2026-07-16")`
// é interpretado como meia-noite UTC, que no Brasil é dia 15 às 21h.
//
// Solução: no formulário usamos o dia LOCAL, e gravamos ao MEIO-DIA UTC —
// horário que cai no mesmo dia em qualquer fuso entre UTC-11 e UTC+11.
// ---------------------------------------------------------------------

/** Dia de hoje no fuso do usuário, como "yyyy-mm-dd". */
export function hojeLocal(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Converte um Date gravado no banco para "yyyy-mm-dd" (para o input date). */
export function paraInputDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

/** "yyyy-mm-dd" -> Date ao meio-dia UTC (estável em qualquer fuso). */
export function dataDeInput(valor: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim());
  if (!m) return new Date();
  return new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00.000Z`);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Formata data com mês por extenso (ex: 30 de junho de 2026). */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Máscara simples de CPF: 000.000.000-00 */
export function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Máscara de CEP: 00000-000 */
export function formatCep(cep: string): string {
  return cep
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

/** Valida CPF (dígitos verificadores). */
export function isValidCpf(cpf: string): boolean {
  const c = cpf.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i]) * (10 - i);
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== parseInt(c[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i]) * (11 - i);
  check = (sum * 10) % 11;
  if (check === 10) check = 0;
  return check === parseInt(c[10]);
}

/** Monta o link do WhatsApp (wa.me) a partir de um telefone e mensagem. */
export function whatsappLink(numero: string, mensagem?: string): string {
  let digits = numero.replace(/\D/g, "");
  // Adiciona o código do Brasil (55) se ainda não estiver presente.
  if (!digits.startsWith("55")) digits = `55${digits}`;
  const base = `https://wa.me/${digits}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

/** Extrai o ID de um vídeo do YouTube a partir de várias formas de URL. */
export function getYoutubeId(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
